import React, { useState } from "react";
import Login from './Login';
import SignUp from './SignUp';
import "./App.css";

function App() {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleSignUp = () => setIsSignUp(true);
  const toggleSignIn = () => setIsSignUp(false);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ParkPlay <span className="icon"></span></h1>
        <h2>Court Reservations in seconds.</h2>
      </header>

      <div className="login-container">
        {/* Conditionally render login or sign-up form */}
        {!isSignUp ? (
          <Login onSignUpClick={toggleSignUp} />
        ) : (
          <SignUp onSignInClick={toggleSignIn} />
        )}
      </div>
    </div>
  );
}

export default App;
