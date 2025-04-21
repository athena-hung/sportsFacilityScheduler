import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import * as chrono from 'chrono-node';
import { API_DOMAIN } from "./config";
import courtImage from './pics/Court_listing.png';
import './CourtBooking.css';

const DEFAULT_COURT_TYPES = ["Tennis", "Pickleball"];

const getEstDate = () => {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
};

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

const formatTime = (hours, minutes) => {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const inferAmPm = (hour, context = {}) => {
  if (context.isEndTime && context.startHour && hour < context.startHour) {
    return hour + 12;
  }

  if (hour === 12) return 12; 
  if (hour >= 9 && hour <= 11) return hour; 
  if (hour >= 1 && hour <= 8) return hour + 12; 
  return hour; 
};

const getNextMonday = (fromDate) => {
  const monday = new Date(fromDate);
  const dayOfWeek = monday.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; 
  monday.setDate(monday.getDate() + daysUntilMonday);
  return monday;
};

const parseNaturalLanguage = (input) => {
  const results = chrono.parse(input, new Date(), { forwardDate: true });
  if (!results.length) return null;

  const parsed = {
    sport: null,
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    duration: "60" 
  };

  const lowerInput = input.toLowerCase();
  if (lowerInput.includes('tennis')) parsed.sport = 'Tennis';
  else if (lowerInput.includes('pickleball')) parsed.sport = 'Pickleball';

  const result = results[0];
  
  if (result.start) {
    let startDate = result.start.date();
    
    if (lowerInput.includes('next week')) {
      startDate = getNextMonday(new Date());
      
      parsed.startDate = formatDate(startDate);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 4); 
      parsed.endDate = formatDate(endDate);
    } else {
      parsed.startDate = formatDate(startDate);
    }

    const betweenMatch = lowerInput.match(/between\s+(\d+)(?::\d+)?\s*(?:and|-)\s*(\d+)(?::\d+)?/i);
    const fromMatch = lowerInput.match(/from\s+(\d+)(?::\d+)?\s*(?:to|-)\s*(\d+)(?::\d+)?/i);
    const simpleRangeMatch = !betweenMatch && !fromMatch ? lowerInput.match(/(\d+)(?::\d+)?\s*(?:to|-)\s*(\d+)(?::\d+)?/i) : null;

    if (betweenMatch || fromMatch || simpleRangeMatch) {
      const match = betweenMatch || fromMatch || simpleRangeMatch;
      let startHour = parseInt(match[1]);
      let endHour = parseInt(match[2]);
      
      if (!lowerInput.includes('am') && !lowerInput.includes('pm')) {
        startHour = inferAmPm(startHour, { isEndTime: false });
        endHour = inferAmPm(endHour, { isEndTime: true, startHour: startHour });
      }
      
      parsed.startTime = formatTime(startHour, 0);
      parsed.endTime = formatTime(endHour, 0);
      
      const durationMinutes = ((endHour + 24) - startHour) % 24 * 60;
      

      if ((fromMatch || simpleRangeMatch) && durationMinutes <= 180) {
        parsed.duration = durationMinutes.toString();
      }
    } else if (result.start.isCertain('hour')) {
      let hours = startDate.getHours();
      if (!lowerInput.includes('am') && !lowerInput.includes('pm') && 
          !result.start.isCertain('meridiem')) {
        hours = inferAmPm(hours);
      }
      parsed.startTime = formatTime(hours, startDate.getMinutes());
      
      const totalMinutes = hours * 60 + startDate.getMinutes() + 60;
      parsed.endTime = formatTime(Math.floor(totalMinutes / 60), totalMinutes % 60);
    }
  }

  if (result.end && !lowerInput.includes('next week') && !parsed.endTime) {
    const endDate = result.end.date();
    
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

  if (parsed.startDate && !parsed.endDate && !lowerInput.includes('next week')) {
    parsed.endDate = parsed.startDate;
  }

  const durationMatch = lowerInput.match(/for\s+(\d+)\s*(hour|hr|hours|mins|minutes|min)/i);
  if (durationMatch) {
    const amount = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    
    const minutes = unit.startsWith('hour') || unit.startsWith('hr') 
      ? amount * 60 
      : amount;
    
    if (parsed.startTime) {
      const startParts = parsed.startTime.split(':').map(Number);
      const totalMinutes = startParts[0] * 60 + startParts[1] + minutes;
      parsed.endTime = formatTime(Math.floor(totalMinutes / 60), totalMinutes % 60);
    }
    parsed.duration = minutes.toString();
  }

  console.log('Parsed natural language input:', {
    original: input,
    parsed,
    chronoResult: result
  });

  return parsed;
};

const today = new Date(getEstDate());
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);

const DEFAULT_START_TIME = formatTime(9, 0);  
const DEFAULT_END_TIME = formatTime(17, 0);   

const CourtBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
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

  useEffect(() => {
    if (shouldRestoreSearch) {
      handleSearch();
    }
  }, []);  

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

  useEffect(() => {
    if (parsedNaturalLanguage) {
      const parsed = parsedNaturalLanguage;
      
      if (parsed.sport) setSport(parsed.sport);
      if (parsed.startDate) setStartDate(parsed.startDate);
      if (parsed.endDate) setEndDate(parsed.endDate);
      if (parsed.startTime) setStartTime(parsed.startTime);
      if (parsed.endTime) setEndTime(parsed.endTime);
      if (parsed.duration) setDuration(parsed.duration);

      if (parsed.startTime && parsed.endTime && !parsed.duration) {
        const [startHour, startMin] = parsed.startTime.split(':').map(Number);
        const [endHour, endMin] = parsed.endTime.split(':').map(Number);
        const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        if (durationMinutes > 0) {
          setDuration(durationMinutes.toString());
        }
      }

      setParsedNaturalLanguage(null);
      setShouldTriggerSearch(true);
    }
  }, [parsedNaturalLanguage]);

  useEffect(() => {
    if (shouldTriggerSearch) {
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

  const handleNaturalLanguageSearch = () => {
    const parsed = parseNaturalLanguage(naturalLanguageInput);
    if (!parsed) {
      setErrors({ ...errors, naturalLanguage: 'Could not understand the input. Please try again.' });
      return;
    }

    setErrors({});

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
