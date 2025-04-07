"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import courtImage from "../src/pics/Court_listing.png"
import courtNorth from "../src/pics/northpark.png"
import "./CourtBooking.css"
import { useToast } from "./context/ToastContext" // Import useToast

const CourtBooking = () => {
  const [location, setLocation] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [duration, setDuration] = useState("")
  const [cartCount, setCartCount] = useState(0)

  const navigate = useNavigate()
  const { showToast } = useToast() // Use the toast hook

  // Sample location data (this could be dynamically fetched)
  const locations = ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami"]

  // Load saved form data and cart count on component mount
  useEffect(() => {
    // Load booking form data from localStorage
    const savedLocation = localStorage.getItem("bookingLocation") || ""
    const savedStartDate = localStorage.getItem("bookingStartDate") || ""
    const savedEndDate = localStorage.getItem("bookingEndDate") || ""
    const savedStartTime = localStorage.getItem("bookingStartTime") || ""
    const savedEndTime = localStorage.getItem("bookingEndTime") || ""
    const savedDuration = localStorage.getItem("bookingDuration") || ""

    // Set the state with saved values
    setLocation(savedLocation)
    setStartDate(savedStartDate)
    setEndDate(savedEndDate)
    setStartTime(savedStartTime)
    setEndTime(savedEndTime)
    setDuration(savedDuration)

    // Load cart count
    const storedCart = localStorage.getItem("cartItems")
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart)
      setCartCount(parsedCart.length)
    }
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("bookingLocation", location)
    localStorage.setItem("bookingStartDate", startDate)
    localStorage.setItem("bookingEndDate", endDate)
    localStorage.setItem("bookingStartTime", startTime)
    localStorage.setItem("bookingEndTime", endTime)
    localStorage.setItem("bookingDuration", duration)
  }, [location, startDate, endDate, startTime, endTime, duration])

  // Filter available courts based on location
  const filteredCourts = [
    {
      id: 1,
      location: "New York",
      name: "Nickajack Park",
      rating: 4.0,
      image: courtImage,
      price: 25.0,
    },
    {
      id: 2,
      location: "Alpharetta",
      name: "North Park Pickleball",
      rating: 4.5,
      image: courtNorth,
      price: 30.0,
    },
    ,
  ].filter((court) => !location || court.location.toLowerCase().includes(location.toLowerCase()))

  const handleBookCourt = (court) => {
    // Validate required fields
    if (!startDate) {
      showToast("Please select a date before booking.", "error")
      return
    }
    if (!startTime) {
      showToast("Please select a start time before booking.", "error")
      return
    }
    if (!endTime) {
      showToast("Please specify an end time before booking.", "error")
      return
    }
    if (!duration) {
      showToast("Please specify a duration before booking.", "error")
      return
    }

    // Navigate to the BookingDetails page with the selected court and date/time details
    navigate("/booking-details", {
      state: {
        court,
        startDate,
        endDate,
        startTime,
        endTime,
        duration,
      },
    })
  }

  const handleAddToCart = (court) => {
    // Validate required fields
    if (!startDate) {
      showToast("Please select a date before adding to the cart.", "error")
      return
    }
    if (!startTime) {
      showToast("Please select a start time before adding to the cart.", "error")
      return
    }
    if (!endTime) {
      showToast("Please specify an end time before adding to the cart.", "error")
      return
    }
    if (!duration) {
      showToast("Please specify a duration before adding to the cart.", "error")
      return
    }

    // Create a cart item with all necessary details
    const cartItem = {
      id: Date.now(), // Generate a unique ID
      courtId: court.id,
      name: court.name,
      image: court.image,
      date: startDate,
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      price: court.price,
    }

    // Get existing cart items from localStorage
    const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || []

    // Add new item to cart
    const updatedCart = [...existingCartItems, cartItem]

    // Save updated cart to localStorage
    localStorage.setItem("cartItems", JSON.stringify(updatedCart))

    // Update cart count
    setCartCount(updatedCart.length)

    // Show confirmation to user using toast instead of alert
    showToast(`${court.name} has been added to your cart!`, "success")
  }

  const navigateToCart = () => {
    console.log("Navigating to cart...")
    navigate("/cart")
  }

  // Format date for display (if needed)
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
  }

  return (
    <div className="court-booking-container">
      <div className="booking-header">
        <h2>Find a Court</h2>
        <div className="cart-icon-container" onClick={navigateToCart} role="button" aria-label="View cart" tabIndex={0}>
          <div className="cart-icon">🛒</div>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </div>
      </div>

      {/* Location Filter */}
      <div className="input-group">
        <label>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Search by location"
        />
      </div>

      {/* Search Filters */}
      <div className="search-filters">
        <div className="input-group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="mm/dd/yyyy"
          />
        </div>
        <div className="input-group">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="mm/dd/yyyy" />
        </div>
        <div className="input-group">
          <label>Start Time</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="--:-- --" />
        </div>
        <div className="input-group">
          <label>End Time</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="--:-- --" />
        </div>
        <div className="input-group">
          <label>Duration (mins)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter duration in minutes"
          />
        </div>
      </div>

      {/* Available Courts */}
      <h3>Available Courts</h3>
      <div className="court-listing">
        {filteredCourts.length > 0 ? (
          filteredCourts.map((court) => (
            <div key={court.id} className="court-item">
              <img src={court.image || "/placeholder.svg"} alt={court.name} className="court-image" />
              <div className="court-info">
                <p className="court-name">
                  {court.name} ★ {court.rating}
                </p>
                <p className="court-price">${court.price.toFixed(2)} per hour</p>
                <div className="court-buttons">
                  <button className="add-to-cart-btn" onClick={() => handleAddToCart(court)}>
                    Add to Cart
                  </button>
                  <button className="book-court-btn" onClick={() => handleBookCourt(court)}>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No courts available for the selected location.</p>
        )}
      </div>
    </div>
  )
}

export default CourtBooking

