import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_DOMAIN } from "./config";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get(`${API_DOMAIN}/user/profile`, {
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
         <p><strong>Max Bookings:</strong> {user.maxCourtsPerDay}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}
