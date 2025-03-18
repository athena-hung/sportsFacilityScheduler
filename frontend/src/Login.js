import React from 'react';

function Login({ onSignUpClick }) {
  return (
    <form className="login-form">
      <div className="input-group">
        <label>Username</label>
        <input type="text" placeholder="Enter your username" />
      </div>

      <div className="input-group">
        <label>Password</label>
        <input type="password" placeholder="Enter your password" />
      </div>

      <div className="button-group">
        <button className="admin-btn">Admin</button>
        <button className="user-btn">User</button>
      </div>

      <button className="sign-in-btn">Sign In</button>

      <p className="signup-text">
        Don’t have an account? <a href="#" onClick={onSignUpClick}>Sign up</a>
      </p>
    </form>
  );
}

export default Login;
