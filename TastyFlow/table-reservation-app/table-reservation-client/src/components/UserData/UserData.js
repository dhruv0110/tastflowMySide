import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserData.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import { toast } from 'react-toastify';

const UserData = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [usersPerPage, setUsersPerPage] = useState(5); // State for users per page
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

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle users per page change
  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to the first page
  };

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

        {/* Controls Container for Search Input and Dropdown */}
        <div className="controls-container">
          {/* Search Input Field */}
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          {/* Users Per Page Dropdown */}
          <div className="users-per-page">
            <label htmlFor="usersPerPage">Users per page:</label>
            <select
              id="usersPerPage"
              value={usersPerPage}
              onChange={handleUsersPerPageChange}
            >
              <option value={1}>1</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {currentUsers.length === 0 ? (
          <div className="no-users">No users found.</div>
        ) : (
          <div className="user-list">
            {currentUsers.map((user) => (
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

        {/* Pagination Controls */}
        <div className="pagination1">
  <button
    onClick={() => paginate(currentPage - 1)}
    disabled={currentPage === 1}
    className="pagination-button"
  >
    Previous
  </button>
  {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
    <button
      key={i + 1}
      onClick={() => paginate(i + 1)}
      className={`pagination-button ${currentPage === i + 1 ? "active" : ""}`}
    >
      {i + 1}
    </button>
  ))}
  <button
    onClick={() => paginate(currentPage + 1)}
    disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
    className="pagination-button"
  >
    Next
  </button>
</div>
      </div>
    </div>
  );
};

export default UserData;