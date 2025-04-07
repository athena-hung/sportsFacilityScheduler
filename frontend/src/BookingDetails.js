import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BookingDetails.css";

const BookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const {
    court = {},
    startDate = "",
    endDate = "",
    startTime = "",
    endTime = "",
    duration = ""
  } = state;

  if (!court || !court.id) {
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

  const handleConfirmBooking = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to make a reservation.");
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
      alert(`Error: ${err.message}`);
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
          <h3 className="court-name">{court.court_name}</h3>
          <p className="court-location"><strong>Facility:</strong> {court.org_name}</p>
          <p className="court-rating"><strong>Status:</strong> {court.status}</p>
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
        <button className="back-button" onClick={() => navigate("/court-booking")}>
          Back to Court Listing
        </button>
        <button className="confirm-booking-btn" onClick={handleConfirmBooking}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default BookingDetails;
