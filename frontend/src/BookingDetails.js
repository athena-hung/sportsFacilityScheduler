import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_DOMAIN } from "./config";
import "./BookingDetails.css";
import courtImage from './pics/Court_listing.png';

const BookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const state = location.state || {};
  const {
    court = {},
    startDate = "",
    endDate = "",
    startTime: initialStartTime = "",
    endTime: initialEndTime = "",
    duration = "60",
    sport = "",
    location: searchLocation = ""
  } = state;

  const isTimeWithinWindow = (time) => {
    if (!initialStartTime || !initialEndTime) return true;
    
    const [startHours, startMinutes] = initialStartTime.split(':').map(Number);
    const [endHours, endMinutes] = initialEndTime.split(':').map(Number);
    const [timeHours, timeMinutes] = time.split(':').map(Number);
    
    const startInMinutes = startHours * 60 + startMinutes;
    const endInMinutes = endHours * 60 + endMinutes;
    const timeInMinutes = timeHours * 60 + timeMinutes;
    
    if (endInMinutes < startInMinutes) {
      return timeInMinutes >= startInMinutes || timeInMinutes <= endInMinutes;
    }
    
    return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
  };

  const filteredAvailableSlots = availableSlots.filter(isTimeWithinWindow);

  const handleBackToListing = () => {
    navigate('/court-booking', {
      state: {
        sport,
        location: searchLocation,
        startDate,
        endDate,
        startTime: initialStartTime,
        endTime: initialEndTime,
        duration,
        preserveSearch: true 
      }
    });
  };

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const userResponse = await fetch(`${API_DOMAIN}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const userData = await userResponse.json();
        const userBookingsResponse = await fetch(`${API_DOMAIN}/reservation`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            status: "",
          },
        });

        if (!userBookingsResponse.ok) {
          throw new Error("Failed to fetch user bookings");
        }

        const userBookings = await userBookingsResponse.json();
        const activeBookings = userBookings.filter(booking => 
          booking.status !== 'Cancelled' && new Date(booking.start) >= new Date()
        );

        if (activeBookings.length >= userData.user.maxCourtsPerDay) {
          setError(`You have reached your maximum limit of ${userData.user.maxCourtsPerDay} future reservations`);
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_DOMAIN}/court/${court.id}/schedule?date=${startDate}&time=${duration}&time_start=${initialStartTime}&time_end=${initialEndTime}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch available slots");
        }

        const data = await response.json();
        setAvailableSlots(data.available_start_times || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching available slots:", err);
      } finally {
        setLoading(false);
      }
    };

    if (court.id && startDate) {
      fetchAvailableSlots();
    }
  }, [court.id, startDate, duration, initialStartTime, initialEndTime]);

  if (!court || !court.id) {
    return (
      <div className="booking-details-container">
        <h2>Error: Missing Court Information</h2>
        <p>Please select a court from the court listing first.</p>
        <button className="back-button" onClick={handleBackToListing}>
          Return to Court Listing
        </button>
      </div>
    );
  }

  const handleTimeSelect = async (startTime) => {
    if (error && error.includes("maximum limit")) {
      return; 
    }
    
    setSelectedTime(startTime);
    
    const [hours, minutes] = startTime.split(':');
    const startDateTime = new Date();
    startDateTime.setHours(parseInt(hours), parseInt(minutes));
    const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);
    const endTime = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`;

    const reservationInfo = {
      start: `${startDate}T${startTime}`,
      end: `${startDate}T${endTime}`,
      courtId: court.id,
      court_name: court.court_name,
      price: court.price || 0,
      org_name: court.org_name
    };

    navigate("/cart", { 
      state: { 
        pendingReservation: reservationInfo
      },
      replace: true
    });
  };

  return (
    <div className="booking-details-container">
      <h2 className="booking-title">Booking Details</h2>
      <div className="court-details">
        <img
          src={court.image || courtImage}
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
        <p><strong>Date:</strong> {startDate}</p>
        <p><strong>Duration:</strong> {duration} minutes</p>
        <p><strong>Preferred Time Window:</strong> {initialStartTime} - {initialEndTime}</p>
      </div>

      <div className="time-slots-section">
        <h3 className="section-title">Available Time Slots</h3>
        {loading ? (
          <p>Loading available time slots...</p>
        ) : error ? (
          <div className="error-message-container">
            <p className="error-message">{error}</p>
            {error.includes("maximum limit") && (
              <p className="error-help-text">
                Please cancel some of your existing reservations before making new ones.
                You can manage your reservations in the <a href="/confirmed-bookings">Confirmed Bookings</a> page.
              </p>
            )}
          </div>
        ) : filteredAvailableSlots.length === 0 ? (
          <p>No available time slots within your preferred time window ({initialStartTime} - {initialEndTime}).</p>
        ) : (
          <div className="time-slots-grid">
            {filteredAvailableSlots.map((time) => (
              <button
                key={time}
                className={`time-slot-btn ${selectedTime === time ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(time)}
                disabled={error && error.includes("maximum limit")}
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button className="back-button" onClick={handleBackToListing}>
          Back to Court Listing
        </button>
      </div>
    </div>
  );
};

export default BookingDetails;
