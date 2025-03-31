import React from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/CancelBooking.css"; // Reuse existing styles

export default function BookingCancelled() {
  const navigate = useNavigate();

  return (
    <div className="cancel-container">
      <div className="cancel-card">
        <div className="cancel-header">
          <span className="cancel-success-icon">✅</span>
          <h2>Booking Cancelled</h2>
        </div>

        <div style={{ marginBottom: 16 }}>
          <h3 className="cancel-title">Nickajack Park Court 3</h3>
          <p className="cancel-subtitle">January 20, 2024 • 2:00 PM</p>
          <p className="cancel-booking-id">Booking ID: FR163114</p>
        </div>

        <hr style={{ margin: "16px 0", borderColor: "#eee" }} />

        <p className="cancel-confirm-text">Your booking has been successfully cancelled.</p>

        <div className="cancel-whats-next">
          <p><strong>What happens next:</strong></p>
          <ul className="cancel-bullet-list">
            <li>A confirmation email will be sent to your registered email address</li>
            <li>Your refund will be processed within 5–7 business days</li>
            <li>The court will be made available for other bookings</li>
          </ul>
        </div>

        <div className="cancel-button-row">
          <button onClick={() => navigate("/")} className="cancel-cancel-button">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
