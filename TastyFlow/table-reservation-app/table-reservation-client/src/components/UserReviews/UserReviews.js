import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import './UserReviews.css';
import { message } from 'antd';

const UserReviews = () => {
  const { userId } = useParams();
  const [userReviews, setUserReviews] = useState([]);
  const [userName, setUserName] = useState('');

  const fetchUserReviews = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/message/admin/all-reviews/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token'),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUserReviews(data);
      } else {
        message.error("Error fetching reviews");
      }
    } catch (error) {
      message.error("An error occurred while fetching reviews");
    }
  }, [userId]);

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/admin/getuser/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token'),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUserName(data.name);
      } else {
        message.error("Error fetching user details");
      }
    } catch (error) {
      message.error("An error occurred while fetching user details");
    }
  }, [userId]);

  useEffect(() => {
    fetchUserReviews();
    fetchUserDetails();
  }, [fetchUserDetails, fetchUserReviews]);

  return (
    <div className="reviews-page-section">
      <Sidebar />
      <div className="review-page">
        <h3 className="user-name">{userName}'s Reviews</h3>
        {userReviews.length > 0 ? (
          <ul className="reviews-list">
            {userReviews.map((review) => (
              <li key={review._id} className="review-item">
                <p className="review-text">{review.message}</p>
                <p className="review-date">{new Date(review.date).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-reviews">No reviews available for this user.</p>
        )}
      </div>
    </div>
  );
};

export default UserReviews;