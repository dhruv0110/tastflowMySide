import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css'; // Add your CSS for styling

function ResetPassword(props) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [timer, setTimer] = useState(120); // Timer set to 120 seconds (2 minutes)
  const [isTimerActive, setIsTimerActive] = useState(true); // To handle timer activation
  const [alertShown, setAlertShown] = useState(false); // Flag to ensure alert is shown only once
  const navigate = useNavigate();

  useEffect(() => {
    if (isTimerActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);

      return () => clearInterval(interval); // Clear interval on component unmount or timer stop
    } else if (timer === 0 && !alertShown) {
      setIsTimerActive(false); // Stop the timer when it reaches 0
      props.showAlert('OTP expired. Please request a new one.', 'danger');
      setAlertShown(true); // Set the flag to true after showing the alert
      setOtp(''); // Clear the OTP field
    }
  }, [isTimerActive, timer, alertShown, props]);

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!isTimerActive) {
      // If the timer has expired, prevent resetting the password
      props.showAlert('OTP has expired. Please request a new one.', 'danger');
      navigate('/forgot-password'); // Redirect to the page where the user can request a new OTP
      return;
    }

    axios.post('http://localhost:5000/api/users/reset-password', { email, otp, newPassword })
      .then(res => {
        if (res.data.message === 'Password reset successfully') {
          props.showAlert('Password changed successfully', 'success');
          navigate('/login');
        } else {
          props.showAlert(res.data.message, 'danger');
        }
      })
      .catch(err => {
        console.error(err);
        props.showAlert('Error resetting password', 'danger');
      });
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h1 className="reset-heading">Reset Password</h1>
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter Email"
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="form-group">
            <label htmlFor="otp" className="form-label">OTP</label>
            <input
              type="text"
              id="otp"
              name="otp"
              className="form-input"
              placeholder="Enter OTP"
              autoComplete="off"
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              disabled={!isTimerActive} // Disable input if OTP has expired
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="form-input"
              placeholder="Enter New Password"
              autoComplete="off"
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
            />
          </div>
          <div className="timer">
            <p>Time Remaining: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</p>
          </div>
          <button type="submit" className="submit-btn" disabled={!isTimerActive}>
            Reset Password
          </button>
        </form>
        {!isTimerActive && (
          <div className="request-new-otp">
            <p>OTP expired? <a href="/forgot-password">Request a new one</a></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
