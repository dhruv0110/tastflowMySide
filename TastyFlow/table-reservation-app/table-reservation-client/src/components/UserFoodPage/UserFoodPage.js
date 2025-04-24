import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Invoice from '../Invoice/Invoice';
import { toast } from 'react-toastify';
import './UserFoodPage.css';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const foodResponse = await fetch("http://localhost:5000/api/food/list");
        const foodData = await foodResponse.json();
        setFoods(foodData.data);

        const token = localStorage.getItem('token');
        if (token) {
          const userResponse = await fetch(`http://localhost:5000/api/users/admin/getuser/${userId}`, {
            headers: { 'auth-token': token }
          });
          const userData = await userResponse.json();
          
          setUser(userData);
          updateReservations(userData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    const updateReservations = (userData) => {
      const succeededPayments = userData.payments?.filter(
        payment => payment.status === "succeeded" && !payment.deducted
      ) || [];
      
      setReservations(succeededPayments.map(payment => ({
        reservationId: payment.reservationId,
        tableNumber: payment.tableNumber,
        slotTime: payment.slotTime,
      })));
    };

    fetchData();

    // Socket event listeners
    socket.on('newReservation', ({ reservation }) => {
      setReservations(prev => [...prev, reservation]);
    });

    socket.on('reservationRemoved', ({ reservationId }) => {
      setReservations(prev => prev.filter(res => res.reservationId !== reservationId));
      if (selectedReservation?.reservationId === reservationId) {
        setSelectedReservation(null);
      }
    });

    // Join user's room
    socket.emit('joinUserRoom', userId);

    return () => {
      socket.off('newReservation');
      socket.off('reservationRemoved');
      socket.disconnect();
    };
  }, [userId, selectedReservation]);

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addFoodToUser = (food) => {
    setSelectedFoods(prev => {
      const existing = prev.find(f => f.foodId === food._id);
      if (existing) return prev;
      
      const updated = [
        ...prev,
        { foodId: food._id, name: food.name, price: food.price, quantity: 1 }
      ];
      updateTotal(updated);
      return updated;
    });
    setAddedFoods(prev => [...prev, food._id]);
  };

  const updateTotal = (foods) => {
    setTotal(foods.reduce((sum, food) => sum + food.price * food.quantity, 0));
  };

  const increaseQuantity = (foodId) => {
    setSelectedFoods(prev => {
      const updated = prev.map(food =>
        food.foodId === foodId ? { ...food, quantity: food.quantity + 1 } : food
      );
      updateTotal(updated);
      return updated;
    });
  };

  const decreaseQuantity = (foodId) => {
    setSelectedFoods(prev => {
      const updated = prev
        .map(food => 
          food.foodId === foodId
            ? { ...food, quantity: food.quantity - 1 }
            : food
        )
        .filter(food => food.quantity > 0);
      
      if (updated.length < prev.length) {
        setAddedFoods(prevAdded => prevAdded.filter(id => id !== foodId));
      }
      
      updateTotal(updated);
      return updated;
    });
  };

  const saveSelection = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/add-food`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foods: selectedFoods })
      });
      const data = await response.json();
      toast.success(data.message);
      setIsSelectionSaved(true);
    } catch (err) {
      console.error("Error saving selection:", err);
      toast.error("Failed to save selection");
    }
  };

  const generateInvoice = async () => {
    if (!isSelectionSaved) {
      toast.error("Please save your selection first");
      return;
    }
  
    try {
      const cgst = total * 0.025;
      const sgst = total * 0.025;
      const roundOff = Math.round(total + cgst + sgst) - (total + cgst + sgst);
      const finalAmount = (total + cgst + sgst + roundOff).toFixed(2);
  
      // Create payload including reservation details if selected
      const payload = {
        userId,
        foods: selectedFoods.map(food => ({
          foodId: food.foodId,
          name: food.name,
          price: food.price,
          quantity: food.quantity
        })),
        totalAmount: finalAmount,
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        roundOff: roundOff.toFixed(2)
      };
  
      // Add reservation details if selected
      if (selectedReservation) {
        payload.reservationId = selectedReservation.reservationId;
        payload.tableNumber = selectedReservation.tableNumber;
        payload.slotNumber = getSlotNumberFromTime(selectedReservation.slotTime);
      }
  
      const response = await fetch("http://localhost:5000/api/invoice/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token")
        },
        body: JSON.stringify(payload)
      });
  
      const data = await response.json();
      if (data.invoice?._id) {
        setInvoiceId(data.invoice._id);
        setInvoiceGenerated(true);
        setIsModalOpen(true);
        
        // Update local state immediately
        if (selectedReservation) {
          setReservations(prev => 
            prev.filter(res => res.reservationId !== selectedReservation.reservationId)
          );
          setSelectedReservation(null);
        }
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
      toast.error("Failed to generate invoice");
    }
  };

  // Helper function to get slot number from time
  const getSlotNumberFromTime = (slotTime) => {
    if (slotTime.includes('5:00 PM')) return 1;
    if (slotTime.includes('7:00 PM')) return 2;
    if (slotTime.includes('9:00 PM')) return 3;
    return 1; // default
  };

  const closeModal = () => setIsModalOpen(false);

  if (loading) {
    return (
      <div className="ufp-loading">
        <div className="ufp-loading-spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="ufp-container">
      <div className="container ufp-content-wrapper">
        {/* Left Panel - Food Selection */}
        <div className="ufp-food-selection">
          <div className="ufp-search-container">
            <input
              type="text"
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="ufp-food-list">
            {filteredFoods.length > 0 ? (
              filteredFoods.map(food => (
                <div key={food._id} className="ufp-food-item">
                  <div className="ufp-food-image">
                    <img 
                      src={`http://localhost:5000/uploads/${food.image}`} 
                      alt={food.name} 
                    />
                  </div>
                  <div className="ufp-food-info">
                    <h3>{food.name}</h3>
                    <p>₹{food.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => addFoodToUser(food)}
                    disabled={addedFoods.includes(food._id)}
                    className={addedFoods.includes(food._id) ? 'added' : ''}
                  >
                    {addedFoods.includes(food._id) ? 'Added' : 'Add'}
                  </button>
                </div>
              ))
            ) : (
              <div className="ufp-no-results">No matching foods found</div>
            )}
          </div>
        </div>

        {/* Right Panel - Order Summary */}
        <div className="ufp-order-summary">
          <div className="ufp-order-content">
            <div className="ufp-user-details">
              <h3>Customer Details</h3>
              <div className="ufp-detail-item">
                <span>Name:</span>
                <span>{user?.name || 'N/A'}</span>
              </div>
              <div className="ufp-detail-item">
                <span>Email:</span>
                <span>{user?.email || 'N/A'}</span>
              </div>
              <div className="ufp-detail-item">
                <span>Contact:</span>
                <span>{user?.contact || 'N/A'}</span>
              </div>
            </div>

            {reservations.length > 0 && (
              <div className="ufp-reservation-selector">
                <h3>Select Reservation</h3>
                <select
                  value={selectedReservation?.reservationId || ''}
                  onChange={(e) => {
                    const selected = reservations.find(
                      res => res.reservationId === e.target.value
                    );
                    setSelectedReservation(selected || null);
                  }}
                >
                  <option value="">No reservation</option>
                  {reservations.map(res => (
                    <option key={res.reservationId} value={res.reservationId}>
                      Table {res.tableNumber} - {res.slotTime}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="ufp-selected-items">
              <h3>Selected Items</h3>
              {selectedFoods.length > 0 ? (
                <div className="ufp-selected-container">
                  <div className="ufp-selected-list">
                    {selectedFoods.map(food => (
                      <div key={food.foodId} className="ufp-selected-item">
                        <div className="ufp-item-info">
                          <span className="ufp-item-name">{food.name}</span>
                          <span className="ufp-item-price">₹{food.price.toFixed(2)}</span>
                        </div>
                        <div className="ufp-quantity-controls">
                          <button 
                            onClick={() => decreaseQuantity(food.foodId)}
                            className="ufp-quantity-btn"
                          >
                            -
                          </button>
                          <span>{food.quantity}</span>
                          <button 
                            onClick={() => increaseQuantity(food.foodId)}
                            className="ufp-quantity-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="ufp-no-items">No items selected</div>
              )}
            </div>

            {/* Combined Total and Action Buttons */}
            <div className="ufp-action-buttons">
              <div className="ufp-order-total">
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button
                onClick={saveSelection}
                disabled={selectedFoods.length === 0 || isSelectionSaved}
                className="ufp-save-btn"
              >
                Save
              </button>
              <button
                onClick={generateInvoice}
                disabled={selectedFoods.length === 0 || !isSelectionSaved}
                className="ufp-invoice-btn"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {isModalOpen && (
        <div className="ufp-modal-overlay" onClick={closeModal}>
          <div className="ufp-modal-content" onClick={(e) => e.stopPropagation()}>
            {invoiceGenerated && invoiceId && (
              <Invoice invoiceId={invoiceId} user={userId} />
            )}
            <button className="ufp-close-modal" onClick={closeModal}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFoodPage;