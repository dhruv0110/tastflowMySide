import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Pagination from '../../components/Pagination/Pagination';
import './UsersList.css';
import { message } from 'antd';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });
  const { name, email, contact, password, confirmPassword } = formData;

  // Filters
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/users/admin/all-users");
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddNewCustomer = () => {
    setShowForm(!showForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/createuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        fetchUsers();
        setShowForm(false);
        setFormData({
          name: "",
          email: "",
          contact: "",
          password: "",
          confirmPassword: "",
        });
        message.success("New customer added successfully!");
      } else {
        message.error(result.error || "Error creating new user");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("An error occurred while adding the customer");
    }
  };

  const filteredUsers = users.filter((user) => {
    const lowerCaseNameFilter = nameFilter.toLowerCase();
    return (
      (nameFilter
        ? user.name.toLowerCase().includes(lowerCaseNameFilter) ||
          (user.contact && user.contact.includes(nameFilter))
        : true) &&
      (emailFilter ? user.email.toLowerCase().includes(emailFilter.toLowerCase()) : true) &&
      (roleFilter ? user.role.toLowerCase().includes(roleFilter.toLowerCase()) : true)
    );
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setNameFilter("");
    setEmailFilter("");
    setRoleFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="users-list-container">
      <Sidebar />
      
      <main className="users-list-content">
        <header className="users-list-header">
          <h1>User Management</h1>
          <p className="users-list-subtitle">View and manage all system users</p>
        </header>

        {loading ? (
          <div className="users-list-loading">Loading user data...</div>
        ) : (
          <div className="users-list-view">
            <div className="users-list-controls">
              <button className="users-list-add-btn" onClick={handleAddNewCustomer}>
                {showForm ? 'Close Form' : 'Add New User'}
              </button>
              
              <div className="users-list-per-page">
                <label htmlFor="usersPerPage">Users per page:</label>
                <select
                  id="usersPerPage"
                  value={usersPerPage}
                  onChange={handleUsersPerPageChange}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Add User Form */}
            <div className={`users-list-form ${showForm ? 'show' : ''}`}>
              <form onSubmit={handleSubmit} style={{margin:"0.5rem"}}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="contact"
                      value={contact}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      value={password}
                      onChange={handleInputChange}
                      required
                      minLength={5}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleInputChange}
                      required
                      minLength={5}
                    />
                  </div>
                </div>
                
                <button type="submit" className="users-list-submit-btn">
                  Create User
                </button>
              </form>
            </div>

            {/* Filters */}
            <div className="users-list-filters">
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="Filter by name or phone"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="Filter by email"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                />
              </div>
              <button 
                className="users-list-clear-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>

            {/* Users Table */}
            <div className="users-list-table">
              <div className="users-list-table-header">
                <div>NAME</div>
                <div>EMAIL</div>
                <div>ACTIONS</div>
              </div>
              
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <div key={user._id} className="users-list-table-row">
                    <div>{user.name}</div>
                    <div>{user.email}</div>
                    <div>
                      <Link 
                        to={`/admin/user/${user._id}/create-bill`} 
                        className="users-list-action-link"
                      >
                        Create Bill
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="users-list-empty">
                  No users found matching your criteria
                </div>
              )}
            </div>

            {/* Pagination */}
            <Pagination
              totalItems={filteredUsers.length}
              itemsPerPage={usersPerPage}
              currentPage={currentPage}
              paginate={paginate}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersList;