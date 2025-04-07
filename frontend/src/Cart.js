"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./CSS/Cart.css"

const Cart = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)

  // Fetch cart items from local storage
  useEffect(() => {
    const storedCart = localStorage.getItem("cartItems")
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart)
      setCartItems(parsedCart)

      // Calculate total amount
      const total = parsedCart.reduce((sum, item) => sum + item.price, 0)
      setTotalAmount(total)
    }
  }, [])

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem("cartItems", JSON.stringify(updatedCart))

    // Recalculate total
    const total = updatedCart.reduce((sum, item) => sum + item.price, 0)
    setTotalAmount(total)
  }

  const handleProceedToCheckout = () => {
    navigate("/payment")
  }

  const handleContinueShopping = () => {
    navigate("/court-booking")
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
    } catch (e) {
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
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Cart</h2>
        <p>
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added any courts to your cart yet.</p>
          <button className="continue-shopping-btn" onClick={handleContinueShopping}>
            Browse Courts
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="item-image-container">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1599058917212-d750089bc2be?w=500&q=80"}
                    alt={item.name}
                    className="item-image"
                  />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-date">{formatDate(item.date)}</p>
                  <p className="item-time">
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </p>
                  <p className="item-duration">Duration: {item.duration} minutes</p>
                </div>
                <div className="item-price">${item.price.toFixed(2)}</div>
                <button className="remove-item-btn" onClick={() => handleRemoveItem(item.id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Booking Fee</span>
              <span>$0.00</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="cart-actions">
            <button className="continue-shopping-btn" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
            <button className="checkout-btn" onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart

