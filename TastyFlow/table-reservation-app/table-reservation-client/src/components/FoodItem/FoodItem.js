import React from "react";
import { format } from "date-fns";
import { assets } from "../../assets/assets";
import "./FoodItem.css";

const FoodItem = ({ name, description, price, image, date,category }) => {
  // Example function to format date using date-fns
  const formatDate = (date) => {
    return format(new Date(date), "dd-MM-yyyy"); // Format as needed
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
        <p className="food-item-desc">{description}</p>
        <div className="view-more">Order Now</div>
      </div>
    </div>
  );
};

export default FoodItem;
