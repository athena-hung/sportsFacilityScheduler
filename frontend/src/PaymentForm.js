import React, { useState } from "react";
import "./CSS/PaymentForm.css";

export default function PaymentForm() {
  const [paymentMode, setPaymentMode] = useState("card");
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Payment Data:", { paymentMode, ...formData });
    alert("Payment submitted!");
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <h2 className="form-title">Payment Details</h2>

      <label className="form-label">Choose Payment Method:</label>
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

      <button type="submit" className="form-button">Submit Payment</button>
    </form>
  );
}
