import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { toast } from "react-toastify";
import './UsersList.css';
import Pagination from "../../components/Pagination/Pagination";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });
  const { name, email, contact, password, confirmPassword } = formData;

  // Individual filters for each column
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5); // Default users per page

  // Fetch all users from the backend
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/admin/all-users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle adding a new user form toggle
  const handleAddNewCustomer = () => {
    setShowForm(!showForm);
  };

  // Handle form submission to create a new user
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
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
        toast.success("New customer added successfully!");
      } else {
        toast.error(result.error || "Error creating new user");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while adding the customer");
    }
  };

  // Filter users based on individual column filters
  const filteredUsers = users.filter((user) => {
    const lowerCaseNameFilter = nameFilter.toLowerCase();
    return (
      (nameFilter
        ? user.name.toLowerCase().includes(lowerCaseNameFilter) ||
          (user.contact && user.contact.includes(nameFilter)) // Filter by name or phone
        : true) &&
      (emailFilter ? user.email.toLowerCase().includes(emailFilter.toLowerCase()) : true) &&
      (roleFilter ? user.role.toLowerCase().includes(roleFilter.toLowerCase()) : true)
    );
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle users per page change
  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(Number(e.target.value)); // Update users per page
    setCurrentPage(1); // Reset to the first page
  };

  // Clear all filters
  const clearFilters = () => {
    setNameFilter("");
    setEmailFilter("");
    setRoleFilter("");
    setCurrentPage(1); // Reset to the first page when clearing filters
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="users-list">
        <h1 className="header">Users List</h1>

        {/* Controls Container for Button and Dropdown */}
        <div className="controls-container">
          {/* Add New Customer Button */}
          <button className="add-customer-btn" onClick={handleAddNewCustomer}>
            {showForm ? "Close Form" : "Add New Customer"}
          </button>

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

        {/* Add Customer Form */}
        <div className={`add-customer-form ${showForm ? "show" : ""}`}>
          <form onSubmit={handleSubmit}>
            <div className="form-group double">
              <div>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter name"
                  value={name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group double">
              <div>
                <label htmlFor="contact">Phone</label>
                <input
                  type="text"
                  name="contact"
                  placeholder="Enter phone"
                  value={contact}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={handleInputChange}
                  required
                  minLength={5}
                />
              </div>
            </div>

            <div className="form-group double">
              <div>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={5}
                />
              </div>
            </div>

            <div className="form-group">
              <button type="submit" className="submit-btn">
                Create
              </button>
            </div>
          </form>
        </div>

        {/* Users Table with Individual Filters */}
        <div className="users-table">
          <div className="users-table-format title">
            <b>Name</b>
            <b>Email</b>
            <b>Role</b>
            <b>Action</b>
          </div>
          {/* Filter Inputs */}
          <div className="users-table-format filters">
            <input
              type="text"
              placeholder="Filter by Name or Phone"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by Email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear
            </button>
          </div>
          {/* Users List */}
          {currentUsers.length > 0 ? (
            currentUsers.map((user) => (
              <div key={user._id} className="users-table-format">
                <p>{user.name}</p>
                <p>{user.email}</p>
                <p>{user.role}</p>
                <Link to={`/admin/user/${user._id}/create-bill`} className="cursor">
                  Create Bill
                </Link>
              </div>
            ))
          ) : (
            <p>No users available</p>
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
    </div>
  );
};

export default UsersList;