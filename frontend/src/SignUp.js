// import React from 'react';

// function SignUp({ onSignInClick }) {
//   return (
//     <form className={`sign-up-form ${true ? 'active' : ''}`}>
//       <div className="input-group">
//         <label>Username</label>
//         <input type="text" placeholder="Enter your username" />
//       </div>

//       <div className="input-group">
//         <label>Email</label>
//         <input type="email" placeholder="Enter your email" />
//       </div>

//       <div className="input-group">
//         <label>Password</label>
//         <input type="password" placeholder="Enter your password" />
//       </div>

//       <div className="input-group">
//         <label>Confirm Password</label>
//         <input type="password" placeholder="Confirm your password" />
//       </div>

//       {/* Create Account Button */}
//       <button className="create-account-btn">Create Account</button>

//       <p className="signup-text">
//         Already have an account? <a href="#" onClick={onSignInClick}>Sign In</a>
//       </p>
//     </form>
//   );
// }

// export default SignUp;

import React, { useState } from 'react';
import axios from 'axios';

function SignUp({ onSignInClick }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      return setMessage("Passwords do not match.");
    }

    try {
      const response = await axios.post('http://localhost:3000/user/register', {
        firstName: formData.username,
        lastName: 'Last', // You can adjust this when you update the form later
        address: '123 Street', // Optional hardcoded for now
        birthdate: '2000-01-01', // Example birthdate
        maxCourtsPerDay: 1, // optional or ignore
        email: formData.email,
        password: formData.password,
        org_id: 1 //must match what exists in your database
      });

      console.log('User registered:', response.data);
      setMessage("Account created! You can now sign in.");
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <form className="sign-up-form active" onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Username</label>
        <input
          type="text"
          name="username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>

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

      <div className="input-group">
        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="create-account-btn">
        Create Account
      </button>

      {message && <p className="form-message">{message}</p>}

      <p className="signup-text">
        Already have an account? <a href="#" onClick={onSignInClick}>Sign In</a>
      </p>
    </form>
  );
}

export default SignUp;
