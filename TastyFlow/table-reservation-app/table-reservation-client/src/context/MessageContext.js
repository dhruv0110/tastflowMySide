import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessageNotification, setNewMessageNotification] = useState(null);
    const socket = useSocket();

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/message/admin/all-reviews', {
                headers: { 'auth-token': token }
            });
            setMessages(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();

        if (socket) {
            socket.emit('joinAdminMessageRoom');
            
            socket.on('newMessage', (message) => {
                setMessages(prev => [message, ...prev]);
                setNewMessageNotification({
                    id: message._id,
                    name: `${message.firstName} ${message.lastName}`,
                    content: message.message
                });
                setTimeout(() => setNewMessageNotification(null), 5000);
            });

            socket.on('messageUpdated', (updatedMessage) => {
                setMessages(prev => prev.map(msg => 
                    msg._id === updatedMessage._id ? updatedMessage : msg
                ));
            });

            return () => {
                socket.off('newMessage');
                socket.off('messageUpdated');
            };
        }
    }, [socket]);

    return (
        <MessageContext.Provider value={{ messages, loading, fetchMessages, newMessageNotification }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessages = () => {
    return useContext(MessageContext);
};