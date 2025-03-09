import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar"; // Import the Sidebar
import { toast } from "react-toastify"; // Import toast for notifications
import './UsersList.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false); // To toggle the form visibility
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "", // Updated to contact for phone number
    password: "",
    confirmPassword: "", // Added confirm password to state
  });
  const { name, email, contact, password, confirmPassword } = formData;
  const [searchFilter, setSearchFilter] = useState(""); // General search filter (both name and contact)

  // Fetch all users from the backend when the component mounts
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/admin/all-users");
      const data = await response.json();
      setUsers(data); // Set initial list of users
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers(); // Load users when component mounts
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

    // Validate password match
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
        // After successfully adding the new user, fetch the updated user list
        fetchUsers(); // Re-fetch the users to include the newly created user
        setShowForm(false); // Close the form with smooth transition
        setFormData({
          name: "",
          email: "",
          contact: "", // Reset contact
          password: "",
          confirmPassword: "",
        }); // Reset form data
        toast.success("New customer added successfully!");
      } else {
        toast.error(result.error || "Error creating new user");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while adding the customer");
    }
  };

  // Filter users based on both contact (phone number) and name
  const filteredUsers = searchFilter
    ? users.filter(
        user =>
          (user.contact && user.contact.includes(searchFilter)) ||
          (user.name && user.name.toLowerCase().includes(searchFilter.toLowerCase()))
      )
    : users;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar /> {/* Add Sidebar */}
      <div className="users-list">
        <h1 className="header">Users List</h1>

        {/* Add New Customer Button */}
        <button
          className="add-customer-btn"
          onClick={handleAddNewCustomer}
        >
          {showForm ? "Close Form" : "Add New Customer"}
        </button>

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

        {/* Phone & Name Filter Input */}
        <div className="filter-container">
          <label htmlFor="searchFilter">Filter by Name or Phone:</label>
          <input
            type="text"
            name="searchFilter"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Enter name or contact"
          />
        </div>

        {/* Users Table */}
        <div className="users-table">
          <div className="users-table-format title">
            <b>Name</b>
            <b>Email</b>
            <b>Role</b>
            <b>Action</b>
          </div>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
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
      </div>
    </div>
  );
};

export default UsersList;
