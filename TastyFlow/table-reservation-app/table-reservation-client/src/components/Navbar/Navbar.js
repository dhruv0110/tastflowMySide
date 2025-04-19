import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from "../../assets/logo.svg";

const Navbar = (props) => {
  let location = useLocation();
  let navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ name: "", email: "", id: "", role: "" });
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navbarCollapseRef = useRef(null);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
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
        const data = await response.json();
        localStorage.setItem("userDetails", JSON.stringify(data)); // Store in localStorage
        return data;
      } else {
        setIsLoading(false);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const getUserDetails = async () => {
      const userData = await fetchUserDetails();
      
      if (userData) {
        setUserDetails(userData);
      } else {
        setUserDetails({ name: "", email: "", id: "", role: "" });
      }
      setIsLoading(false);
    };

    // First check localStorage for user details
    const storedUserDetails = JSON.parse(localStorage.getItem("userDetails"));
    if (storedUserDetails) {
      setUserDetails(storedUserDetails);
      setIsLoading(false);
    } else {
      getUserDetails();
    }
  }, []);

  const logOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
    setUserDetails({ name: "", email: "", id: "", role: "" });
    props.showAlert("Logout Successfully", "success");
    navigate("/");
  };

  const handleAdminClick = () => {
    props.showAlert("Come to admin panel", "success");
  };

  const closeNavbar = () => {
    if (navbarCollapseRef.current && window.innerWidth <= 768) {
      const collapse = window.bootstrap.Collapse.getInstance(navbarCollapseRef.current);
      if (collapse) {
        collapse.hide();
      }
    }
  };

  function getInitials(name) {
    if (!name) return "";
    const nameArray = name.split(" ");
    const initials = nameArray.map(part => part[0]).join("");
    return initials.toUpperCase();
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container navbar-container">
          <Link className="navbar-brand" to="/">
            <img src={logo} alt="Logo" className="navbar-logo" />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent" ref={navbarCollapseRef}>
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link
                  className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
                  aria-current="page"
                  to="/"
                  onClick={closeNavbar}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${location.pathname === "/About" ? "active" : ""}`}
                  to="./About"
                  onClick={closeNavbar}
                >
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${location.pathname === "/Menu_Page" ? "active" : ""}`}
                  to="./Menu_Page"
                  onClick={closeNavbar} // Close the navbar on click
                >
                  Menu
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${location.pathname === "/Recipes" ? "active" : ""}`}
                  to="./Recipes"
                  onClick={closeNavbar} // Close the navbar on click
                >
                  Recipe
                </Link>
            </li>
            </ul>
            <div className="right-box d-flex align-items-center mt-2">
              {!isLoading && (
                <>
                  {userDetails.role !== 'admin' && (
                    <Link to="/table-reserve">
                      <button className="btn order-btn" type="button">Reserve now</button>
                    </Link>
                  )}
                  {localStorage.getItem("token") ? (
                    <>
                      {userDetails.role === 'admin' && (
                        <Link
                          className="btn admin-btn mx-2"
                          role="button"
                          to="/admin"
                          onClick={() => {
                            handleAdminClick();
                            closeNavbar();
                          }}
                        >
                          Admin
                        </Link>
                      )}
                      <button className="btn logout-btn mx-2" onClick={logOut}>Logout</button>
                      <Link className="nav-link user-icon" to="/info" onClick={closeNavbar}>
                        {getInitials(userDetails.name)}
                      </Link>
                    </>
                  ) : (
                    <form className="d-flex" role="search">
                      <Link className="btn auth-btn mx-2" to="/login" role="button" onClick={closeNavbar}>Login</Link>
                      <Link className="btn auth-btn" to="/signup" role="button" onClick={closeNavbar}>Signup</Link>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;