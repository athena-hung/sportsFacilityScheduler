import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_DOMAIN } from "./config";
import "./CSS/ConfirmedBookings.css";
import { useNavigate } from "react-router-dom";
import courtImage from './pics/Court_listing.png';

export default function ConfirmedBookings() {
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState({});
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchConfirmedBookings(storedToken);
      fetchCurrentUser(storedToken);
    }
  }, []);

  const fetchConfirmedBookings = async (authToken) => {
    try {
      const response = await axios.get(`${API_DOMAIN}/reservation`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          status: "",
        },
      });

      setBookings(response.data);

      // Fetch court names for each unique court_id
      const uniqueCourtIds = [...new Set(response.data.map(b => b.court_id))];
      const courtData = {};
      for (const courtId of uniqueCourtIds) {
        const courtRes = await axios.get(`${API_DOMAIN}/court/${courtId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        courtData[courtId] = courtRes.data.name;
      }
      setCourts(courtData);
    } catch (err) {
      console.error("Error fetching confirmed bookings:", err);
    }
  };

  const fetchCurrentUser = async (authToken) => {
    try {
      const response = await axios.get(`${API_DOMAIN}/user/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setCurrentUser(response.data.user);
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  };

  const handleCancel = (booking) => {
    navigate("/cancel-booking", {
      state: {
        bookingId: booking.id,
        courtName: courts[booking.court_id] || `Court ${booking.court_id}`,
        startTime: booking.start,
      },
    });
  };

  const handlePayment = (booking) => {
    navigate("/payment", {
      state: {
        selected: [booking]  // Pass as array to match PaymentForm's expected format
      }
    });
  };

  return (
    <div className="booking-details-container">
      <h2>Booking Details</h2>

      {currentUser && (
        <div className="user-info">
          Logged in as: <strong>{currentUser.firstName} {currentUser.lastName}</strong> ({currentUser.email})
        </div>
      )}

      {bookings.length === 0 ? (
        <p>No confirmed bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div className="booking-card" key={booking.id}>
            <div className="booking-card-header">
              <img
                src={courtImage}
                alt="Court"
                className="booking-court-image"
              />
              <div>
                <h3 className="court-name">
                  {courts[booking.court_id] || `Court ${booking.court_id}`}
                </h3>
                <p className="booking-id">Booking ID: {booking.id}</p>
                <p>Date: {new Date(booking.start).toLocaleDateString()}</p>
                <p>
                  Time:{" "}
                  {new Date(booking.start).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>
                  Duration:{" "}
                  {(
                    (new Date(booking.end) - new Date(booking.start)) /
                    (1000 * 60 * 60)
                  ).toFixed(1)}{" "}
                  hours
                </p>
                <p>
                  Status:{" "}
                  <span style={{ 
                    color: booking.status.toLowerCase() === "confirmed" ? "green" : 
                           booking.status.toLowerCase() === "cancelled" ? "red" : 
                           booking.status.toLowerCase() === "pending" ? "orange" : 
                           "black"
                  }}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            <div className="booking-footer">
              <p>
                Total Amount: <strong>${booking.price || 0}</strong>
              </p>
              {booking.status.toLowerCase() !== "cancelled" && (
                <button
                  onClick={() => handleCancel(booking)}
                  className="cancel-booking-btn"
                >
                  Cancel Booking
                </button>
              )}
              {booking.status.toLowerCase() === "pending" && (
                <button 
                  onClick={() => handlePayment(booking)}
                  className="pay-now-btn" 
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "10px"
                  }}
                >
                  Pay Now
                </button>
              )}
              {booking.status.toLowerCase() === "confirmed" && (
                <button 
                  className="download-receipt-btn"
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginLeft: "10px"
                  }}
                >
                  Download Receipt
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
