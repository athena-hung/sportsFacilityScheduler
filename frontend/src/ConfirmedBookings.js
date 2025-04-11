import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/ConfirmedBookings.css";
import { useNavigate } from "react-router-dom";
import courtImage from '/Users/anishbommireddy/java/sportsFacilityScheduler/frontend/src/pics/Court_listing.png';

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
      const response = await axios.get("http://localhost:3001/reservation", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          status: "Confirmed",
        },
      });

      setBookings(response.data);

      // Fetch court names for each unique court_id
      const uniqueCourtIds = [...new Set(response.data.map(b => b.court_id))];
      const courtData = {};
      for (const courtId of uniqueCourtIds) {
        const courtRes = await axios.get(`http://localhost:3001/court/${courtId}`, {
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
      const response = await axios.get("http://localhost:3001/user/profile", {
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
                  Status: <span style={{ color: "green" }}>Confirmed</span>
                </p>
              </div>
            </div>

            <div className="booking-footer">
              <p>
                Total Amount: <strong>${booking.price || 0}</strong>
              </p>
              <button
                onClick={() => handleCancel(booking)}
                className="cancel-booking-btn"
              >
                Cancel Booking
              </button>
              <button className="download-receipt-btn">
                Download Receipt
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
