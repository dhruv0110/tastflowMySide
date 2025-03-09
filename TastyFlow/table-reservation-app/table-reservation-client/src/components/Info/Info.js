import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Info.css';

const Info = () => {
  const [userDetails, setUserDetails] = useState({ name: "", email: "", id: "" }); // State to hold the user's details
  let navigate = useNavigate();
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return null; // Return null if token is not available
      }
      const response = await fetch("http://localhost:5000/api/users/getuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });
      if (response.ok) {
        return await response.json(); // Return the fetched user's details
      } else {
        return null; // Return null if fetch fails
      }
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      return null; // Return null if an error occurs
    }
  };

  useEffect(() => {
    const getUserDetails = async () => {
      const userData = await fetchUserDetails();
      if(localStorage.getItem("token")){
        setUserDetails(userData);
      }else{
        navigate("/login");
      }
       // eslint-disable-next-line
      if (userData) {
        setUserDetails(userData); // Set userDetails to the fetched user's details
      } else {
        setUserDetails({ name: "", email: "", id: "" }); // Reset userDetails if fetch fails
      }
    };

    getUserDetails();
  }, []);

  return (
    <div className='container info my-4'>
      <h1>Personal Information</h1>
      {userDetails.name ? (
        <table className='user-table'>
          <tbody>
            <tr>
              <th>User Name:</th>
              <td>{userDetails.name}</td>
            </tr>
            <tr>
              <th>User Email:</th>
              <td>{userDetails.email}</td>
            </tr>
            <tr>
              <th>User ID:</th>
              <td>{userDetails._id}</td>
            </tr>
            <tr>
              <th>User Role:</th>
              <td>{userDetails.role}</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p className='no-details'>No user details available.</p>
      )}
    </div>
  );
};

export default Info;
