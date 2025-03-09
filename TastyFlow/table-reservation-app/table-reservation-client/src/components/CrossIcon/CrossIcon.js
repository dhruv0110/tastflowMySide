// CrossIcon.js
import React from 'react';
import './CrossIcon.css'; // Import the CSS file for additional styling if needed

const CrossIcon = ({ onClick }) => (
  <span className="cross-icon" onClick={onClick}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-x"
      viewBox="0 0 16 16"
    >
      <path d="M1.293 0.293a1 1 0 0 1 1.414 0L8 5.586 13.293.293a1 1 0 1 1 1.414 1.414L9.414 7l5.293 5.293a1 1 0 0 1-1.414 1.414L8 8.414 2.707 13.707a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707A1 1 0 0 1 1.293 0.293z"/>
    </svg>
  </span>
);

export default CrossIcon;
