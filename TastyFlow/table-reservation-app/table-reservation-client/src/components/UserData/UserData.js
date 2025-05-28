import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination/Pagination';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faCircleInfo,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import './UserData.css';

const UserData = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
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

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  function getInitials(name) {
    const nameArray = name.split(" ");
    const initials = nameArray.map(part => part[0]).join("");
    return initials.toUpperCase();
  }

  return (
    <div className="ud-container">
      <Sidebar />
      
      <main className="ud-content">
        <header className="ud-header">
          <h1 className="ud-title">
            Registered Users
          </h1>
          <p className="ud-subtitle">Manage all system users</p>
        </header>

        <div className="ud-controls">
          <div className="ud-search-box">
            <FontAwesomeIcon icon={faSearch} className="ud-search-icon" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="ud-per-page">
            <label>Users per page:</label>
            <select
              value={usersPerPage}
              onChange={handleUsersPerPageChange}
            >
              {[1, 5, 10, 20, 50].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        {currentUsers.length === 0 ? (
          <div className="ud-empty-state">
            <FontAwesomeIcon icon={faUserCircle} size="2x" />
            <p>{searchTerm ? 'No matching users found' : 'No users available'}</p>
          </div>
        ) : (
          <div className="ud-list-container">
            <div className="ud-list-header">
              <span className="ud-user-col">User</span>
              <span className="ud-email-col">Email</span>
              <span className="ud-action-col">Actions</span>
            </div>
            
            <div className="ud-list">
              {currentUsers.map((user) => (
                <div key={user._id} className="ud-card">
                  <div className="ud-user-info">
                    <div className="ud-avatar">
                      {getInitials(user.name)}
                    </div>
                    <div className="ud-user-details">
                      <h4>{user.name}</h4>
                      <p className="ud-email-mobile">{user.email}</p>
                    </div>
                  </div>
                  <div className="ud-email">{user.email}</div>
                  <button
                    className="ud-action-btn"
                    onClick={() => navigate(`/admin/user/dash-board/${user._id}`)}
                  >
                    <FontAwesomeIcon icon={faCircleInfo} />
                    <span>Details</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Pagination
          totalItems={filteredUsers.length}
          itemsPerPage={usersPerPage}
          currentPage={currentPage}
          paginate={paginate}
        />
      </main>
    </div>
  );
};

export default UserData;