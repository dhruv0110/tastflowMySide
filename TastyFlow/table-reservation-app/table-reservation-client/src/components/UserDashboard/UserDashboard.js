import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar'
import "./UserDashboard.css"
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';

const UserDashBoard = () => {
    const { userId } = useParams();
    const navigate = useNavigate(); // hook for navigation

    const [userName, setUserName] = useState('')
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
            setUserName(data);
          } else {
            message.error("Error fetching user details");
          }
        } catch (error) {
          message.error("An error occurred while fetching user details");
        }
      };

        useEffect(() => {
          fetchUserDetails();
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [userId]);

        const handleReviewsClick = () => {
            navigate(`/admin/users/reviews/${userId}`); // Navigate to the reviews page
        };
        const handleInvoiceClick = () => {
          navigate(`/admin/users/invoice/${userId}`); // Navigate to the invoice page
      };
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="user-dash">
        <form className="user-dash-form flex-col">
          <h1 className="header">{userName.name}</h1>
          <div className='all-button'>
            <button className='review-btn' onClick={handleReviewsClick}>Reviews </button>
            <button className='review-btn' onClick={handleInvoiceClick}>Invoice </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default UserDashBoard;
