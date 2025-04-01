import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CSS/PaymentForm.css";

export default function PaymentForm() {
  const [paymentMode, setPaymentMode] = useState("card");
  const [formData, setFormData] = useState({});
  const [pendingReservations, setPendingReservations] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState("");
  const [paymentAmountInput, setPaymentAmountInput] = useState("");
  const [token, setToken] = useState("");

  const selectedReservationDetails = pendingReservations.find(
    (res) => res.id === parseInt(selectedReservation)
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchPendingReservations(storedToken);
    }
  }, []);

  const fetchPendingReservations = async (authToken) => {
    try {
      const response = await axios.get("http://localhost:3001/reservation", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const pending = response.data.filter(
        (res) => res.status.toLowerCase() === "pending"
      );
      setPendingReservations(pending);
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

    if (!selectedReservation) {
      alert("Please select a pending reservation.");
      return;
    }

    if (
  
      parseFloat(paymentAmountInput) !==
      parseFloat(selectedReservationDetails?.price || 0)
    ) {
      alert("Payment amount must match the required price.");
      //alert(selectedReservationDetails.reason)

      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/reservation/confirm",
        {
          reservationId: selectedReservation,
          paymentAmount: parseFloat(paymentAmountInput),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Payment confirmed and reservation updated!");
      setFormData({});
      setSelectedReservation("");
      setPaymentAmountInput("");
      fetchPendingReservations(token);
    } catch (err) {
      console.error("Error confirming payment:", err);
      alert("Payment failed. See console for details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h2 className="form-title">Confirm Pending Reservation</h2>

      <label className="form-label">Select a Pending Reservation:</label>
      <select
        className="form-select"
        value={selectedReservation}
        onChange={(e) => setSelectedReservation(e.target.value)}
        required
      >
        <option value="">-- Select Reservation --</option>
        {pendingReservations.map((res) => (
          <option key={res.id} value={res.id}>
            #{res.id} - Court {res.court_id} on {res.start} to {res.end}
          </option>
        ))}
      </select>

      {selectedReservationDetails && (
        <div className="form-section">
          <p>
            <strong>Amount Due:</strong> ${selectedReservationDetails.price}
          </p>

          <label className="form-label">Enter Payment Amount:</label>
          <input
            type="number"
            name="paymentAmount"
            step="0.01"
            placeholder="Exact amount due"
            className="form-input"
            value={paymentAmountInput}
            onChange={(e) => setPaymentAmountInput(e.target.value)}
            required
          />
        </div>
      )}

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

      {/* Your existing payment method form inputs */}
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

      {/* PayPal + UPI Sections (unchanged) */}
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
    </form>
  );
}
