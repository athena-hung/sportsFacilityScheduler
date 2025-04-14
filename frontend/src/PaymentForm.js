import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { API_DOMAIN } from "./config";
import "./CSS/PaymentForm.css";

export default function PaymentForm() {
  const [paymentMode, setPaymentMode] = useState("card");
  const [formData, setFormData] = useState({});
  const [pendingReservations, setPendingReservations] = useState([]);
  const [courtNames, setCourtNames] = useState({});
  const [token, setToken] = useState("");
  const location = useLocation();
  const selectedFromCart = location.state?.selected || [];

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchPendingReservations(storedToken);
    }
  }, []);

  const fetchPendingReservations = async (authToken) => {
    try {
      const response = await axios.get(`${API_DOMAIN}/reservation`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        params: { status: "Pending" },
      });

      const pending = response.data;

      // If user came from cart with selected reservations, use only those
      const filtered = selectedFromCart.length
        ? pending.filter((res) => selectedFromCart.some((sel) => sel.id === res.id))
        : pending;

      setPendingReservations(filtered);

      const uniqueCourtIds = [...new Set(filtered.map((r) => r.court_id))];
      const names = {};
      for (const id of uniqueCourtIds) {
        const courtRes = await axios.get(`${API_DOMAIN}/court/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        names[id] = courtRes.data.name;
      }
      setCourtNames(names);
    } catch (err) {
      console.error("Error fetching reservations:", err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const total = pendingReservations.reduce((sum, res) => sum + (res.price || 0), 0);
    if (parseFloat(formData.paymentAmount || 0) !== total) {
      alert(`Payment amount must match the total: $${total.toFixed(2)}`);
      return;
    }

    try {
      for (const res of pendingReservations) {
        await axios.post(
          `${API_DOMAIN}/reservation/confirm`,
          {
            reservationId: res.id,
            paymentAmount: res.price,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      alert("Payment confirmed and reservations updated!");
      setFormData({});
      fetchPendingReservations(token); // Refresh list
    } catch (err) {
      console.error("Error confirming payment:", err);
      alert("Payment failed. See console for details.");
    }
  };

  const totalAmount = pendingReservations.reduce(
    (sum, res) => sum + (res.price || 0),
    0
  );

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h2 className="form-title">Complete Payment</h2>

      {pendingReservations.length === 0 ? (
        <p>No pending reservations to pay for.</p>
      ) : (
        <>
          <div className="form-section">
            <h3>Reservations Summary:</h3>
            <ul>
              {pendingReservations.map((res) => (
                <li key={res.id}>
                  <strong>{courtNames[res.court_id] || `Court ${res.court_id}`}</strong>{" "}
                  on {res.start.split("T")[0]} from{" "}
                  {new Date(res.start).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  to{" "}
                  {new Date(res.end).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  — <strong>${res.price.toFixed(2)}</strong>
                </li>
              ))}
            </ul>
            <p className="total-amount">
              <strong>Total:</strong> ${totalAmount.toFixed(2)}
            </p>
          </div>

          <label className="form-label">Enter Total Payment Amount:</label>
          <input
            type="number"
            name="paymentAmount"
            step="0.01"
            placeholder="Exact total amount"
            className="form-input"
            value={formData.paymentAmount || ""}
            onChange={handleChange}
            required
          />

          <label className="form-label">Payment Method:</label>
          <select
            className="form-select"
            name="paymentMode"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="card">Credit/Debit Card</option>
            <option value="paypal">PayPal</option>
            <option value="upi">UPI</option>
          </select>

          {paymentMode === "card" && (
            <div className="form-section">
              <label className="form-label">Cardholder Name:</label>
              <input
                type="text"
                name="cardName"
                placeholder="Name on card"
                onChange={handleChange}
                className="form-input"
                required
              />
              <label className="form-label">Card Number:</label>
              <input
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                onChange={handleChange}
                className="form-input"
                required
              />
              <div className="form-row">
                <div>
                  <label className="form-label">Expiry:</label>
                  <input
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">CVV:</label>
                  <input
                    type="password"
                    name="cvv"
                    placeholder="***"
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMode === "paypal" && (
            <div className="form-section">
              <label className="form-label">PayPal Email:</label>
              <input
                type="email"
                name="paypalEmail"
                placeholder="your@email.com"
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          )}

          {paymentMode === "upi" && (
            <div className="form-section">
              <label className="form-label">UPI ID:</label>
              <input
                type="text"
                name="upiId"
                placeholder="yourname@bank"
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          )}

          <button type="submit" className="form-button">
            Confirm and Pay
          </button>
        </>
      )}
    </form>
  );
}
