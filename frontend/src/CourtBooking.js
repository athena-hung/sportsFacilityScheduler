import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import * as chrono from 'chrono-node';
import { API_DOMAIN } from "./config";
import courtImage from './pics/Court_listing.png';
import './CourtBooking.css';

const DEFAULT_COURT_TYPES = ["Tennis", "Pickleball"];

// Helper function to get current date in EST
const getEstDate = () => {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
};

// Helper function to format date as YYYY-MM-DD in EST
const formatDate = (date) => {
  const estDate = new Date(date).toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  const d = new Date(estDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format time as HH:mm
const formatTime = (hours, minutes) => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Helper function to infer AM/PM for an hour
const inferAmPm = (hour, context = {}) => {
  // If we have a pair of times and the second is less than the first
  // then the second time is PM (e.g. "8 to 4" means "8 AM to 4 PM")
  if (context.isEndTime && context.startHour && hour < context.startHour) {
    return hour + 12;
  }

  if (hour === 12) return 12; // 12 is always as specified
  if (hour >= 9 && hour <= 11) return hour; // 9-11 assumed AM
  if (hour >= 1 && hour <= 8) return hour + 12; // 1-8 assumed PM
  return hour; // Return as-is for edge cases
};

// Helper function to get next Monday
const getNextMonday = (fromDate) => {
  const monday = new Date(fromDate);
  const dayOfWeek = monday.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // If Sunday, add 1 day, otherwise get to next Monday
  monday.setDate(monday.getDate() + daysUntilMonday);
  return monday;
};

// Helper function to parse natural language input
const parseNaturalLanguage = (input) => {
  const results = chrono.parse(input, new Date(), { forwardDate: true });
  if (!results.length) return null;

  const parsed = {
    sport: null,
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    duration: "60" // Default duration is 60 minutes
  };

  // Extract sport type
  const lowerInput = input.toLowerCase();
  if (lowerInput.includes('tennis')) parsed.sport = 'Tennis';
  else if (lowerInput.includes('pickleball')) parsed.sport = 'Pickleball';

  // Extract date and time information
  const result = results[0];
  
  // Handle start date/time
  if (result.start) {
    let startDate = result.start.date();
    
    // Handle "next week" specifically
    if (lowerInput.includes('next week')) {
      startDate = getNextMonday(new Date());
      
      // Set start date to next Monday
      parsed.startDate = formatDate(startDate);
      
      // Set end date to that Friday
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 4); // Add 4 days to get to Friday
      parsed.endDate = formatDate(endDate);
    } else {
      parsed.startDate = formatDate(startDate);
    }

    // Handle time ranges with "between X and Y" or "from X to Y" or just "X to Y"
    const betweenMatch = lowerInput.match(/between\s+(\d+)(?::\d+)?\s*(?:and|-)\s*(\d+)(?::\d+)?/i);
    const fromMatch = lowerInput.match(/from\s+(\d+)(?::\d+)?\s*(?:to|-)\s*(\d+)(?::\d+)?/i);
    const simpleRangeMatch = !betweenMatch && !fromMatch ? lowerInput.match(/(\d+)(?::\d+)?\s*(?:to|-)\s*(\d+)(?::\d+)?/i) : null;

    if (betweenMatch || fromMatch || simpleRangeMatch) {
      const match = betweenMatch || fromMatch || simpleRangeMatch;
      let startHour = parseInt(match[1]);
      let endHour = parseInt(match[2]);
      
      // Apply AM/PM inference if not explicitly specified
      if (!lowerInput.includes('am') && !lowerInput.includes('pm')) {
        startHour = inferAmPm(startHour, { isEndTime: false });
        endHour = inferAmPm(endHour, { isEndTime: true, startHour: startHour });
      }
      
      parsed.startTime = formatTime(startHour, 0);
      parsed.endTime = formatTime(endHour, 0);
      
      // Calculate duration in minutes
      const durationMinutes = ((endHour + 24) - startHour) % 24 * 60;
      
      // Only set duration for "from" pattern if it's 3 hours or less
      // Or if there's an explicit duration specified
      if ((fromMatch || simpleRangeMatch) && durationMinutes <= 180) {
        parsed.duration = durationMinutes.toString();
      }
    } else if (result.start.isCertain('hour')) {
      // Only use chrono's time parsing if we didn't find a time range pattern
      let hours = startDate.getHours();
      if (!lowerInput.includes('am') && !lowerInput.includes('pm') && 
          !result.start.isCertain('meridiem')) {
        hours = inferAmPm(hours);
      }
      parsed.startTime = formatTime(hours, startDate.getMinutes());
      
      // Set default end time to 1 hour later
      const totalMinutes = hours * 60 + startDate.getMinutes() + 60;
      parsed.endTime = formatTime(Math.floor(totalMinutes / 60), totalMinutes % 60);
    }
  }

  // Handle explicit end date/time if not already handled by "next week" or time range
  if (result.end && !lowerInput.includes('next week') && !parsed.endTime) {
    const endDate = result.end.date();
    
    // For date ranges like "monday to friday", ensure end date is after start date
    if (parsed.startDate) {
      const startDateObj = new Date(parsed.startDate);
      if (endDate < startDateObj) {
        const daysToAdd = 7 - startDateObj.getDay() + endDate.getDay();
        endDate.setDate(startDateObj.getDate() + daysToAdd);
      }
    }
    
    if (!parsed.endDate) {
      parsed.endDate = formatDate(endDate);
    }
    
    if (result.end.isCertain('hour') && !parsed.endTime) {
      let hours = endDate.getHours();
      if (!lowerInput.includes('am') && !lowerInput.includes('pm') && 
          !result.end.isCertain('meridiem')) {
        hours = inferAmPm(hours);
      }
      parsed.endTime = formatTime(hours, endDate.getMinutes());
    }
  }

  // Set end date to start date if not specified and not a week range
  if (parsed.startDate && !parsed.endDate && !lowerInput.includes('next week')) {
    parsed.endDate = parsed.startDate;
  }

  // Try to extract explicit duration from common phrases
  const durationMatch = lowerInput.match(/for\s+(\d+)\s*(hour|hr|hours|mins|minutes|min)/i);
  if (durationMatch) {
    const amount = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    
    // Convert to minutes
    const minutes = unit.startsWith('hour') || unit.startsWith('hr') 
      ? amount * 60 
      : amount;
    
    if (parsed.startTime) {
      // Calculate end time based on duration
      const startParts = parsed.startTime.split(':').map(Number);
      const totalMinutes = startParts[0] * 60 + startParts[1] + minutes;
      parsed.endTime = formatTime(Math.floor(totalMinutes / 60), totalMinutes % 60);
    }
    parsed.duration = minutes.toString();
  }

  // Debug log to help with troubleshooting
  console.log('Parsed natural language input:', {
    original: input,
    parsed,
    chronoResult: result
  });

  return parsed;
};

// Get default dates in EST
const today = new Date(getEstDate());
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);

