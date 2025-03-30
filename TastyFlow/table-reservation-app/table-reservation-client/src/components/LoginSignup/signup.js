import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';
import logo from "../../assets/logo.svg";

const Signup = (props) => {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
    contact: ""
  });

  let navigate = useNavigate();
  const { name, email, password, cpassword, contact } = credentials;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== cpassword) {
      props.showAlert("Passwords do not match", "danger");
      return;
    }

    const response = await fetch("http://localhost:5000/api/users/createuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        contact,
      }),
    });

    const json = await response.json();

    if (json.success) {
      localStorage.setItem('token', json.authtoken);
      navigate("/login");
      props.showAlert("Account Created Successfully", "success");
    } else {
      props.showAlert(json.error || "Registration failed", "danger");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className='signup-page-container'>
      {/* Left side with restaurant image */}
      <div className='signup-image-container'>
        <div className='image-overlay'></div>
        <div className='restaurant-quote'>
          <h2>Welcome to</h2>
          <h1>Tastyflow</h1>
          <p>Where culinary excellence meets unforgettable experiences</p>
          <div className="benefits-list">
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Exclusive member rewards</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Priority reservations</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Personalized dining recommendations</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side with signup form */}
      <div className='signup-form-container'>
        <div className='signup-content'>
          {/* Restaurant logo */}
          <div className='restaurant-logo'>
            <img src={logo} alt="Gourmet Haven" className='logo-image' />
          </div>
          
          <div className='signup-card'>
            <div className='signup-header'>
              <h1 className='signup-heading'>Create Your Account</h1>
              <p className='signup-subheading'>Join our culinary community today</p>
            </div>
            
            <form onSubmit={handleSubmit} className='compact-form'>
              <div className="form-group">
                <input 
                  type="text" 
                  name='name' 
                  className="form-input" 
                  onChange={onChange} 
                  value={name}
                  placeholder="Full Name"
                  required
                />
              </div>
              
              <div className="form-group">
                <input 
                  type="email" 
                  name='email' 
                  className="form-input" 
                  onChange={onChange} 
                  value={email}
                  placeholder="Email Address"
                  required
                />
              </div>
              
              <div className="form-group">
                <input 
                  type="tel" 
                  name='contact' 
                  className="form-input" 
                  onChange={onChange} 
                  value={contact}
                  placeholder="Phone Number"
                  required
                />
              </div>
              
              <div className="form-group">
                <input 
                  type="password" 
                  name='password' 
                  className="form-input" 
                  onChange={onChange} 
                  value={password}
                  placeholder="Create Password (min 6 characters)"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="form-group">
                <input 
                  type="password" 
                  name='cpassword' 
                  className="form-input" 
                  onChange={onChange} 
                  value={cpassword}
                  placeholder="Confirm Password"
                  required
                  minLength={6}
                />
              </div>
              
              <button type="submit" className="submit-btn">
                Create Account
              </button>
              
              <div className="terms-agreement">
                <p>By creating an account, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></p>
              </div>
            </form>
            
            <div className="auth-redirect">
              <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;