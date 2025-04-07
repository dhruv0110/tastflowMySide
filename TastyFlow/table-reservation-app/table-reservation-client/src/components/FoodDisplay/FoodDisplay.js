import React from 'react';
import './FoodDisplay.css';
import FoodItem from '../FoodItem/FoodItem';
import { useFood } from '../../context/FoodContext';

const FoodDisplay = ({ category }) => {
  const { foodList, loading } = useFood();

  if (loading) {
    return <div>Loading food items...</div>;
  }

  if (!foodList || foodList.length === 0) {
    return <div>No food items available.</div>;
  }

  return (
    <div className='food-display' id='food-display'>
      <div className="food-display-list">
        {foodList.map((item, index) => {
          if (category === "All" || category === item.category) {
            return (
              <FoodItem 
                key={index} 
                id={item._id} 
                name={item.name} 
                description={item.description} 
                price={item.price} 
                image={item.image}
                date={item.date}
                category={item.category}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default FoodDisplay;