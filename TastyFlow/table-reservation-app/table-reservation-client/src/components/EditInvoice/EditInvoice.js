import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import axios from 'axios';
import { toast } from "react-toastify";
import './EditInvoice.css';

const EditInvoice = () => {
  // State Management
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  
  const [state, setState] = useState({
    invoice: {
      foods: [],
      subtotal: 0,
      cgst: 0,
      sgst: 0,
      roundOffAmount: 0,
      finalAmount: 0,
      invoiceNumber: '',
      invoiceDate: '',
      discount: 0,
    },
    loading: true,
    error: null,
    foodsList: [],
    selectedFood: '',
  });

  // API Handlers
  const fetchInvoiceDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/invoice/admin/${invoiceId}`);
      const invoiceData = response.data;
      
      const calculated = calculateTotalAmount(
        invoiceData.foods || [],
        invoiceData.discount || 0
      );

      setState(prev => ({
        ...prev,
        invoice: {
          foods: invoiceData.foods || [],
          subtotal: calculated.subtotal,
          cgst: calculated.cgst,
          sgst: calculated.sgst,
          roundOffAmount: calculated.roundOffAmount,
          finalAmount: calculated.finalAmount,
          invoiceNumber: invoiceData.invoiceNumber || '',
          invoiceDate: invoiceData.invoiceDate || '',
          discount: invoiceData.discount || 0,
        },
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error fetching invoice details',
        loading: false
      }));
      console.error('Error fetching invoice details:', error);
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/food/list');
      setState(prev => ({
        ...prev,
        foodsList: response.data.data || []
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error fetching food items'
      }));
      console.error('Error fetching food items:', error);
    }
  };

  // Calculation Logic
  const calculateTotalAmount = (foods, discount = 0) => {
    const subtotal = foods.reduce((sum, food) => sum + (food.total || 0), 0);
    const taxableAmount = Math.max(0, subtotal - discount);
    const cgst = taxableAmount * 0.025;
    const sgst = taxableAmount * 0.025;
    const totalBeforeRoundOff = taxableAmount + cgst + sgst;
    const roundOffAmount = Math.round(totalBeforeRoundOff) - totalBeforeRoundOff;
    const finalAmount = (totalBeforeRoundOff + roundOffAmount).toFixed(2);

    return { subtotal, cgst, sgst, roundOffAmount, finalAmount };
  };

  // Event Handlers
  const handleFoodChange = (index, e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    
    setState(prev => {
      const updatedFoods = [...prev.invoice.foods];
      const updatedFood = { ...updatedFoods[index] };
      
      if (name === 'quantity') {
        updatedFood.quantity = numericValue;
        updatedFood.total = (updatedFood.price || 0) * numericValue;
      } else if (name === 'price') {
        updatedFood.price = numericValue;
        updatedFood.total = numericValue * (updatedFood.quantity || 1);
      }
      
      updatedFoods[index] = updatedFood;
      const calculated = calculateTotalAmount(updatedFoods, prev.invoice.discount);
      
      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          foods: updatedFoods,
          ...calculated
        }
      };
    });
  };

  const handleAddFoodItem = (foodId) => {
    if (!foodId) return;
    
    setState(prev => {
      const selectedFoodItem = prev.foodsList.find(food => food._id === foodId);
      if (!selectedFoodItem) return prev;
      
      const isAlreadyAdded = prev.invoice.foods.some(food => food.foodId === foodId);
      if (isAlreadyAdded) {
        toast.warning("This food item is already added to the invoice.");
        return prev;
      }

      const newFoodItem = {
        foodId: selectedFoodItem._id,
        name: selectedFoodItem.name || '',
        price: selectedFoodItem.price || 0,
        quantity: 1,
        total: selectedFoodItem.price || 0,
      };

      const updatedFoods = [...prev.invoice.foods, newFoodItem];
      const calculated = calculateTotalAmount(updatedFoods, prev.invoice.discount);
      
      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          foods: updatedFoods,
          ...calculated
        },
        selectedFood: ''
      };
    });
  };

  const handleRemoveFoodItem = (index) => {
    setState(prev => {
      const updatedFoods = [...prev.invoice.foods];
      updatedFoods.splice(index, 1);
      const calculated = calculateTotalAmount(updatedFoods, prev.invoice.discount);
      
      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          foods: updatedFoods,
          ...calculated
        }
      };
    });
  };

  const handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    
    setState(prev => {
      const calculated = calculateTotalAmount(prev.invoice.foods, discount);
      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          discount,
          ...calculated
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const invoiceData = {
      ...state.invoice,
      foods: state.invoice.foods.map(food => ({
        foodId: food.foodId,
        name: food.name,
        price: parseFloat(food.price) || 0,
        quantity: parseInt(food.quantity) || 1,
        total: parseFloat(food.total) || 0,
      })),
      totalAmount: parseFloat(state.invoice.subtotal) || 0,
      cgst: parseFloat(state.invoice.cgst) || 0,
      sgst: parseFloat(state.invoice.sgst) || 0,
      roundOff: parseFloat(state.invoice.roundOffAmount) || 0,
      finalAmount: parseFloat(state.invoice.finalAmount) || 0,
    };

    try {
      const response = await axios.put(
        `http://localhost:5000/api/invoice/admin/update/${invoiceId}`,
        invoiceData
      );

      toast.success(response.data.message);
      navigate("/admin/all-invoices");
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error(error.response?.data?.message || "Error updating invoice");
    }
  };

  // Effects
  useEffect(() => {
    fetchInvoiceDetail();
    fetchFoods();
  }, [invoiceId]);

  useEffect(() => {
    if (state.selectedFood) {
      handleAddFoodItem(state.selectedFood);
    }
  }, [state.selectedFood]);

  // Render
  if (state.loading) return <div className="loading-container">Loading invoice...</div>;
  if (state.error) return <div className="error-container">{state.error}</div>;

  return (
    <div className="edit-invoice-container">
      <Sidebar />
      
      <main className="invoice-content">
        <header className="invoice-header">
          <h1>Edit Invoice</h1>
          <div className="invoice-meta">
            <span>Invoice: {state.invoice.invoiceNumber}</span>
            <span>Date: {state.invoice.invoiceDate ? new Date(state.invoice.invoiceDate).toLocaleDateString() : ''}</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="invoice-form">
          <section className="invoice-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <label>Subtotal</label>
                <p>₹{state.invoice.subtotal.toFixed(2)}</p>
              </div>
              
              <div className="summary-item discount">
                <label>Discount</label>
                <p>-₹{state.invoice.discount.toFixed(2)}</p>
              </div>
              
              <div className="summary-item">
                <label>CGST (2.5%)</label>
                <p>₹{state.invoice.cgst.toFixed(2)}</p>
              </div>
              
              <div className="summary-item">
                <label>SGST (2.5%)</label>
                <p>₹{state.invoice.sgst.toFixed(2)}</p>
              </div>
              
              <div className="summary-item">
                <label>Round Off</label>
                <p>₹{state.invoice.roundOffAmount.toFixed(2)}</p>
              </div>
              
              <div className="summary-item total">
                <label>Final Amount</label>
                <p>₹{state.invoice.finalAmount}</p>
              </div>
            </div>
          </section>

          <section className="invoice-items">
            <h2>Food Items</h2>
            <div className="items-table">
              <div className="table-header">
                <div>#</div>
                <div>Item</div>
                <div>Price</div>
                <div>Qty</div>
                <div>Amount</div>
                <div>Action</div>
              </div>
              
              {state.invoice.foods.length > 0 ? (
                state.invoice.foods.map((food, index) => (
                  <div key={`${food.foodId}-${index}`} className="table-row">
                    <div>{index + 1}</div>
                    <div>{food.name}</div>
                    <div>₹{(food.price || 0).toFixed(2)}</div>
                    <div>
                      <input
                        type="number"
                        name="quantity"
                        value={food.quantity || 1}
                        onChange={(e) => handleFoodChange(index, e)}
                        min="1"
                        className="quantity-input"
                      />
                    </div>
                    <div>₹{(food.total || 0).toFixed(2)}</div>
                    <div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFoodItem(index)}
                        className="remove-btn"
                        aria-label="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No food items added</div>
              )}
            </div>

            <div className="item-add-controls">
              <div className="food-selector">
                <label htmlFor="food-select">Add Item:</label>
                <select
                  id="food-select"
                  value={state.selectedFood}
                  onChange={(e) => setState(prev => ({...prev, selectedFood: e.target.value}))}
                  className="food-dropdown"
                >
                  <option value="">Select a food item</option>
                  {state.foodsList.map((food) => (
                    <option key={food._id} value={food._id}>
                      {food.name} (₹{(food.price || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <div className="actions-container">
  <div className="discount-section">
    <div className="discount-input-group">
      <label htmlFor="discount-input" className="discount-label">
        Apply Discount:
      </label>
      <div className="discount-input-wrapper">
        <span className="currency-symbol">₹</span>
        <input
          id="discount-input"
          type="number"
          value={state.invoice.discount === 0 ? '' : state.invoice.discount}
          onChange={handleDiscountChange}
          min="0"
          step="0.01"
          placeholder="0.00"
          className="discount-input-field"
        />
      </div>
    </div>
    
    <button 
      type="submit" 
      className="save-button"
      disabled={state.loading}
    >
      {state.loading ? (
        <span className="save-button-loader">
          <span className="loader-dot"></span>
          <span className="loader-dot"></span>
          <span className="loader-dot"></span>
        </span>
      ) : (
        'Save Changes'
      )}
    </button>
  </div>
</div>
        </form>
      </main>
    </div>
  );
};

export default EditInvoice;