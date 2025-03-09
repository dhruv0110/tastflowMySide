import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import './Reviews.css';

const Reviews = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token if needed
        const response = await fetch('http://localhost:5000/api/message/admin/all-reviews', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token // Add the token if authentication is required
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        setMessages(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="review-section">
      <Sidebar />
      <div className="review">
      <h1 className="header">User Reviews</h1>
        {messages.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          <ul className="review-list">
            {messages.map((message) => (
              <li key={message._id} className="review-item">
                <div className="review-header">
                  <span className="review-name">{message.firstName} {message.lastName}</span>
                  <span className="review-date">{new Date(message.date).toLocaleString()}</span>
                </div>
                <p className="review-email">Email: {message.email}</p>
                <p className="review-message">{message.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Reviews;
