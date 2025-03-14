import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { useNavigate } from 'react-router-dom';

const Admin = ({showAlert}) => {
  const [userDetails, setUserDetails] = useState({ name: "", email: "", id: "" }); // State to hold the user's details
    let navigate = useNavigate();
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return null;
        }
        const response = await fetch("http://localhost:5000/api/users/getuser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          },
        });
        if (response.ok) {
          return await response.json();
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error fetching user details:", error.message);
        return null;
      }
    };
  
    useEffect(() => {
      const getUserDetails = async () => {
        const userData = await fetchUserDetails();
        setUserDetails(userData);
      };
  
      getUserDetails();
    }, []);
  return (
    <div style={{backgroundColor:"#1B1C1F",borderTop:"1.5px solid #a9a9a9",display:"flex"}}>
      <Sidebar showAlert={showAlert}/>
      <div style={{color:"white",width:"100%"}}>
        <h1 style={{textAlign:"center",marginTop:"17rem"}}>Welcome to Admin Panel</h1>
      </div>
    </div>
  )
}

export default Admin