// Default times (in EST)
const DEFAULT_START_TIME = formatTime(9, 0);  // 9:00 AM EST
const DEFAULT_END_TIME = formatTime(17, 0);   // 5:00 PM EST

const CourtBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get preserved search state if it exists
  const preservedState = location.state || {};
  const shouldRestoreSearch = preservedState.preserveSearch;

  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [parsedNaturalLanguage, setParsedNaturalLanguage] = useState(null);
  const [shouldTriggerSearch, setShouldTriggerSearch] = useState(false);
  const [sport, setSport] = useState(shouldRestoreSearch ? preservedState.sport : "");
  const [courtTypes, setCourtTypes] = useState(DEFAULT_COURT_TYPES);
  const [startDate, setStartDate] = useState(shouldRestoreSearch ? preservedState.startDate : formatDate(today));
  const [endDate, setEndDate] = useState(shouldRestoreSearch ? preservedState.endDate : formatDate(nextWeek));
  const [startTime, setStartTime] = useState(shouldRestoreSearch ? preservedState.startTime : DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState(shouldRestoreSearch ? preservedState.endTime : DEFAULT_END_TIME);
  const [duration, setDuration] = useState(shouldRestoreSearch ? preservedState.duration : "60");
  const [availableCourts, setAvailableCourts] = useState([]);
  const [errors, setErrors] = useState({});

  // Automatically trigger search if we're restoring state
  useEffect(() => {
    if (shouldRestoreSearch) {
      handleSearch();
    }
  }, []);  // Empty dependency array since we only want this to run once on mount

  useEffect(() => {
    const fetchCourtTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_DOMAIN}/court-type`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.length > 0) {
          setCourtTypes(response.data);
        }
      } catch (error) {
        console.error("Error fetching court types:", error);
      }
    };

    fetchCourtTypes();
  }, []);

  // Effect to handle natural language parsing results
  useEffect(() => {
    if (parsedNaturalLanguage) {
      const parsed = parsedNaturalLanguage;
      
      // Update form fields with parsed values
      if (parsed.sport) setSport(parsed.sport);
      if (parsed.startDate) setStartDate(parsed.startDate);
      if (parsed.endDate) setEndDate(parsed.endDate);
      if (parsed.startTime) setStartTime(parsed.startTime);
      if (parsed.endTime) setEndTime(parsed.endTime);
      if (parsed.duration) setDuration(parsed.duration);

      // If we have start and end time but no duration, calculate it
      if (parsed.startTime && parsed.endTime && !parsed.duration) {
        const [startHour, startMin] = parsed.startTime.split(':').map(Number);
        const [endHour, endMin] = parsed.endTime.split(':').map(Number);
        const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        if (durationMinutes > 0) {
          setDuration(durationMinutes.toString());
        }
      }

      // Clear the parsed results to prevent re-running
      setParsedNaturalLanguage(null);
      // Set flag to trigger search after updates
      setShouldTriggerSearch(true);
    }
  }, [parsedNaturalLanguage]);

  // Effect to handle search after all fields are updated
  useEffect(() => {
    if (shouldTriggerSearch) {
      // Add delay to ensure all state updates are complete
      setTimeout(() => {
        handleSearch();
        setShouldTriggerSearch(false);
      }, 2000);
    }
  }, [shouldTriggerSearch, sport, startDate, endDate, startTime, endTime, duration]);

  const validateForm = () => {
    const newErrors = {};
    if (!sport) {
      newErrors.sport = 'Sport is required';
    }
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_DOMAIN}/court/available`, {
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
        sport
      },
    });
  };

  // Handle natural language input
  const handleNaturalLanguageSearch = () => {
    const parsed = parseNaturalLanguage(naturalLanguageInput);
    if (!parsed) {
      setErrors({ ...errors, naturalLanguage: 'Could not understand the input. Please try again.' });
      return;
    }

    // Clear any previous errors
    setErrors({});

    // Set the parsed results which will trigger the useEffect
    setParsedNaturalLanguage(parsed);
  };

  return (
    <div className="court-booking-container">
      <h2>Find a Court</h2>

      <div className="natural-language-search">
        <label>AI Search 🤖</label>
        <div className="search-input-container">
          <input
            type="text"
            value={naturalLanguageInput}
            onChange={(e) => setNaturalLanguageInput(e.target.value)}
            placeholder="Try: Find a tennis court next Wednesday between 3-5pm"
            className="natural-language-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleNaturalLanguageSearch();
              }
            }}
          />
          <button onClick={handleNaturalLanguageSearch} className="search-button natural-language-btn">
            ➤
          </button>
        </div>
        {errors.naturalLanguage && (
          <span className="error-message">{errors.naturalLanguage}</span>
        )}
      </div>

      <div className="input-group">
        <label>
          Sport
          <span className="required">*</span>
        </label>
        <select
          value={sport}
          onChange={(e) => {
            setSport(e.target.value);
            setErrors({...errors, sport: ''});
          }}
          className={`sport-select ${errors.sport ? 'error' : ''}`}
        >
          <option value="">Select a sport</option>
          {courtTypes.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.sport && <span className="error-message">{errors.sport}</span>}
      </div>

      <div className="range-group-container">
        <div>
          <div className="date-range-group">
            <div className="input-group">
              <label>
                Start Date
                <span className="required">*</span>
              </label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setErrors({...errors, startDate: ''});
                }}
                className={errors.startDate ? 'error' : ''}
                min={formatDate(today)}
              />
              {errors.startDate && <span className="error-message">{errors.startDate}</span>}
            </div>
            <div className="input-group">
              <label>End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="time-range-group">
            <div className="input-group">
              <label>Start Time (ET)</label>
              <input 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
              />
            </div>
            <div className="input-group">
              <label>End Time (ET)</label>
              <input 
                type="time" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="duration-search-container">
        <div className="input-group duration-group">
          <label>Duration (mins)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter duration"
            min="30"
            step="30"
          />
        </div>

        <button className="search-button search-courts-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

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
