// import React from 'react';

// function Login({ onSignUpClick }) {
//   return (
//     <form className="login-form">
//       <div className="input-group">
//         <label>Username</label>
//         <input type="text" placeholder="Enter your username" />
//       </div>

//       <div className="input-group">
//         <label>Password</label>
//         <input type="password" placeholder="Enter your password" />
//       </div>

//       <div className="button-group">
//         <button className="admin-btn">Admin</button>
//         <button className="user-btn">User</button>
//       </div>

//       <button className="sign-in-btn">Sign In</button>

//       <p className="signup-text">
//         Don’t have an account? <a href="#" onClick={onSignUpClick}>Sign up</a>
//       </p>
//     </form>
//   );
// }

// export default Login;


import React, { useState } from 'react';
import axios from 'axios';

function Login({ onSignUpClick }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await axios.post('http://localhost:3000/user/login', formData);
      const { token } = res.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      setMessage('Login successful!');
      console.log('Logged in, token:', token);
    } catch (err) {
      console.error('Login error:', err);
      setMessage(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-group">
        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="sign-in-btn">Sign In</button>

      {message && <p className="form-message">{message}</p>}

      <p className="signup-text">
        Don't have an account? <a href="#" onClick={onSignUpClick}>Sign up</a>
      </p>
    </form>
  );
}

export default Login;
