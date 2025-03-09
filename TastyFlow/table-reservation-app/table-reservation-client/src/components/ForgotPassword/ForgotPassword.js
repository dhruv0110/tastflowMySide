import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';

function ForgotPassword(props) {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      props.showAlert('Please enter your email', 'error');
      return;
    }

    // Show loading alert
    props.showAlert('Sending OTP...', 'info');

    try {
      const response = await axios.post('http://localhost:5000/api/users/forgot-password', { email });

      if (response.data.message === 'OTP sent successfully') {
        // Clear the loading alert
        props.showAlert(null, null); // Clear any existing alert

        // Show success alert
        props.showAlert('OTP sent successfully', 'success');

        // Delay navigation to ensure the success alert is visible
        setTimeout(() => {
          navigate('/reset-password');
        }, 1500); // Adjust delay as needed
      } else {
        // Clear the loading alert
        props.showAlert(null, null); // Clear any existing alert

        // Show error message
        props.showAlert(response.data.message, 'error');
      }
    } catch (error) {
      console.error(error);
      // Clear the loading alert
      props.showAlert(null, null); // Clear any existing alert

      // Show server error message
      props.showAlert('Server error', 'error');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h4 className="forgot-password-heading">Forgot Password</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              autoComplete="off"
              name="email"
              className="form-input"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <button type="submit" className="submit-btn mt-3">Send OTP</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
