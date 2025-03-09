import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from "../../assets/logo.svg";

const Navbar = (props) => {
  let location = useLocation();
  let navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({ name: "", email: "", id: "", role: "" });
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

      // eslint-disable-next-line
      if (userData) {
        setUserDetails(userData); // Set userDetails to the fetched user's details
      } else {
        setUserDetails({ name: "", email: "", id: "" }); // Reset userDetails if fetch fails
      }
    };

    getUserDetails();
  }, [localStorage.getItem("token")]);
  // Reference for the navbar collapse
  const navbarCollapseRef = useRef(null);

  const logOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
    setUserDetails({ name: "", email: "", id: "", role: "" }); // Clear user details state
    props.showAlert("Logout Successfully", "success");
    navigate("/login");
  };

  const handleAdminClick = () => {
    props.showAlert("Come to admin panel", "success");
  };


  const updateUserDetailsFromLocalStorage = () => {
    const storedUserDetails = JSON.parse(localStorage.getItem("userDetails"));
    if (storedUserDetails) {
      setUserDetails(storedUserDetails);
    } else {
      setUserDetails({ name: "", email: "", id: "", role: "" });
    }
  };

  useEffect(() => {
    updateUserDetailsFromLocalStorage();
  }, [localStorage.getItem("token")]); // Dependency on token to re-fetch user details

  // Handle token change explicitly
  useEffect(() => {
    const handleTokenChange = () => {
      const token = localStorage.getItem("token");
      if (token) {
        updateUserDetailsFromLocalStorage();
      } else {
        setUserDetails({ name: "", email: "", id: "", role: "" });
      }
    };

    handleTokenChange();
  }, [localStorage.getItem("token")]);

  // Function to close navbar with transition
  const closeNavbar = () => {
    if (navbarCollapseRef.current && window.innerWidth <= 768) {
      const collapse = window.bootstrap.Collapse.getInstance(navbarCollapseRef.current);
      if (collapse) {
        collapse.hide();  // Collapse the navbar using Bootstrap's collapse method with transition
      }
    }
  };
  function getInitials(name) {
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
                  onClick={closeNavbar} // Close the navbar on click
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${location.pathname === "/About" ? "active" : ""}`}
                  to="./About"
                  onClick={closeNavbar} // Close the navbar on click
                >
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" onClick={closeNavbar}>Menu</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" onClick={closeNavbar}>Recipe</Link>
              </li>
            </ul>
            <div className="right-box d-flex align-items-center mt-2">
              {/* Show "Reserve now" button only if the user is not an admin */}
              {userDetails.role !== 'admin' && (
                <Link to="/table-reserve">
                  <button className="btn order-btn" type="button">Reserve now</button>
                </Link>
              )}
              {localStorage.getItem("token") ? (
                <>
                  {userDetails.role === 'admin' &&
                    <Link
                      className="btn admin-btn mx-2"
                      role="button"
                      to="/admin"
                      onClick={() => {
                        handleAdminClick();
                        closeNavbar(); // Close the navbar on admin button click
                      }}
                    >
                      Admin
                    </Link>
                  }
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
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
