"use client"

import { useState } from "react"
import Login from "./Login"
import SignUp from "./SignUp"
import CancelBooking from "./CancelBooking"
import BookingCancelled from "./BookingCancelled"
import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import PaymentForm from "./PaymentForm"
import ConfirmedBookings from "./ConfirmedBookings"
import CourtBooking from "./CourtBooking"
import BookingDetails from "./BookingDetails"
import Cart from "./Cart"
import { ToastProvider } from "./context/ToastContext" // Import the ToastProvider

function App() {
  const [isSignUp, setIsSignUp] = useState(false)

  const toggleSignUp = () => setIsSignUp(true)
  const toggleSignIn = () => setIsSignUp(false)

  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Default page = Login/SignUp toggle */}
          <Route
            path="/"
            element={
              <div className="app-container">
                <header className="app-header">
                  <h1>
                    ParkPlay <span className="icon"></span>
                  </h1>
                  <h2>Court Reservations in seconds.</h2>
                </header>

                <div className="login-container">
                  {!isSignUp ? <Login onSignUpClick={toggleSignUp} /> : <SignUp onSignInClick={toggleSignIn} />}
                </div>
              </div>
            }
          />
          <Route path="/court-booking" element={<CourtBooking />} />
          <Route path="/cancel-booking" element={<CancelBooking />} />
          <Route path="/booking-cancelled" element={<BookingCancelled />} />
          <Route path="/booking-details" element={<BookingDetails />} />
          <Route path="/payment" element={<PaymentForm />} />
          <Route path="/confirmed-bookings" element={<ConfirmedBookings />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App

