import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CSS/CancelBooking.css";
import { useNavigate } from "react-router-dom";

export default function CancelBooking() {
  const [reservations, setReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState("");
  const [reason, setReason] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchReservations(storedToken);
    }
  }, []);

  const fetchReservations = async (authToken) => {
    try {
      const response = await axios.get("http://localhost:3001/reservation?status=Confirmed", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setReservations(response.data);
    } catch (err) {
      console.error("Error fetching reservations:", err);
    }
  };

  const handleCancel = async () => {
    if (!selectedReservation) return alert("Select a reservation first.");

    try {
      await axios.put(
        `http://localhost:3001/reservation/${selectedReservation}`,
        { status: "Cancelled", notes: reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Reservation cancelled.");
      navigate("/booking-cancelled", {
        state: {
          courtName: `Court ${selected.court_id}`,
          startTime: selected.start,
          bookingId: selected.id,
        },
      });
      
    } catch (err) {
      console.error("Error cancelling reservation:", err);
      alert("Failed to cancel reservation.");
    }
  };

  const handleKeep = () => {
    alert("Booking kept.");
  };

  const selected = reservations.find((r) => r.id === parseInt(selectedReservation));

  return (
    <div className="cancel-container">
      <div className="cancel-card">
        <button className="cancel-back-button" onClick={handleKeep}>
          ← Back
        </button>

        <h2 className="cancel-title">Cancel a Reservation</h2>
        <label className="cancel-label">Select Reservation:</label>
        <select
          className="form-select"
          value={selectedReservation}
          onChange={(e) => setSelectedReservation(e.target.value)}
        >
          <option value="">-- Select --</option>
          {reservations.map((res) => (
            <option key={res.id} value={res.id}>
              #{res.id} - Court {res.court_id} on {res.start}
            </option>
          ))}
        </select>

        {selected && (
          <>
            <div className="cancel-details">
              <p><strong>Time:</strong> {selected.start} to {selected.end}</p>
              <p><strong>Reason:</strong> {selected.reason || "N/A"}</p>
              <p><strong>Status:</strong> {selected.status}</p>
            </div>

            <h3 className="cancel-question">Are you sure you want to cancel this booking?</h3>
            <ul className="cancel-notes">
              <li>Cancellation fee may apply</li>
              <li>This action cannot be undone</li>
              <li>Refund will be processed within 5–7 business days</li>
            </ul>

            <label className="cancel-label">Reason for cancellation (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="cancel-textarea"
            ></textarea>

            <div className="cancel-button-row">
              <button onClick={handleKeep} className="cancel-keep-button">
                No, Keep Booking
              </button>
              <button onClick={handleCancel} className="cancel-cancel-button">
                Yes, Cancel Booking
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

