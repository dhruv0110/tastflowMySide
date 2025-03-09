import React from 'react';
import './FilterDisplay.css';

const FilterDisplay = ({ category, food_list }) => {
  // Check if food_list exists and has items before mapping
  if (!food_list || food_list.length === 0) {
    return <div>No food items available.</div>;
  }

  // Filter items based on category
  const filteredItems = food_list.filter(item => category === "All" || category === item.category);

  // Select the last 2 items
  const lastTwoItems = filteredItems.slice(-2);

  return (
    <div className="posts">
        {lastTwoItems.map((item, index) => (
         <div className="post">
          <div className="p-image">
           <img src={`http://localhost:5000/uploads/${item.image}`} alt="Recipe" className="post-image" />
           </div>
           <div className="post-category">{item.category}</div>
           <h3>{item.name}</h3>
           <p>
             {item.description}
           </p>
           <a href="#" className="post-link">View More &rarr;</a>
         </div>
        ))}
    </div>
  );
}

export default FilterDisplay;
