import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { API_DOMAIN } from "./config";
import "./Cart.css";

export default function Cart() {
  const [reservations, setReservations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [courtNames, setCourtNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingReservations, setPendingReservations] = useState([]);
  const processedReservationsRef = useRef(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const pendingReservation = location.state?.pendingReservation;
    if (pendingReservation) {
      const reservationKey = `${pendingReservation.courtId}-${pendingReservation.start}-${pendingReservation.end}`;
      
      // Only process if we haven't seen this reservation before
      if (!processedReservationsRef.current.has(reservationKey)) {
        processedReservationsRef.current.add(reservationKey);
        setPendingReservations(prev => [...prev, pendingReservation]);
      }

      // Clear the location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchReservations = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your cart");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get(`${API_DOMAIN}/reservation`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: "Pending" },
        });

        if (Array.isArray(res.data)) {
          setReservations(res.data);
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error loading cart:", err);
        setError(err.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const createReservation = async (reservationInfo) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Please log in to create a reservation");
    }

    const response = await axios.post(
      `${API_DOMAIN}/reservation`,
      {
        ...reservationInfo,
        reason: "User initiated from booking flow",
        status: "Pending"
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  };

  const proceedToPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create all pending reservations
      for (const reservationInfo of pendingReservations) {
        await createReservation(reservationInfo);
      }

      // Clear pending reservations after successful creation
      setPendingReservations([]);
      
      // Refresh the reservations list
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_DOMAIN}/reservation`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: "Pending" },
      });

      if (Array.isArray(res.data)) {
        setReservations(res.data);
        // Navigate to payment with all reservations
        navigate("/payment", { state: { selected: res.data } });
      }
    } catch (err) {
      console.error("Error creating reservations:", err);
      setError(err.message || "Failed to create reservations");
    } finally {
      setLoading(false);
    }
  };

  const removePendingReservation = (index) => {
    setPendingReservations(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${API_DOMAIN}/reservation/${id}`,
        { status: "Cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservations(prev => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const total = pendingReservations.reduce((sum, r) => sum + (r.price || 0), 0);

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {loading ? (
        <div className="loading">Loading your cart...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : pendingReservations.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/court-booking')}>Browse Courts</button>
        </div>
      ) : (
        <>
          <p>{pendingReservations.length} courts selected</p>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Date</th>
                <th>Time</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pendingReservations.map((r, index) => (
                <tr key={index}>
                  <td>{r.court_name || `Court ${r.courtId}`}</td>
                  <td>{r.start.split("T")[0]}</td>
                  <td>
                    {new Date(r.start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} –{" "}
                    {new Date(r.end).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>${r.price?.toFixed(2) || "0.00"}</td>
                  <td>
                    <button 
                      className="delete-btn" 
                      onClick={() => removePendingReservation(index)}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-footer">
            <span className="cart-total">${total.toFixed(2)}</span>
            <button
              className="confirm-booking-btn"
              onClick={proceedToPayment}
              disabled={pendingReservations.length === 0 || loading}
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
