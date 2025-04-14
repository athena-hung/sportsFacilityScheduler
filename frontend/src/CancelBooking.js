import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { API_DOMAIN } from "./config";
import "./CSS/CancelBooking.css";
import courtImage from './pics/Court_listing.png';

export default function CancelBooking() {
  const [reservations, setReservations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [token, setToken] = useState("");
  const [courtNames, setCourtNames] = useState({});
  const [reason, setReason] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const preselected = location.state?.bookingId || null;

  useEffect(() => {
    const fetchReservations = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) return;
      setToken(storedToken);

      try {
        const res = await axios.get(`${API_DOMAIN}/reservation`, {
          headers: { Authorization: `Bearer ${storedToken}` },
          params: { status: "Confirmed" },
        });

        const bookings = res.data;
        setReservations(bookings);
        if (preselected) setSelectedId(preselected);

        const courtData = {};
        for (const booking of bookings) {
          const courtRes = await axios.get(`${API_DOMAIN}/court/${booking.court_id}`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          courtData[booking.court_id] = courtRes.data.name;
        }
        setCourtNames(courtData);
      } catch (err) {
        console.error("Error loading reservations:", err);
      }
    };

    fetchReservations();
  }, [preselected]);

  const selected = reservations.find((r) => r.id === Number(selectedId));

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return `${startDate.toLocaleDateString(undefined, options)} from ${startDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} to ${endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const handleCancel = async () => {
    try {
      await axios.put(
        `${API_DOMAIN}/reservation/${selectedId}`,
        { status: "Cancelled", notes: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Reservation cancelled successfully.");
      navigate("/confirmed-bookings");
    } catch (err) {
      console.error("Cancellation failed:", err);
      alert("Failed to cancel reservation.");
    }
  };

  return (
    <div className="cancel-container">
      <div className="cancel-card">
        <h2 className="cancel-title-page">Cancel a Reservation</h2>

        <label className="cancel-label">Select Reservation:</label>
        <select
          className="cancel-select"
          value={selectedId || ""}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">-- Select --</option>
          {reservations.map((r) => (
            <option key={r.id} value={r.id}>
              {courtNames[r.court_id] || `Court ${r.court_id}`} on {new Date(r.start).toLocaleDateString()} at{" "}
              {new Date(r.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </option>
          ))}
        </select>

        {selected && (
          <div className="cancel-card-inner">
            <div className="cancel-header-section">
              <img
                src={courtImage}
                alt="Court"
                className="cancel-image"
              />
              <div>
                <h3 className="cancel-title">{courtNames[selected.court_id]}</h3>
                <p className="cancel-subtitle">
                  <strong>Time:</strong> {formatDateRange(selected.start, selected.end)}
                </p>
                <p className="cancel-subtitle">
                  <strong>Reason:</strong> {selected.reason}
                </p>
                <p className="cancel-subtitle">
                  <strong>Status:</strong> {selected.status}
                </p>
              </div>
            </div>

            <hr />

            <div className="cancel-warning">
              <p><strong>Total Amount:</strong> ${selected.price || 0}</p>
              <ul className="cancel-bullet-list">
                <li>Cancellation fee may apply</li>
                <li>This action cannot be undone</li>
                <li>Refund will be processed within 5–7 business days</li>
              </ul>
            </div>

            <label className="cancel-label">Reason for cancellation (optional)</label>
            <textarea
              className="cancel-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for cancellation"
            />

            <div className="cancel-button-row">
              <button className="cancel-keep-button" onClick={() => navigate("/confirmed-bookings")}>
                No, Keep Booking
              </button>
              <button className="cancel-cancel-button" onClick={handleCancel}>
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
