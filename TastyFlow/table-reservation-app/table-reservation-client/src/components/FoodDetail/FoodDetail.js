import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './FoodDetail.css'; // Updated CSS file
import Footer from '../Footer/Footer';
import Teams from '../Teams/Teams';

const FoodDetail = () => {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        window.scrollTo(0, 0);
        const response = await fetch(`http://localhost:5000/api/food/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setFood(data.data);
        } else {
          setError(data.message || 'Failed to fetch food details.');
          toast.error(data.message || 'Failed to fetch food details.');
        }
      } catch (error) {
        setError(error.message);
        toast.error('An error occurred while fetching food details.');
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <FaSpinner className="spinner" />
        <p>Loading food details...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!food) {
    return <div className="error-message">No food item found.</div>;
  }

  return (
    <>
      <div className="food-detail-container">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="food-detail-hero">
          <div className="food-detail-hero-content">
            <h1>{food.name}</h1>
            <p className="food-detail-meta">
              <span className="category">{food.category}</span> •{' '}
              <span className="date">Added on: {new Date(food.date).toLocaleDateString()}</span>
            </p>
          </div>
          <div className="food-detail-hero-image">
            <img src={`http://localhost:5000/uploads/${food.image}`} alt={food.name} />
          </div>
        </div>

        <div className="food-detail-content">
          <div className="food-detail-section">
            <h2>About This Dish</h2>
            <p className="food-detail-description">{food.description}</p>
          </div>

          <div className="food-detail-section">
            <h2>Ingredients</h2>
            <ul className="ingredients-list">
              {food.ingredients.map((ingredient, index) => (
                <li key={index}>
                  <FaCheckCircle className="ingredient-icon" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="food-detail-section">
            <h2>Preparation Steps</h2>
            <div className="steps-timeline">
              {food.preparationSteps.map((step, index) => (
                <div key={index} className="step">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="food-detail-section">
            <h2>Nutritional Information</h2>
            <div className="nutrition-grid">
              {Object.entries(food.nutritionalInfo).map(([nutrient, amount], index) => (
                <div key={index} className="nutrition-card">
                  <h3>{nutrient}</h3>
                  <p>{amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>
        <Teams />
        <Footer />
      </div>
    </>
  );
};

export default FoodDetail;