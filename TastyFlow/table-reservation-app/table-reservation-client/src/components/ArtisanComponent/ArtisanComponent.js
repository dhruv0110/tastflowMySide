// src/components/ArtisanComponent.js

import React from 'react';
import './ArtisanComponent.css'; // Import CSS for styling

const ArtisanComponent = () => {
  return (
    <section className="container artisan-container">
      <div className="artisan-content">
        <p className="artisan-tag">Delicious</p>
        <h1 className="artisan-title">Curated Culinary Creations</h1>
        <p className="artisan-description">
          Welcome to a realm of meticulously crafted culinary masterpieces, where every dish is a testament to artistry and flavour.
        </p>
      </div>
    </section>
  );
};

export default ArtisanComponent;
