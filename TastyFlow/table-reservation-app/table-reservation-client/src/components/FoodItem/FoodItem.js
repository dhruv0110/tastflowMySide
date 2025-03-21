import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FoodItem.css';

const FoodItem = ({ id, name, description, price, image, date, category }) => {
  const navigate = useNavigate();

  const handleViewMore = () => {
    navigate(`/food/${id}`, { state: { name, description, price, image, date, category } });
  };

  return (
    <div className="main-food-div">
      <div className="food-item">
        <img
          className="food-item-image"
          src={`http://localhost:5000/uploads/${image}`}
          alt={name}
        />
      </div>
      <div className="food-item-info">
        <div className="food-item-name-price">
          <p className="food-item-name">{name}</p>
          <p className="food-item-price">${price}</p>
        </div>
        <div className="view-more" onClick={handleViewMore}>
          View More
        </div>
      </div>
    </div>
  );
};

export default FoodItem;