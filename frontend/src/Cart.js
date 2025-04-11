import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
  const [reservations, setReservations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [courtNames, setCourtNames] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:3001/reservation", {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: "Pending" },
        });

        setReservations(res.data);

        // Fetch court names
        const uniqueCourtIds = [...new Set(res.data.map((r) => r.court_id))];
        const names = {};
        for (const id of uniqueCourtIds) {
          const courtRes = await axios.get(`http://localhost:3001/court/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          names[id] = courtRes.data.name || `Court ${id}`;
        }
        setCourtNames(names);
      } catch (err) {
        console.error("Error loading cart:", err);
      }
    };

    fetchReservations();
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:3001/reservation/${id}`,
        { status: "Cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservations((prev) => prev.filter((r) => r.id !== id));
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const proceedToPayment = () => {
    const selected = reservations.filter((r) => selectedIds.includes(r.id));
    navigate("/payment", { state: { selected } });
  };

  const total = selectedIds.reduce((sum, id) => {
    const match = reservations.find((r) => r.id === id);
    return sum + (match?.price || 0);
  }, 0);

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <p>{reservations.length} courts on hold</p>
      <table className="cart-table">
        <thead>
          <tr>
            <th></th>
            <th>Location</th>
            <th>Date</th>
            <th>Time</th>
            <th>Players</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(r.id)}
                  onChange={() => toggleSelect(r.id)}
                />
              </td>
              <td>{courtNames[r.court_id] || `Court ${r.court_id}`}</td>
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
              <td>4</td>
              <td>${r.price?.toFixed(2) || "0.00"}</td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(r.id)}>🗑</button>
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
          disabled={!selectedIds.length}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
