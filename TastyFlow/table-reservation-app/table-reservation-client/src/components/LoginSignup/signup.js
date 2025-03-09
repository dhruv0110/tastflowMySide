import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // Import the CSS file

const Signup = (props) => {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
    contact: "" // Add contact field
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
        contact, // Include contact field
      }),
    });

    const json = await response.json();
    console.log(json);

    if (json.success) {
      localStorage.setItem('token', json.authtoken);
      navigate("/login");
      props.showAlert("Account Created Successfully", "success");
    } else {
      props.showAlert("Invalid Credentials", "danger");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className='signup-container'>
      <div className='signup-card'>
        <h1 className='signup-heading'>Sign Up</h1>
        <form onSubmit={handleSubmit} className='signup-form'>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="text" className="form-input" id="name" name='name' onChange={onChange} aria-describedby="nameHelp" />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-input" id="email" name='email' onChange={onChange} aria-describedby="emailHelp" />
          </div>
          <div className="form-group">
            <label htmlFor="contact" className="form-label">Contact Number</label>
            <input type="text" className="form-input" id="contact" name='contact' onChange={onChange} aria-describedby="contactHelp" />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-input" id="password" name='password' onChange={onChange} required minLength={5} />
          </div>
          <div className="form-group">
            <label htmlFor="cpassword" className="form-label">Confirm Password</label>
            <input type="password" className="form-input" id="cpassword" name='cpassword' onChange={onChange} required minLength={5} />
          </div>
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
