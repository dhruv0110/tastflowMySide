import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserData.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import { toast } from 'react-toastify';

const UserData = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/admin/all-users', {
        method: 'GET',
        headers: {
          'auth-token': localStorage.getItem('token'),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        toast.error("Error fetching users");
      }
    } catch (error) {
      toast.error("An error occurred while fetching users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  function getInitials(name) {
    const nameArray = name.split(" ");
    const initials = nameArray.map(part => part[0]).join("");
    return initials.toUpperCase();
  }

  return (
    <div className="user-section">
      <Sidebar />
      <div className="user">
        <h1 className="header">All Registered Users</h1>
        {users.length === 0 ? (
          <div className="no-users">No registered users found.</div>
        ) : (
          <div className="user-list">
            {users.map((user) => (
              <div key={user._id} className="user-card">
                <div className="profile-circle">{getInitials(user.name)}</div>
                <div className="user-info">
                  <p>{user.name}</p>
                  <p>{user.email}</p>
                </div>
                <button
                  className="info-button"
                  onClick={() => navigate(`/admin/user/dash-board/${user._id}`)}
                >
                  <i className="fa-solid fa-circle-info"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserData;
