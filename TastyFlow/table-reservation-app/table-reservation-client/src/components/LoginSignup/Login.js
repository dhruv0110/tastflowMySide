import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import logo from "../../assets/logo.svg";
import { message } from 'antd';

const Login = (props) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  let navigate = useNavigate();
  const { email, password } = credentials;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password
      }),
    });

    const json = await response.json();
    // console.log(json);

    if (json.success) {
      localStorage.setItem('token', json.authtoken);
      navigate("/");
      message.success("Logged In Successfully");
    } else {
      message.error("Invalid Credentials");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className='lgn-page-container'>
      {/* Left side with restaurant image */}
      <div className='lgn-image-container'>
        <div className='lgn-image-overlay'></div>
        <div className='lgn-restaurant-quote'>
          <h2>Welcome to</h2>
          <h1>Tastyflow</h1>
          <p>Crafting culinary excellence since 1995</p>
        </div>
      </div>
      
      {/* Right side with login form */}
      <div className='lgn-form-container'>
        {/* Restaurant logo */}
        <div className='lgn-logo-container'>
          <img src={logo} alt="TastyFlow" className='lgn-logo-image' />
        </div>
        
        {/* Login form */}
        <div className='lgn-card'>
          <h1 className='lgn-heading'>Sign In</h1>
          <p className='lgn-subheading'>Access your account to continue</p>
          
          <form onSubmit={handleSubmit} className="lgn-form">
            <div className="lgn-form-group">
              <label htmlFor="email" className="lgn-form-label">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name='email' 
                className="lgn-form-input" 
                onChange={onChange} 
                value={email} 
                placeholder="Enter your email"
              />
            </div>
            
            <div className="lgn-form-group">
              <label htmlFor="password" className="lgn-form-label">Password</label>
              <input 
                type="password" 
                id="password" 
                name='password' 
                className="lgn-form-input" 
                onChange={onChange} 
                value={password} 
                placeholder="••••••••"
              />
            </div>
            
            <div className="lgn-form-options">
              <div className="lgn-remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="/forgot-password" className="lgn-forgot-password">Forgot Password?</Link>
            </div>
            
            <button type="submit" className="lgn-submit-btn">Sign In</button>
            
            <div className="lgn-signup-link">
              Don't have an account? <Link to="/signup" className="lgn-signup-link-text">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;