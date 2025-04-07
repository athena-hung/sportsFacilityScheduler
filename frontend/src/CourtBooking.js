import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import courtImage from '/Users/anishbommireddy/java/sportsFacilityScheduler/frontend/src/pics/Court_listing.png';
import './CourtBooking.css';

const CourtBooking = () => {
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [availableCourts, setAvailableCourts] = useState([]);

  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get("http://localhost:3001/court/available", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sport,
          start_date: startDate,
          end_date: endDate,
          time: duration,
          time_start: startTime,
          time_end: endTime,
        },
      });

      setAvailableCourts(response.data.data);
    } catch (error) {
      console.error("Error fetching available courts:", error);
    }
  };

  const handleBookCourt = (court) => {
    navigate('/booking-details', {
      state: {
        court,
        startDate,
        endDate,
        startTime,
        endTime,
        duration,
      },
    });
  };

  return (
    <div className="court-booking-container">
      <h2>Find a Court</h2>

      <div className="input-group">
        <label>Sport</label>
        <input
          type="text"
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          placeholder="e.g., tennis, basketball"
        />
      </div>

      <div className="input-group">
        <label>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Search by location (optional)"
        />
      </div>

      <div className="search-filters">
        <div className="input-group">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="input-group">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Start Time</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div className="input-group">
          <label>End Time</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Duration (mins)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter duration"
          />
        </div>
      </div>

      <button className="search-courts-btn" onClick={handleSearch}>
        Search Courts
      </button>

      <h3>Available Courts</h3>
      <div className="court-listing">
        {availableCourts.length > 0 ? (
          availableCourts.map((court, index) => (
            <div key={index} className="court-item">
              <img src={courtImage} alt="Court" className="court-image" />
              <div className="court-info">
                <p><strong>{court.court_name || court.name}</strong></p>
                <p>{court.org_name}</p>
                <button className="book-court-btn" onClick={() => handleBookCourt(court)}>
                  Book Court
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No courts available for the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default CourtBooking;
