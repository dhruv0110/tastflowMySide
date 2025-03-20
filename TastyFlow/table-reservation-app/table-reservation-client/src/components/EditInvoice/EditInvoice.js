import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import axios from 'axios';
import { toast } from "react-toastify"
import './EditInvoice.css';

const EditInvoice = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState({
    foods: [],
    totalAmount: 0,
    cgst: 0,
    sgst: 0,
    roundOffAmount: 0,
    finalAmount: 0,
    invoiceNumber: '',
    invoiceDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [foodsList, setFoodsList] = useState([]);
  const [selectedFood, setSelectedFood] = useState('');  // State to manage selected food
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoiceDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/invoice/admin/${invoiceId}`);
        setInvoice(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        setError('Error fetching invoice details');
        setLoading(false);
      }
    };

    const fetchFoods = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/food/list');
        setFoodsList(response.data.data);
      } catch (error) {
        console.error('Error fetching food items:', error);
        setError('Error fetching food items');
      }
    };

    fetchInvoiceDetail();
    fetchFoods();
  }, [invoiceId]);

  const calculateTotalAmount = (updatedFoods) => {
    let totalAmount = 0;

    updatedFoods.forEach((food) => {
      totalAmount += food.total;
    });

    const cgst = totalAmount * 0.025;
    const sgst = totalAmount * 0.025;

    const totalBeforeRoundOff = totalAmount + cgst + sgst;

    const roundOffAmount = Math.round(totalBeforeRoundOff) - totalBeforeRoundOff;

    const finalAmount = (totalBeforeRoundOff + roundOffAmount).toFixed(2);

    return {
      totalAmount,
      cgst,
      sgst,
      roundOffAmount,
      finalAmount,
    };
  };

  const handleFoodChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFoods = [...invoice.foods];
    const updatedFood = { ...updatedFoods[index] };

    const numericValue = parseFloat(value) || 0;

    if (name === 'quantity') {
      updatedFood.quantity = numericValue;
      updatedFood.total = updatedFood.price * numericValue;
    } else if (name === 'price') {
      updatedFood.price = numericValue;
      updatedFood.total = numericValue * updatedFood.quantity;
    }

    updatedFoods[index] = updatedFood;

    const { totalAmount, cgst, sgst, roundOffAmount, finalAmount } = calculateTotalAmount(updatedFoods);
    setInvoice({
      ...invoice,
      foods: updatedFoods,
      totalAmount,
      cgst,
      sgst,
      roundOffAmount,
      finalAmount,
    });
  };

  const handleAddFoodItem = (foodId) => {
    const selectedFoodItem = foodsList.find((food) => food._id === foodId);

    if (selectedFoodItem) {
      // Check if the food item is already in the foods list of the invoice
      const isFoodAlreadyAdded = invoice.foods.some((food) => food.foodId === selectedFoodItem._id);

      if (isFoodAlreadyAdded) {
        // Show a message instead of re-adding the same food
        alert("This food item is already added to the invoice.");
        return; // Prevent adding the same item again
      }

      const newFoodItem = {
        foodId: selectedFoodItem._id,  // this should correspond to the foodId you are using for food items
        name: selectedFoodItem.name,
        price: selectedFoodItem.price,
        quantity: 1,
        total: selectedFoodItem.price,
      };

      // Add the new food item to the foods list in the invoice
      const updatedFoods = [...invoice.foods, newFoodItem];

      // Recalculate the totals after adding the new food item
      const { totalAmount, cgst, sgst, roundOffAmount, finalAmount } = calculateTotalAmount(updatedFoods);

      // Update the invoice state with the new food item and the updated totals
      setInvoice({
        ...invoice,
        foods: updatedFoods,
        totalAmount,
        cgst,
        sgst,
        roundOffAmount,
        finalAmount,
      });

      // Reset the selected food dropdown value to default
      setSelectedFood('');
    }
  };






  const handleRemoveFoodItem = (index) => {
    const updatedFoods = [...invoice.foods];
    updatedFoods.splice(index, 1);

    const { totalAmount, cgst, sgst, roundOffAmount, finalAmount } = calculateTotalAmount(updatedFoods);

    setInvoice({
      ...invoice,
      foods: updatedFoods,
      totalAmount,
      cgst,
      sgst,
      roundOffAmount,
      finalAmount,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFoods = invoice.foods.map((food) => ({
      foodId: food.foodId,
      name: food.name,
      price: parseFloat(food.price) || 0,
      quantity: parseInt(food.quantity) || 1,
      total: parseFloat(food.total) || 0,
    }));

    const invoiceDataToStore = {
      ...invoice,
      foods: updatedFoods,
      totalAmount: invoice.finalAmount,
      cgst: invoice.cgst,
      sgst: invoice.sgst,
      roundOffAmount: invoice.roundOffAmount,
      finalAmount: invoice.finalAmount,
      invoiceDate: invoice.invoiceDate,
    };

    try {
      const response = await axios.put(`http://localhost:5000/api/invoice/admin/update/${invoiceId}`, invoiceDataToStore);

      if (response.data.message === 'Invoice updated successfully') {
        navigate("/admin/all-invoices");
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    if (selectedFood) {
      handleAddFoodItem(selectedFood); // Automatically add food item when selected
    }
  }, [selectedFood]);

  if (loading) return <p>Loading invoice...</p>;

  return (
    <div className="edit-invoice-container">
      <Sidebar />
      <div className="edit-invoice-detail">
        <h1 className="header">Edit Invoice</h1>
        <form onSubmit={handleSubmit}>
        <div className="edit-container">
          <div className="form-section">
            <p>Invoice Number: {invoice.invoiceNumber}</p>
          </div>

          <div className="tax-details">
            <div className="tax-item">
              <label>Total Amount</label>
              <p>{invoice.finalAmount ? invoice.finalAmount : invoice.totalAmount}</p>
            </div>

            <div className="tax-item">
              <label>CGST</label>
              <p>{invoice.cgst}</p>
            </div>

            <div className="tax-item">
              <label>SGST</label>
              <p>{invoice.sgst}</p>
            </div>

            <div className="tax-item">
              <label>Round Off</label>
              <p>{invoice.roundOffAmount}</p>
            </div>

            <div className="tax-item">
                <label>Date</label>
                <p>{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
              </div>
          </div>

          <h4>Food Items:</h4>
          <div className="invoice-table">
            <div className="invoice-table-format title">
              <b>SI Number</b>
              <b>Name</b>
              <b>Price</b>
              <b>Quantity</b>
              <b>Amount</b>
              <b>Action</b>
            </div>
            {invoice.foods.length > 0 ? (
              invoice.foods.map((food, index) => (
                <div key={index} className="invoice-table-format">
                  <p>{index + 1}</p>
                  <p>{food.name}</p>
                  <p>{food.price.toFixed(2)}</p>
                  <input
                    type="number"
                    name="quantity"
                    value={food.quantity}
                    onChange={(e) => handleFoodChange(index, e)}
                    className="quantity-input"
                  />
                  <p>{food.total.toFixed(2)}</p>
                  <button type="button" onClick={() => handleRemoveFoodItem(index)} className="remove-btn">
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p>No food items available</p>
            )}
          </div>

          <div className="form-section">
            <label>Select Food Item:</label>
            <select
              value={selectedFood}  // Bind to state for controlled component
              onChange={(e) => setSelectedFood(e.target.value)}  // Update selectedFood state on change
              className="food-dropdown"
            >
              <option value="">Select a food item</option>
              {foodsList.map((food) => (
                <option key={food._id} value={food._id}>
                  {food.name}
                </option>
              ))}
            </select>
          </div>

          <div className="button-container">
  <button type="submit" className="submit-btn">Save Changes</button>
</div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInvoice;
