import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BookingDetails.css";

const BookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Safely access the state and provide default values
  const state = location.state || {};
  const { court = {}, startDate = "", endDate = "", startTime = "", endTime = "", duration = "" } = state;

  // Handle missing court data
  if (!court.name) {
    return (
      <div className="booking-details-container">
        <h2>Error: Missing Court Information</h2>
        <p>Please select a court from the court listing first.</p>
        <button className="back-button" onClick={() => navigate('/court-booking')}>
          Return to Court Listing
        </button>
      </div>
    );
  }

  return (
    <div className="booking-details-container">
      <h2 className="booking-title">Booking Details</h2>
      <div className="court-details">
        {court.image && (
          <img
            src={court.image}
            alt={court.name}
            className="court-image"
          />
        )}
        <div className="court-info">
          <h3 className="court-name">{court.name}</h3>
          <p className="court-location"><strong>Location:</strong> {court.location}</p>
          <p className="court-rating"><strong>Rating:</strong> {court.rating} ★</p>
        </div>
      </div>
      <div className="booking-info">
        <h3 className="section-title">Reservation Details</h3>
        <p><strong>Start Date:</strong> {startDate}</p>
        <p><strong>End Date:</strong> {endDate}</p>
        <p><strong>Start Time:</strong> {startTime}</p>
        <p><strong>End Time:</strong> {endTime}</p>
        <p><strong>Duration:</strong> {duration} minutes</p>
      </div>
      <div className="action-buttons">
        <button
          className="back-button"
          onClick={() => navigate('/court-booking')}
        >
          Back to Court Listing
        </button>
        <button className="confirm-booking-btn">Confirm Booking</button>
      </div>
    </div>
  );
};

export default BookingDetails;