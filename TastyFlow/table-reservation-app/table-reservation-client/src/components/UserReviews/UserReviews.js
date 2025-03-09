// components/UserReviews/UserReviews.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../Sidebar/Sidebar';
import './UserReviews.css';

const UserReviews = () => {
  const { userId } = useParams();
  const [userReviews, setUserReviews] = useState([]);
  const [userName, setUserName] = useState('');

  const fetchUserReviews = async () => {
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
        toast.error("Error fetching reviews");
      }
    } catch (error) {
      toast.error("An error occurred while fetching reviews");
    }
  };

  const fetchUserDetails = async () => {
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
        toast.error("Error fetching user details");
      }
    } catch (error) {
      toast.error("An error occurred while fetching user details");
    }
  };

  useEffect(() => {
    fetchUserReviews();
    fetchUserDetails();
  }, [userId]);

  return (
    <div className="reviews-page-section">
      <Sidebar />
      <div className="review-page">
        <h3 className="user-name">{userName}'s Reviews</h3>
        {userReviews.length > 0 ? (
          <ul className="reviews-list">
            {userReviews.map((review, index) => (
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
