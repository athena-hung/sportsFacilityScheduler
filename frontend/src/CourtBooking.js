import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import courtImage from '../src/pics/Court_listing.png';
import './CourtBooking.css';
import { useToast } from "./context/ToastContext"; // Import useToast


const CourtBooking = () => {
 const [sport, setSport] = useState("");
 const [location, setLocation] = useState("");
 const [startDate, setStartDate] = useState("");
 const [endDate, setEndDate] = useState("");
 const [startTime, setStartTime] = useState("");
 const [endTime, setEndTime] = useState("");
 const [duration, setDuration] = useState("");
 const [availableCourts, setAvailableCourts] = useState([]);
 const [cartCount, setCartCount] = useState(0); // Add cart count state


 const navigate = useNavigate();
 const { showToast } = useToast(); // Use the toast hook


 // Load saved form data and cart count on component mount
 useEffect(() => {
   // Load booking form data from localStorage
   const savedLocation = localStorage.getItem("bookingLocation") || "";
   const savedStartDate = localStorage.getItem("bookingStartDate") || "";
   const savedEndDate = localStorage.getItem("bookingEndDate") || "";
   const savedStartTime = localStorage.getItem("bookingStartTime") || "";
   const savedEndTime = localStorage.getItem("bookingEndTime") || "";
   const savedDuration = localStorage.getItem("bookingDuration") || "";
   const savedSport = localStorage.getItem("bookingSport") || "";


   // Set the state with saved values
   setLocation(savedLocation);
   setStartDate(savedStartDate);
   setEndDate(savedEndDate);
   setStartTime(savedStartTime);
   setEndTime(savedEndTime);
   setDuration(savedDuration);
   setSport(savedSport);


   // Load cart count
   const storedCart = localStorage.getItem("cartItems");
   if (storedCart) {
     const parsedCart = JSON.parse(storedCart);
     setCartCount(parsedCart.length);
   }
 }, []);


 // Save form data to localStorage whenever it changes
 useEffect(() => {
   localStorage.setItem("bookingLocation", location);
   localStorage.setItem("bookingStartDate", startDate);
   localStorage.setItem("bookingEndDate", endDate);
   localStorage.setItem("bookingStartTime", startTime);
   localStorage.setItem("bookingEndTime", endTime);
   localStorage.setItem("bookingDuration", duration);
   localStorage.setItem("bookingSport", sport);
 }, [location, startDate, endDate, startTime, endTime, duration, sport]);


 const handleSearch = async () => {
   try {
     // Validate required fields
     if (!startDate || !endDate) {
       showToast("Please select start and end dates", "error");
       return;
     }
     if (!startTime || !endTime) {
       showToast("Please select start and end times", "error");
       return;
     }
     if (!duration) {
       showToast("Please specify a duration", "error");
       return;
     }


     const token = localStorage.getItem("token");
     if (!token) {
       showToast("You must be logged in to search for courts", "error");
       navigate("/#");
       return;
     }


     const response = await axios.get("http://localhost:3001/court/available", {
       headers: {
         Authorization: `Bearer ${token}`,
       },
       params: {
         sport,
         start_date: startDate,
         end_date: endDate,
         time: duration,
         time_start: startTime,
         time_end: endTime,
       },
     });


     setAvailableCourts(response.data.data);
    
     if (response.data.data.length === 0) {
       showToast("No courts available for the selected filters", "info");
     } else {
       showToast(`Found ${response.data.data.length} available courts`, "success");
     }
   } catch (error) {
     console.error("Error fetching available courts:", error);
     showToast("Error searching for courts: " + (error.response?.data?.message || error.message), "error");
   }
 };


 const handleBookCourt = (court) => {
   // Validate required fields
   if (!startDate) {
     showToast("Please select a date before booking", "error");
     return;
   }
   if (!startTime) {
     showToast("Please select a start time before booking", "error");
     return;
   }
   if (!endTime) {
     showToast("Please specify an end time before booking", "error");
     return;
   }
   if (!duration) {
     showToast("Please specify a duration before booking", "error");
     return;
   }


   navigate('/booking-details', {
     state: {
       court,
       startDate,
       endDate,
       startTime,
       endTime,
       duration,
     },
   });
 };


 const handleAddToCart = (court) => {
   // Validate required fields
   if (!startDate) {
     showToast("Please select a date before adding to the cart", "error");
     return;
   }
   if (!startTime) {
     showToast("Please select a start time before adding to the cart", "error");
     return;
   }
   if (!endTime) {
     showToast("Please specify an end time before adding to the cart", "error");
     return;
   }
   if (!duration) {
     showToast("Please specify a duration before adding to the cart", "error");
     return;
   }


   // Create a cart item with all necessary details
   const cartItem = {
     id: Date.now(), // Generate a unique ID
     courtId: court.id,
     name: court.court_name || court.name,
     image: court.image || courtImage,
     date: startDate,
     startTime: startTime,
     endTime: endTime,
     duration: duration,
     price: court.price || 25.0, // Default price if not available
   };


   // Get existing cart items from localStorage
   const existingCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];


   // Check if this court is already in the cart for the same time slot
   const isDuplicate = existingCartItems.some(
     item =>
       item.courtId === court.id &&
       item.date === startDate &&
       item.startTime === startTime &&
       item.endTime === endTime
   );


   if (isDuplicate) {
     showToast("This court is already in your cart for this time slot", "warning");
     return;
   }


   // Add new item to cart
   const updatedCart = [...existingCartItems, cartItem];


   // Save updated cart to localStorage
   localStorage.setItem("cartItems", JSON.stringify(updatedCart));


   // Update cart count
   setCartCount(updatedCart.length);


   // Show confirmation to user
   showToast(`${court.court_name || court.name} has been added to your cart!`, "success");
 };


 const navigateToCart = () => {
   navigate("/cart");
 };


 return (
   <div className="court-booking-container">
     {/* Add header with cart icon */}
     <div className="booking-header">
       <h2>Find a Court</h2>
       <div
         className="cart-icon-container"
         onClick={navigateToCart}
         role="button"
         aria-label="View cart"
         tabIndex={0}
       >
         <div className="cart-icon">🛒</div>
         {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
       </div>
     </div>


     <div className="input-group">
       <label>Sport</label>
       <input
         type="text"
         value={sport}
         onChange={(e) => setSport(e.target.value)}
         placeholder="e.g., tennis, basketball"
       />
     </div>


     <div className="input-group">
       <label>Location</label>
       <input
         type="text"
         value={location}
         onChange={(e) => setLocation(e.target.value)}
         placeholder="Search by location (optional)"
       />
     </div>


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
         <input
           type="date"
           value={endDate}
           onChange={(e) => setEndDate(e.target.value)}
           placeholder="mm/dd/yyyy"
         />
       </div>
       <div className="input-group">
         <label>Start Time</label>
         <input
           type="time"
           value={startTime}
           onChange={(e) => setStartTime(e.target.value)}
           placeholder="--:-- --"
         />
       </div>
       <div className="input-group">
         <label>End Time</label>
         <input
           type="time"
           value={endTime}
           onChange={(e) => setEndTime(e.target.value)}
           placeholder="--:-- --"
         />
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


     <button className="search-courts-btn" onClick={handleSearch}>
       Search Courts
     </button>


     <h3>Available Courts</h3>
     <div className="court-listing">
       {availableCourts.length > 0 ? (
         availableCourts.map((court, index) => (
           <div key={index} className="court-item">
             <img
               src={court.image || courtImage}
               alt={court.court_name || "Court"}
               className="court-image"
             />
             <div className="court-info">
               <p className="court-name">
                 {court.court_name || court.name}
                 {court.rating && (
                   <span> <span className="star-icon">★</span> {court.rating}</span>
                 )}
               </p>
               <p className="court-location">{court.org_name || court.location}</p>
               <p className="court-price">${court.price || "25.00"} per hour</p>
              
               {/* Add court buttons container with both buttons */}
               <div className="court-buttons">
                 <button
                   className="add-to-cart-btn"
                   onClick={() => handleAddToCart(court)}
                 >
                   Add to Cart
                 </button>
                 <button
                   className="book-court-btn"
                   onClick={() => handleBookCourt(court)}
                 >
                   Book Court
                 </button>
               </div>
             </div>
           </div>
         ))
       ) : (
         <p>No courts available for the selected filters.</p>
       )}
     </div>
   </div>
 );
};


export default CourtBooking;
