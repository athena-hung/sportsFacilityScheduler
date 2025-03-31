// CancelBooking.jsx
import React, { useState } from "react";
import "./CSS/CancelBooking.css";
import { useNavigate } from "react-router-dom";

export default function CancelBooking() {
  const [reason, setReason] = useState("");


  const navigate = useNavigate();
  
  const handleCancel = () => {
    // After cancelling
    navigate("/booking-cancelled");
  };
  

  const handleKeep = () => {
    alert("Booking kept.");
  };

  return (
    <div className="cancel-container">
      <div className="cancel-card">
        <button className="cancel-back-button" onClick={handleKeep}>
          ← Cancel Booking
        </button>

        <div className="cancel-header-section">
          <img
            src="https://images.unsplash.com/photo-1599058917212-d750089bc2be?w=500&q=80"
            alt="Court"
            className="cancel-image"
          />
          <div>
            <h2 className="cancel-title">Nickajack Park Court 3</h2>
            <p className="cancel-subtitle">January 20, 2024 • 2:00 PM</p>
            <p className="cancel-booking-id">Booking ID: FR163114</p>
          </div>
        </div>

        <h3 className="cancel-question">Are you sure you want to cancel this booking?</h3>
        <ul className="cancel-notes">
          <li>Cancellation fee may apply</li>
          <li>This action cannot be undone</li>
          <li>Refund will be processed within 5–7 business days</li>
        </ul>

        <div>
          <label className="cancel-label">Reason for cancellation (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="cancel-textarea"
          ></textarea>
        </div>

        <div className="cancel-button-row">
          <button onClick={handleKeep} className="cancel-keep-button">
            No, Keep Booking
          </button>
          <button onClick={handleCancel} className="cancel-cancel-button">
            Yes, Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
}
