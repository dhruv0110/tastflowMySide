import React from 'react';
import './FoodDisplay.css';
import FoodItem from '../FoodItem/FoodItem';


const FoodDisplay = ({ category, food_list }) => {
  // Check if food_list exists and has items before mapping
  if (!food_list || food_list.length === 0) {
    return <div>No food items available.</div>;
  }

  return (
    <div className='food-display' id='food-display'>
      <div className="food-display-list">
        {food_list.map((item, index) => {
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
                category = {item.category}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default FoodDisplay;
