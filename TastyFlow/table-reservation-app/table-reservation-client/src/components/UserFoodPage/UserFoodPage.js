import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Invoice from "../Invoice/Invoice";
import './UserFoodPage.css';
import { toast } from "react-toastify";

const UserFoodPage = () => {
  const { userId } = useParams();
  const [foods, setFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState(null);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [invoiceId, setInvoiceId] = useState(null);
  const [isSelectionSaved, setIsSelectionSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [addedFoods, setAddedFoods] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    // Fetch food items
    fetch("http://localhost:5000/api/food/list")
      .then((response) => response.json())
      .then((data) => setFoods(data.data))
      .catch((err) => console.error("Error fetching food items:", err));

    const token = localStorage.getItem('token');

    if (token) {
      fetch(`http://localhost:5000/api/users/admin/getuser/${userId}`, {
        method: 'GET',
        headers: {
          'auth-token': token,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("User Data:", data); // Debugging
          setUser(data);

          // Filter succeeded payments and set reservations
          const succeededPayments = data.payments.filter(
            (payment) => payment.status === "succeeded" && !payment.deducted
          );

          // Ensure tableNumber and slotTime are included
          const reservationsWithTableInfo = succeededPayments.map((payment) => ({
            reservationId: payment.reservationId,
            tableNumber: payment.tableNumber,
            slotTime: payment.slotTime,
          }));

          console.log("Reservations:", reservationsWithTableInfo); // Debugging
          setReservations(reservationsWithTableInfo);
        })
        .catch((err) => console.error("Error fetching user data:", err));
    } else {
      console.error("No token found");
    }
  }, [userId]);

  // Filter foods based on search term
  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add food to user's selection
  const addFoodToUser = (food) => {
    setSelectedFoods((prev) => {
      const existingFoodIndex = prev.findIndex((f) => f.foodId === food._id);
      if (existingFoodIndex > -1) return prev;
      const updatedFoods = [
        ...prev,
        { foodId: food._id, name: food.name, price: food.price, quantity: 1 },
      ];
      updateTotal(updatedFoods);
      return updatedFoods;
    });
    setAddedFoods((prev) => [...prev, food._id]);
  };

  // Update total price
  const updateTotal = (foods) => {
    const total = foods.reduce((sum, food) => sum + food.price * food.quantity, 0);
    setTotal(total);
  };

  // Increase food quantity
  const increaseQuantity = (foodId) => {
    setSelectedFoods((prev) => {
      const updatedFoods = prev.map((food) =>
        food.foodId === foodId ? { ...food, quantity: food.quantity + 1 } : food
      );
      updateTotal(updatedFoods);
      return updatedFoods;
    });
  };

  // Decrease food quantity
  const decreaseQuantity = (foodId) => {
    setSelectedFoods((prev) => {
      const updatedFoods = prev
        .map((food) =>
          food.foodId === foodId && food.quantity > 0
            ? { ...food, quantity: food.quantity - 1 }
            : food
        )
        .filter((food) => food.quantity > 0);
      if (updatedFoods.length < prev.length) {
        setAddedFoods((prevAdded) => prevAdded.filter((id) => id !== foodId));
      }
      updateTotal(updatedFoods);
      return updatedFoods;
    });
  };

  // Generate invoice
  const generateInvoice = () => {
    if (!isSelectionSaved) {
      toast.error("Please click 'Save Selection' first.");
      return;
    }
  
    const cgstAmount = total * 0.025;
    const sgstAmount = total * 0.025;
    const totalBeforeRoundOff = total + cgstAmount + sgstAmount;
    const roundOffAmount = Math.round(totalBeforeRoundOff) - totalBeforeRoundOff;
    const finalAmount = (totalBeforeRoundOff + roundOffAmount).toFixed(2);
  
    const invoiceData = {
      userId: userId,
      foods: selectedFoods.map((food) => ({
        foodId: food.foodId,
        name: food.name,
        price: food.price,
        quantity: food.quantity,
      })),
      totalAmount: finalAmount,
      cgst: cgstAmount.toFixed(2),
      sgst: sgstAmount.toFixed(2),
      roundOff: roundOffAmount.toFixed(2),
      ...(selectedReservation && { reservationId: selectedReservation.reservationId }),
    };
  
    console.log("Invoice data being sent:", invoiceData); // Debugging
  
    fetch("http://localhost:5000/api/invoice/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify(invoiceData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Invoice creation response:", data); // Debugging
  
        if (data.invoice && data.invoice._id) {
          setInvoiceGenerated(true);
          setInvoiceId(data.invoice._id);
          setIsModalOpen(true);
  
          // Remove the reservation from the list only if it exists
          if (selectedReservation) {
            setReservations((prev) =>
              prev.filter((res) => res.reservationId !== selectedReservation.reservationId)
            );
            setSelectedReservation(null);
          }
        } else {
          throw new Error("Invalid response from server");
        }
      })
      .catch((err) => {
        console.error("Error creating invoice:", err); // Debugging
        toast.error("Error creating invoice. Please try again.");
      });
  };

  // Save selection
  const saveSelection = () => {
    fetch(`http://localhost:5000/api/users/${userId}/add-food`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ foods: selectedFoods }),
    })
      .then((response) => response.json())
      .then((data) => {
        toast.success(data.message);
        setIsSelectionSaved(true);
      })
      .catch((err) => console.error("Error saving selection:", err));
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="user-food-page-wrapper">
      <div className="user-food-page">
        <div className="food-list">
          <h1 className="header">All Foods List</h1>
          <input
            type="text"
            placeholder="Search food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <ul>
            {filteredFoods.map((food) => (
              <li key={food._id} className="food-item">
                <div className="food-details">
                  <img src={`http://localhost:5000/uploads/${food.image}`} alt={food.name} />
                  <span className="food-name">{food.name}</span>
                </div>
                <span className="food-price">{food.price.toFixed(2)}</span>
                <button
                  onClick={() => addFoodToUser(food)}
                  disabled={addedFoods.includes(food._id)}
                >
                  {addedFoods.includes(food._id) ? "Added" : "Add Food"}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="selected-foods">
          <h1 className="header">Selected Foods for User</h1>
          {user && (
            <div className="user-details">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Contact:</strong> {user.contact}</p>
            </div>
          )}

          <div className="reserved-tables">
            <h3>Reserved Tables</h3>
            <select
              value={selectedReservation ? selectedReservation.reservationId : ""}
              onChange={(e) => {
                const selected = reservations.find(
                  (res) => res.reservationId === e.target.value
                );
                setSelectedReservation(selected);
              }}
            >
              <option value="">Select a table</option>
              {reservations.map((res) => (
                <option key={res.reservationId} value={res.reservationId}>
                  Table {res.tableNumber} - {res.slotTime}
                </option>
              ))}
            </select>
          </div>

          <ul>
            {selectedFoods.map((food) => (
              <li key={food.foodId}>
                <div className="food-name-price">
                  <span className="food-name">{food.name}</span>
                  <span className="food-price">{food.price.toFixed(2)}</span>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => decreaseQuantity(food.foodId)}>-</button>
                  <span className="food-quantity">{food.quantity}</span>
                  <button onClick={() => increaseQuantity(food.foodId)}>+</button>
                </div>
              </li>
            ))}
          </ul>

          <h4 className="total-price">Total: {total.toFixed(2)}</h4>

          <div className="actions">
            <button
              onClick={saveSelection}
              className="action-button"
              disabled={total === 0}
            >
              Save Selection
            </button>
            <button
  onClick={generateInvoice}
  className="action-button"
  disabled={total === 0} // Removed "|| !selectedReservation"
>
  Generate Invoice
</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {invoiceGenerated && user && invoiceId && (
              <Invoice invoiceId={invoiceId} user={userId} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFoodPage;