import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_DOMAIN } from './config';
import './styles/auth.css';

function Login({ onSignUpClick }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
      const res = await axios.post(`${API_DOMAIN}/user/login`, formData);
      const { token } = res.data;

      // ✅ Save token to localStorage
      localStorage.setItem('token', token);

      console.log("Token saved:", token);
      setMessage('Login successful!');
      navigate('/court-booking'); // ✅ Navigate after login
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
