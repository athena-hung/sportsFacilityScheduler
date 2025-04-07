"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./BookingDetails.css"
import { useToast } from "./context/ToastContext" // Import useToast

const BookingDetails = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [addedToCart, setAddedToCart] = useState(false)
  const { showToast } = useToast() // Use the toast hook

  // Safely access the state and provide default values
  const state = location.state || {}

  // Get values from state or localStorage if not available in state
  const [bookingData, setBookingData] = useState({
    court: state.court || {},
    startDate: state.startDate || localStorage.getItem("bookingStartDate") || "",
    endDate: state.endDate || localStorage.getItem("bookingEndDate") || "",
    startTime: state.startTime || localStorage.getItem("bookingStartTime") || "",
    endTime: state.endTime || localStorage.getItem("bookingEndTime") || "",
    duration: state.duration || localStorage.getItem("bookingDuration") || "",
  })

  // Destructure for easier access
  const { court, startDate, endDate, startTime, endTime, duration } = bookingData

  // Handle missing court data
  useEffect(() => {
    if (!court.name) {
      // If no court data in state, check if we have a selected court in localStorage
      const savedCourt = localStorage.getItem("selectedCourt")
      if (savedCourt) {
        setBookingData((prev) => ({
          ...prev,
          court: JSON.parse(savedCourt),
        }))
      }
    } else {
      // Save the court data to localStorage
      localStorage.setItem("selectedCourt", JSON.stringify(court))
    }
  }, [court])

  if (!court.name) {
    return (
      <div className="booking-details-container">
        <h2 className="error-title">Error: Missing Court Information</h2>
        <p className="error-message">Please select a court from the court listing first.</p>
        <button className="back-button" onClick={() => navigate("/court-booking")}>
          Return to Court Listing
        </button>
      </div>
    )
  }

  const handleAddToCart = () => {
    // Create a cart item with all necessary details
    const cartItem = {
      id: Date.now(), // Generate a unique ID
      courtId: court.id,
      name: court.name,
      image: court.image,
      date: startDate || "2025-05-05", // Default date if not selected
      startTime: startTime || "10:00", // Default time if not selected
      endTime: endTime || "11:00", // Default time if not selected
      duration: duration || 60, // Default duration if not selected
      price: court.price || 25.0, // Default price if not available
    }

    // Get existing cart items from localStorage
    const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || []

    // Add new item to cart
    const updatedCart = [...existingCartItems, cartItem]

    // Save updated cart to localStorage
    localStorage.setItem("cartItems", JSON.stringify(updatedCart))

    // Update state to show success message
    setAddedToCart(true)

    // Show toast notification
    showToast("Added to cart successfully!", "success")

    // Automatically navigate to cart after a short delay
    setTimeout(() => {
      navigate("/cart")
    }, 1500)
  }

  const handleConfirmBooking = () => {
    navigate("/payment")
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    try {
      // Split the date string to handle it manually to avoid timezone issues
      const [year, month, day] = dateString.split("-").map((num) => Number.parseInt(num, 10))

      // Create a date object with the correct values
      // Note: months are 0-indexed in JavaScript Date
      const date = new Date(year, month - 1, day)

      // Format the date using toLocaleDateString
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    } catch (e) {
      console.error("Error formatting date:", e, dateString)
      return dateString || "Not specified"
    }
  }

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "Not specified"
    try {
      // For time strings like "14:30"
      const [hours, minutes] = timeString.split(":")
      const time = new Date()
      time.setHours(Number.parseInt(hours, 10))
      time.setMinutes(Number.parseInt(minutes, 10))
      return time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    } catch (e) {
      return timeString || "Not specified"
    }
  }

  return (
    <div className="booking-details-container">
      <h2 className="booking-title">Booking Details</h2>
      <div className="court-details">
        {court.image && <img src={court.image || "/placeholder.svg"} alt={court.name} className="court-image" />}
        <div className="court-info">
          <h3 className="court-name">{court.name}</h3>
          <p className="court-location">
            <strong>Location:</strong> {court.location}
          </p>
          <p className="court-rating">
            <strong>Rating:</strong> {court.rating} ★
          </p>
          {court.price && (
            <p className="court-price">
              <strong>Price:</strong> ${court.price.toFixed(2)} per hour
            </p>
          )}
        </div>
      </div>
      <div className="booking-info">
        <h3 className="section-title">Reservation Details</h3>
        <p>
          <strong>Start Date:</strong> {formatDate(startDate)}
        </p>
        <p>
          <strong>End Date:</strong> {formatDate(endDate)}
        </p>
        <p>
          <strong>Start Time:</strong> {formatTime(startTime)}
        </p>
        <p>
          <strong>End Time:</strong> {formatTime(endTime)}
        </p>
        <p>
          <strong>Duration:</strong> {duration || "Not specified"} minutes
        </p>
      </div>

      {addedToCart && (
        <div className="success-message">
          <p>✅ Added to cart successfully! Redirecting to cart...</p>
        </div>
      )}

      <div className="action-buttons">
        <button className="back-button" onClick={() => navigate("/court-booking")}>
          Back to Court Listing
        </button>
        <div className="right-buttons">
          <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={addedToCart}>
            {addedToCart ? "Added to Cart" : "Add to Cart"}
          </button>
          <button className="confirm-booking-btn" onClick={handleConfirmBooking}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails

