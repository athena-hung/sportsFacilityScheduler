import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import courtImage from '/Users/zohair007/Desktop/Github/sportsFacilityScheduler/frontend/src/pics/Court_listing.png';
import './CourtBooking.css';  // Import the corresponding CSS file

const CourtBooking = () => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState(""); // New state for duration

  const navigate = useNavigate();  // Initialize the navigate function

  // Sample location data (this could be dynamically fetched)
  const locations = ["New York", "Los Angeles", "Chicago", "San Francisco", "Miami"];

  // Filter available courts based on location
  const filteredCourts = [
    { location: "New York", name: "Nickajack Park", rating: 4.0, image: courtImage },
  ].filter(court => court.location.toLowerCase().includes(location.toLowerCase()));

  const handleBookCourt = (court) => {
    // Navigate to the BookingDetails page with the selected court and date/time details
    navigate('/booking-details', {
      state: {
        court,
        startDate,
        endDate,
        startTime,
        endTime,
        duration, // Pass the duration to the next page
      },
    });
  };

  return (
    <div className="court-booking-container">
      <h2>Find a Court</h2>

      {/* Location Filter */}
      <div className="input-group">
        <label>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Search by location"
        />
      </div>

      {/* Search Filters */}
      <div className="search-filters">
        <div className="input-group">
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Duration (mins)</label> {/* New Duration Field */}
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter duration in minutes"
          />
        </div>
      </div>

      {/* Available Courts */}
      <h3>Available Courts</h3>
      <div className="court-listing">
        {filteredCourts.length > 0 ? (
          filteredCourts.map((court, index) => (
            <div key={index} className="court-item">
              <img src={court.image} alt={court.name} className="court-image" />
              <div className="court-info">
                <p>{court.name} ★ {court.rating}</p>
                <button className="book-court-btn" onClick={() => handleBookCourt(court)}>
                  Book Court
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No courts available for the selected location.</p>
        )}
      </div>
    </div>
  );
};

export default CourtBooking;