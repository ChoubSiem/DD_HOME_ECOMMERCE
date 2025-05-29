import React from 'react';
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "./Notfound.css";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      {/* 404 Text */}
      <div className="error-code" aria-label="404 Not Found">404</div>

      {/* Illustration */}
      <div className="illustration">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#52c41a" opacity="0.1" />
          <circle cx="70" cy="80" r="10" fill="#52c41a" />
          <circle cx="130" cy="80" r="10" fill="#52c41a" />
          <path 
            d="M70 130 Q100 150 130 130" 
            stroke="#52c41a" 
            strokeWidth="3" 
            fill="none" 
          />
        </svg>
      </div>

      {/* Message */}
      <h1 className="title">Oops! Page Not Found</h1>
      <p className="description">
       This page not found in DD_Home company system.
      </p>

      {/* Action Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="go-back-btn"
        style={{ background: '#52c41a' }}
      >
        <FiArrowLeft /> Return Home
      </button>
    </div>
  );
}

export default NotFoundPage;