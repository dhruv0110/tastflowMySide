import React, { useEffect, useState } from 'react';
import './Loading.css';

const Loading = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000); // Set to 3 seconds for the zipper animation

    return () => clearTimeout(timer);
  }, []);

  return visible ? (
    <div className="loading-container">
      <div className="zipper">
        <div className="zipper-left">
          Welcome
        </div>
        <div className="zipper-right">
          TastyFlow
        </div>
      </div>
    </div>
  ) : (
    <div className="site-content">
      {/* Your site content here */}
    </div>
  );
};

export default Loading;
