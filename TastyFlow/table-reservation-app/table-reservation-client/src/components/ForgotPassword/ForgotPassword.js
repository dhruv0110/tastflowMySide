import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';
import logo from "../../assets/logo.svg";
import { message } from 'antd';

function ForgotPassword(props) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for button disable
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      message.error('Please enter your email');
      return;
    }

    setIsSubmitting(true); // Disable the button
    message.info('Sending OTP...');

    try {
      const response = await axios.post('http://localhost:5000/api/users/forgot-password', { email });

      if (response.data.message === 'OTP sent successfully') {
        message.success('OTP sent successfully');
        navigate('/reset-password');
      } else {
        message.error(response.data.message);
        setIsSubmitting(false); // Re-enable if there's an error
      }
    } catch (error) {
      console.error(error);
      message.error('Server error');
      setIsSubmitting(false); // Re-enable if there's an error
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
              
              <button 
                type="submit" 
                className="fp-submit-btn"
                disabled={isSubmitting} // Button is disabled when isSubmitting is true
              >
                {isSubmitting ? 'Sending...' : 'Send OTP'}
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