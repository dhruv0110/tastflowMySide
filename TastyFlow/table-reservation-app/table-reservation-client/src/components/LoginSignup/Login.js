import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

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
    console.log(json);

    if (json.success) {
      localStorage.setItem('token', json.authtoken);
      navigate("/");
      props.showAlert("Logged In Successfully", "success");
    } else {
      props.showAlert("Invalid Credentials", "danger");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className='login-container'>
      <div className='login-card'>
        <h1 className='login-heading'>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" id="email" name='email' className="form-input" onChange={onChange} value={email} />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" id="password" name='password' className="form-input" onChange={onChange} value={password} />
          </div>
          <button type="submit" className="submit-btn">Login</button>
          <a href="/forgot-password" className="forgot-password-btn">Forgot Password?</a>
        </form>
      </div>
    </div>
  );
};

export default Login;