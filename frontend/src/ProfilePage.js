// src/ProfilePage.js
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get("http://localhost:3001/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setUser(res.data.user);
    }).catch(err => {
      console.error("Failed to fetch user:", err);
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Profile Info</h2>
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
         <p><strong>Max Bookings Per Day:</strong> {user.maxCourtsPerDay}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}
