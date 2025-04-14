import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import CancelBooking from "./CancelBooking";
import BookingCancelled from "./BookingCancelled";
import PaymentForm from "./PaymentForm";
import ConfirmedBookings from "./ConfirmedBookings";
import CourtBooking from "./CourtBooking";
import BookingDetails from "./BookingDetails";
import Cart from "./Cart";
import Navbar from "./Navbar"; 
import "./App.css";
import ProfilePage from "./ProfilePage";
import EasterEgg from "./EasterEgg";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleSignUp = () => setIsSignUp(true);
  const toggleSignIn = () => setIsSignUp(false);

  return (
    <Router>
      <Routes>
        {/* Login/Signup Page - No Navbar */}
        <Route
          path="/"
          element={
            localStorage.getItem('token') ? (
              <Navigate to="/court-booking" replace />
            ) : (
              <div className="app-container">
                <header className="app-header">
                  <h1>ParkPlay <span className="icon"></span></h1>
                  <h2>Court Reservations in seconds.</h2>
                </header>

                <div className="login-container">
                  {!isSignUp ? (
                    <Login onSignUpClick={toggleSignUp} />
                  ) : (
                    <SignUp onSignInClick={toggleSignIn} />
                  )}
                </div>
              </div>
            )
          }
        />

        {/* Public Help Route */}
        <Route path="/help" element={<EasterEgg />} />

        {/* Protected Routes WITH Navbar */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Routes>
                  <Route path="court-booking" element={<CourtBooking />} />
                  <Route path="cancel-booking" element={<CancelBooking />} />
                  <Route path="booking-cancelled" element={<BookingCancelled />} />
                  <Route path="booking-details" element={<BookingDetails />} />
                  <Route path="payment" element={<PaymentForm />} />
                  <Route path="confirmed-bookings" element={<ConfirmedBookings />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Routes>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
