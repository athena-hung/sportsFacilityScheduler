import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BookingDetails.css";
import { useToast } from "./context/ToastContext"; // Import useToast


const BookingDetails = () => {
 const location = useLocation();
 const navigate = useNavigate();
 const [addedToCart, setAddedToCart] = useState(false);
 const { showToast } = useToast(); // Use the toast hook


 const state = location.state || {};
 const {
   court = {},
   startDate = "",
   endDate = "",
   startTime = "",
   endTime = "",
   duration = ""
 } = state;


 // Save court data to localStorage if available
 useEffect(() => {
   if (court && court.id) {
     localStorage.setItem("selectedCourt", JSON.stringify(court));
   }
 }, [court]);


 if (!court || !court.id) {
   return (
     <div className="booking-details-container">
       <h2 className="error-title">Error: Missing Court Information</h2>
       <p className="error-message">Please select a court from the court listing first.</p>
       <button className="back-button" onClick={() => navigate('/court-booking')}>
         Return to Court Listing
       </button>
     </div>
   );
 }


 const handleAddToCart = () => {
   // Create a cart item with all necessary details
   const cartItem = {
     id: Date.now(), // Generate a unique ID
     courtId: court.id,
     name: court.court_name || court.name,
     image: court.image || "https://images.unsplash.com/photo-1599058917212-d750089bc2be?w=500&q=80",
     date: startDate || "2025-05-05", // Default date if not selected
     startTime: startTime || "10:00", // Default time if not selected
     endTime: endTime || "11:00", // Default time if not selected
     duration: duration || 60, // Default duration if not selected
     price: court.price || 25.0, // Default price if not available
   };


   // Get existing cart items from localStorage
   const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];


   // Add new item to cart
   const updatedCart = [...existingCartItems, cartItem];


   // Save updated cart to localStorage
   localStorage.setItem("cartItems", JSON.stringify(updatedCart));


   // Update state to show success message
   setAddedToCart(true);


   // Show toast notification
   showToast("Added to cart successfully!", "success");


   // Automatically navigate to cart after a short delay
   setTimeout(() => {
     navigate("/cart");
   }, 1500);
 };


 const handleConfirmBooking = async () => {
   try {
     const token = localStorage.getItem("token");
     if (!token) {
       showToast("You must be logged in to make a reservation.", "error");
       return;
     }


     const startDateTime = `${startDate}T${startTime}`;
     const endDateTime = `${endDate}T${endTime}`;


     const response = await fetch("http://localhost:3001/reservation", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({
         start: startDateTime,
         end: endDateTime,
         courtId: court.id,
         reason: "User initiated from booking flow",
         status: "Pending"
       }),
     });


     const data = await response.json();


     if (!response.ok) {
       throw new Error(data.message || "Failed to create reservation");
     }


     showToast("Reservation created successfully!", "success");


     // Navigate to payment with reservation info
     navigate("/payment", {
       state: {
         reservationId: data.reservation.id,
         court,
         startDate,
         endDate,
         startTime,
         endTime,
         duration,
         price: data.reservation.price
       },
     });
   } catch (err) {
     console.error("Error creating reservation:", err);
     showToast(`Error: ${err.message}`, "error");
   }
 };


 // Format date for display
 const formatDate = (dateString) => {
   if (!dateString) return "Not specified";
   try {
     // Split the date string to handle it manually to avoid timezone issues
     const [year, month, day] = dateString.split("-").map((num) => Number.parseInt(num, 10));


     // Create a date object with the correct values
     // Note: months are 0-indexed in JavaScript Date
     const date = new Date(year, month - 1, day);


     // Format the date using toLocaleDateString
     return date.toLocaleDateString("en-US", {
       month: "2-digit",
       day: "2-digit",
       year: "numeric",
     });
   } catch (e) {
     console.error("Error formatting date:", e, dateString);
     return dateString || "Not specified";
   }
 };


 // Format time for display
 const formatTime = (timeString) => {
   if (!timeString) return "Not specified";
   try {
     // For time strings like "14:30"
     const [hours, minutes] = timeString.split(":");
     const time = new Date();
     time.setHours(Number.parseInt(hours, 10));
     time.setMinutes(Number.parseInt(minutes, 10));
     return time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
   } catch (e) {
     return timeString || "Not specified";
   }
 };


 return (
   <div className="booking-details-container">
     <h2 className="booking-title">Booking Details</h2>
     <div className="court-details">
       <img
         src={court.image || "https://images.unsplash.com/photo-1599058917212-d750089bc2be?w=500&q=80"}
         alt={court.court_name || "Court"}
         className="court-image"
       />
       <div className="court-info">
         <h3 className="court-name">{court.court_name || court.name}</h3>
         <p className="court-location"><strong>Facility:</strong> {court.org_name}</p>
         <p className="court-rating"><strong>Status:</strong> {court.status}</p>
       </div>
     </div>


     <div className="booking-info">
       <h3 className="section-title">Reservation Details</h3>
       <p><strong>Start Date:</strong> {formatDate(startDate)}</p>
       <p><strong>End Date:</strong> {formatDate(endDate)}</p>
       <p><strong>Start Time:</strong> {formatTime(startTime)}</p>
       <p><strong>End Time:</strong> {formatTime(endTime)}</p>
       <p><strong>Duration:</strong> {duration || "Not specified"} minutes</p>
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
         <button className="add-to-cart-btncb" onClick={handleAddToCart} disabled={addedToCart}>
           {addedToCart ? "Added to Cart" : "Add to Cart"}
         </button>
         <button className="confirm-booking-btn" onClick={handleConfirmBooking}>
           Confirm Booking
         </button>
       </div>
     </div>
   </div>
 );
};


export default BookingDetails;