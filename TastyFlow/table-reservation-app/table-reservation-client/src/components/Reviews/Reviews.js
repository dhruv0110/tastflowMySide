import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import './Reviews.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faComments, 
  faCalendarAlt, 
  faExclamationCircle, 
  faSearch,
  faUser,
  faEnvelope,
  faComment
} from '@fortawesome/free-solid-svg-icons';

const Reviews = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/message/admin/all-reviews', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token
          },
        });

        if (!response.ok) throw new Error('Failed to fetch messages');
        
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

  const filteredMessages = messages.filter(message => 
    message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="reviews-admin-container">
      <Sidebar />
      
      <main className="reviews-content">
        <div className="reviews-header">
          <div>
            <h1>Customer Reviews</h1>
            <p>Manage and respond to customer feedback</p>
          </div>
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="reviews-stats">
          <div className="stat-card">
            <div className="stat-icon total">
              <FontAwesomeIcon icon={faComments} />
            </div>
            <div>
              <h3>{messages.length}</h3>
              <p>Total Reviews</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon today">
              <FontAwesomeIcon icon={faCalendarAlt} />
            </div>
            <div>
              <h3>{messages.filter(m => new Date(m.date).toDateString() === new Date().toDateString()).length}</h3>
              <p>Today's Reviews</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-reviews">
            <div className="spinner"></div>
            <p>Loading reviews...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="no-reviews">
            <FontAwesomeIcon icon={faExclamationCircle} size="2x" />
            <p>{searchTerm ? 'No matching reviews found' : 'No reviews available'}</p>
          </div>
        ) : (
          <div className="reviews-list-container">
            <div className="reviews-list-header">
              <span className="user-col"> User</span>
              <span className="email-col">Email</span>
              <span className="date-col">Date</span>
              <span className="message-col">Message</span>
            </div>
            
            <div className="reviews-list">
              {filteredMessages.map((message) => (
                <div key={message._id} className="review-card">
                  <div className="user-info">
                    <div className="avatar">
                      {message.firstName.charAt(0)}{message.lastName.charAt(0)}
                    </div>
                    <div className="user-details">
                      <h4>{message.firstName} {message.lastName}</h4>
                      <p className="email-mobile">{message.email}</p>
                    </div>
                  </div>
                  <div className="email">{message.email}</div>
                  <div className="date">
                    {new Date(message.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="message-container">
                    <div className="message-content">
                      {message.message}
                    </div>
                    <button className="reply-btn">Reply</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reviews;