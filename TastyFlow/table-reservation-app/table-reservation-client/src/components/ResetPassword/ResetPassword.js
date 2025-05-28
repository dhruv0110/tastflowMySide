import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';
import logo from "../../assets/logo.svg";
import { message } from 'antd';

function ResetPassword(props) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [timer, setTimer] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [alertShown, setAlertShown] = useState(false);
  const navigate = useNavigate();
  const otpInputs = useRef([]);

  useEffect(() => {
    if (isTimerActive && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !alertShown) {
      setIsTimerActive(false);
      message.error('OTP expired. Please request a new one.');
      setAlertShown(true);
      setOtp(['', '', '', '', '', '']);
    }
  }, [isTimerActive, timer, alertShown, props]);

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    const otpArray = pasteData.split('').slice(0, 6);

    const newOtp = [...otp];
    otpArray.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);

    if (otpArray.length > 0) {
      otpInputs.current[Math.min(otpArray.length - 1, 5)].focus();
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!isTimerActive) {
      message.info('OTP has expired. Please request a new one.');
      navigate('/forgot-password');
      return;
    }

    const otpString = otp.join('');
    axios.post('http://localhost:5000/api/users/reset-password', { email, otp: otpString, newPassword })
      .then(res => {
        if (res.data.message === 'Password reset successfully') {
          message.success('Password changed successfully');
          navigate('/login');
        } else {
          message.error(res.data.message);
        }
      })
      .catch(err => {
        console.error(err);
        message.error('Error resetting password');
      });
  };

  return (
    <div className="rp-page-container">
      {/* Left side with restaurant image */}
      <div className="rp-image-container">
        <div className="rp-image-overlay"></div>
        <div className="rp-restaurant-quote">
          <h2>Welcome to</h2>
          <h1>Gourmet Haven</h1>
          <p>Where culinary excellence meets unforgettable experiences</p>
        </div>
      </div>
      
      {/* Right side with form */}
      <div className="rp-form-container">
        <div className="rp-content">
          {/* Restaurant logo */}
          <div className="rp-logo-container">
            <img src={logo} alt="Gourmet Haven" className="rp-logo-image" />
          </div>
          
          <div className="rp-card">
            <div className="rp-header">
              <h1 className="rp-heading">Reset Password</h1>
              <p className="rp-subheading">Enter your new password and OTP</p>
            </div>
            
            <form onSubmit={handleResetPassword} className="rp-form">
              <div className="rp-form-group">
                <input 
                  type="email" 
                  name='email' 
                  className="rp-form-input" 
                  onChange={(e) => setEmail(e.target.value)} 
                  value={email}
                  placeholder="Email Address"
                  required
                />
              </div>
              
              <div className="rp-form-group">
                <div className="rp-otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      className="rp-otp-input"
                      placeholder=""
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onPaste={handleOtpPaste}
                      ref={(el) => (otpInputs.current[index] = el)}
                      disabled={!isTimerActive}
                    />
                  ))}
                </div>
              </div>
              
              <div className="rp-form-group">
                <input 
                  type="password" 
                  name='newPassword' 
                  className="rp-form-input" 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  value={newPassword}
                  placeholder="New Password"
                  required
                />
              </div>
              
              <div className="rp-timer">
                <p>Time Remaining: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</p>
              </div>
              
              <button type="submit" className="rp-submit-btn" disabled={!isTimerActive}>
                Reset Password
              </button>
              
              {!isTimerActive && (
                <div className="rp-auth-redirect">
                  <p>OTP expired? <Link to="/forgot-password" className="rp-login-link">Request a new one</Link></p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;