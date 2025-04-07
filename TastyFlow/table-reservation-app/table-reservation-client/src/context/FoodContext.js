import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';

const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
    const [foodList, setFoodList] = useState([]);
    const [loading, setLoading] = useState(true);
    const socket = useSocket();

    const fetchFoodList = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/food/list');
            setFoodList(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching food list:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoodList();

        if (socket) {
            socket.emit('joinFoodRoom');
            
            socket.on('foodAdded', (newFood) => {
                setFoodList(prev => [...prev, newFood]);
            });

            socket.on('foodRemoved', (foodId) => {
                setFoodList(prev => prev.filter(food => food._id !== foodId));
            });

            return () => {
                socket.off('foodAdded');
                socket.off('foodRemoved');
            };
        }
    }, [socket]);

    return (
        <FoodContext.Provider value={{ foodList, loading, fetchFoodList }}>
            {children}
        </FoodContext.Provider>
    );
};

export const useFood = () => {
    return useContext(FoodContext);
};