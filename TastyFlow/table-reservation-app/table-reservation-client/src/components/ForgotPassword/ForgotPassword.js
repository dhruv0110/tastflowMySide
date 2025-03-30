import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';
import logo from "../../assets/logo.svg";

function ForgotPassword(props) {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      props.showAlert('Please enter your email', 'error');
      return;
    }

    props.showAlert('Sending OTP...', 'info');

    try {
      const response = await axios.post('http://localhost:5000/api/users/forgot-password', { email });

      if (response.data.message === 'OTP sent successfully') {
        props.showAlert(null, null);
        props.showAlert('OTP sent successfully', 'success');
        setTimeout(() => {
          navigate('/reset-password');
        }, 1500);
      } else {
        props.showAlert(null, null);
        props.showAlert(response.data.message, 'error');
      }
    } catch (error) {
      console.error(error);
      props.showAlert(null, null);
      props.showAlert('Server error', 'error');
    }
  };

  return (
    <div className="fp-page-container">
      {/* Left side with restaurant image */}
      <div className="fp-image-container">
        <div className="fp-image-overlay"></div>
        <div className="fp-restaurant-quote">
          <h2>Welcome to</h2>
          <h1>TastyFlow</h1>
          <p>Where culinary excellence meets unforgettable experiences</p>
        </div>
      </div>
      
      {/* Right side with form */}
      <div className="fp-form-container">
        <div className="fp-content">
          {/* Restaurant logo */}
          <div className="fp-logo-container">
            <img src={logo} alt="Gourmet Haven" className="fp-logo-image" />
          </div>
          
          <div className="fp-card">
            <div className="fp-header">
              <h1 className="fp-heading">Forgot Password</h1>
              <p className="fp-subheading">Enter your email to receive a reset OTP</p>
            </div>
            
            <form onSubmit={handleSubmit} className="fp-form">
              <div className="fp-form-group">
                <input 
                  type="email" 
                  name='email' 
                  className="fp-form-input" 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email}
                  placeholder="Email Address"
                  required
                />
              </div>
              
              <button type="submit" className="fp-submit-btn">
                Send OTP
              </button>
              
              <div className="fp-auth-redirect">
                <p>Remember your password? <Link to="/login" className="fp-login-link">Sign In</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;