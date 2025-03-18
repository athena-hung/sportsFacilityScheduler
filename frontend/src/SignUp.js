import React from 'react';

function SignUp({ onSignInClick }) {
  return (
    <form className={`sign-up-form ${true ? 'active' : ''}`}>
      <div className="input-group">
        <label>Username</label>
        <input type="text" placeholder="Enter your username" />
      </div>

      <div className="input-group">
        <label>Email</label>
        <input type="email" placeholder="Enter your email" />
      </div>

      <div className="input-group">
        <label>Password</label>
        <input type="password" placeholder="Enter your password" />
      </div>

      <div className="input-group">
        <label>Confirm Password</label>
        <input type="password" placeholder="Confirm your password" />
      </div>

      {/* Create Account Button */}
      <button className="create-account-btn">Create Account</button>

      <p className="signup-text">
        Already have an account? <a href="#" onClick={onSignInClick}>Sign In</a>
      </p>
    </form>
  );
}

export default SignUp;
