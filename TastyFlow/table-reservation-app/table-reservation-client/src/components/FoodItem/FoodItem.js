import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FoodItem.css';
import { useSocket } from '../../context/SocketContext';
import { Howl } from 'howler';

const FoodItem = ({ id, name, description, price, image, date, category }) => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [currentFood, setCurrentFood] = useState({
    id, name, description, price, image, date, category
  });

  const clickSound = new Howl({
    src: ['/sounds/click.mp3'],
    volume: 0.5
  });

  useEffect(() => {
    if (socket) {
      socket.on('foodUpdated', (updatedFood) => {
        if (updatedFood._id === id) {
          setCurrentFood(updatedFood);
        }
      });

      return () => {
        socket.off('foodUpdated');
      };
    }
  }, [socket, id]);

  const handleViewMore = () => {
    clickSound.play();
    navigate(`/food/${id}`, { 
      state: { 
        name: currentFood.name, 
        description: currentFood.description, 
        price: currentFood.price, 
        image: currentFood.image, 
        date: currentFood.date, 
        category: currentFood.category 
      } 
    });
  };

  return (
    <div className="main-food-div">
      <div className="food-item">
        <img
          className="food-item-image"
          src={`http://localhost:5000/uploads/${currentFood.image}`}
          alt={currentFood.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/food-placeholder.png';
          }}
        />
      </div>
      <div className="food-item-info">
        <div className="food-item-name-price">
          <p className="food-item-name">{currentFood.name}</p>
          <p className="food-item-price">${currentFood.price}</p>
        </div>
        <div className="view-more" onClick={handleViewMore}>
          View More
        </div>
      </div>
    </div>
  );
};

export default FoodItem;