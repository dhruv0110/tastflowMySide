// CustomSpinner.js

import React from 'react';

const CustomSpinner = () => (
  <svg width="25" height="25" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" fill="none">
    <circle cx="25" cy="25" r="20" stroke="#007bff" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 25 25"
        to="360 25 25"
        dur="1s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

export default CustomSpinner;
