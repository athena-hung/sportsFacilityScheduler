"use client"

import { useState, useEffect } from "react"
import "../CSS/Toast.css"

const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) setTimeout(onClose, 300) // Allow animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className={`toast-container ${visible ? "visible" : "hidden"} toast-${type}`}>
      <div className="toast-icon">
        {type === "success" && "✅"}
        {type === "error" && "❌"}
        {type === "info" && "ℹ️"}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={() => setVisible(false)}>
        ×
      </button>
    </div>
  )
}

export default Toast

