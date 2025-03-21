import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './FoodDetail.css'; // Updated CSS file
import axios from 'axios';
import Footer from '../Footer/Footer';
import Teams from '../Teams/Teams';

const FoodDetail = () => {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewInput, setReviewInput] = useState({
    text: '',
    rating: 0,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Check if the user is logged in

  useEffect(() => {
    // Check if the user is logged in (e.g., by checking localStorage or a token)
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }

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

  const handleReviewChange = (e) => {
    const { name, value } = e.target;

    setReviewInput((prev) => ({
        ...prev,
        [name]: name === "rating" ? Math.min(5, Math.max(1, Number(value))) : value, // Ensure rating stays between 1-5
    }));
};


const submitReview = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("You must be logged in to submit a review.");
            return;
        }

        if (!food?._id) {
            toast.error("Invalid food item.");
            return;
        }

        const response = await axios.post(
            `http://localhost:5000/api/food/${food._id}/reviews`,
            {
              text: reviewInput.text,
              rating: reviewInput.rating,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

        if (response.data.success) {
            setFood((prevFood) => ({
                ...prevFood,
                reviews: [...prevFood.reviews, response.data.review],
            }));

            setReviewInput({ text: "", rating: 1 });

            toast.success("Review submitted successfully!");
        } else {
            toast.error(response.data.message);
        }
    } catch (error) {
        console.error("Review submission error:", error);
        toast.error(error.response?.data?.message || "An error occurred while submitting the review.");
    }
};



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
      <div className="food-detail-header">
        <h1>{food.name}</h1>
        <p className="food-detail-meta">
          <span className="category">{food.category}</span> •{' '}
          <span className="date">Added on: {new Date(food.date).toLocaleDateString()}</span>
        </p>
      </div>
      <div className="food-detail-image">
        <img src={`http://localhost:5000/uploads/${food.image}`} alt={food.name} />
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
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div className="food-detail-section">
          <h2>Preparation Steps</h2>
          <ol className="preparation-steps">
            {food.preparationSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="food-detail-section">
          <h2>Nutritional Information</h2>
          <div className="nutrition-cards">
            {Object.entries(food.nutritionalInfo).map(([nutrient, amount], index) => (
              <div key={index} className="nutrition-card">
                <h3>{nutrient}</h3>
                <p>{amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="food-detail-section"> */}
          {/* <h2>Reviews</h2>
          <div className="reviews-section">
            {food.reviews.length > 0 ? (
              food.reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <p className="review-text">{review.text}</p>
                  <p className="review-author">
                    - {review.author} • <span className="review-rating">{review.rating}/5</span>
                  </p>
                </div>
              ))
            ) : (
              <p>No reviews yet. Be the first to review this dish!</p>
            )}
          </div> */}

          {/* Review Input Section
          {isLoggedIn ? (
    <div className="review-input-section">
        <h3>Add Your Review</h3>
        <textarea
            name="text"
            value={reviewInput.text}
            onChange={handleReviewChange}
            placeholder="Write your review..."
            rows="4"
        ></textarea>
        <input
            type="number"
            name="rating"
            value={reviewInput.rating}
            onChange={handleReviewChange}
            placeholder="Rating (1-5)"
            min="1"
            max="5"
        />
        <button onClick={submitReview} className="submit-review-btn">
            Submit Review
        </button>
    </div>
) : (
    <p>Please log in to submit a review.</p>
)} */}
        {/* </div> */}
      </div>
    </div>
    <div>
        <Teams />
        <Footer/>
    </div>
    </>
  );
};

export default FoodDetail;