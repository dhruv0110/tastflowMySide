import React from "react";
import "./HomepageGallery.css";
import marqueeOneImageOne from "./Image/marqueeOneImageOne.jpg";
import marqueeOneImageTwo from "./Image/marqueeOneImageTwo.jpg";
import marqueeOneImageThree from "./Image/marqueeOneImageThree.jpg";
import marqueeOneImageFour from "./Image/marqueeOneImageFour.jpg";

import marqueeTwoImageOne from "./Image/marqueeTwoImageOne.jpg";
import marqueeTwoImageTwo from "./Image/marqueeTwoImageTwo.jpg";
import marqueeTwoImageThree from "./Image/marqueeTwoImageThree.jpg";
import marqueeTwoImageFour from "./Image/marqueeTwoImageFour.jpg";

export const HomepageGallery = () => {
  return (
    <>
      <div className="HomepageGalleryBody">
        <div className="HomepageGalleryDesc">
          <h4 className="ourTeam">Gallery</h4>
          <h1 className="title pb-5">A Delicious Display</h1>
        </div>

        <div className="marquee-container">
          <div className="marquee marquee-left">
            <div className="marquee-content">
              <img src={marqueeOneImageOne} alt="Slider 1" />
              <img src={marqueeOneImageTwo} alt="Slider 2" />
              <img src={marqueeOneImageThree} alt="Slider 3" />
              <img src={marqueeOneImageFour} alt="Slider 4" />
            </div>
            {/* Duplicate marquee-content for continuous effect */}
            <div className="marquee-content">
              <img src={marqueeOneImageOne} alt="Slider 1" />
              <img src={marqueeOneImageTwo} alt="Slider 2" />
              <img src={marqueeOneImageThree} alt="Slider 3" />
              <img src={marqueeOneImageFour} alt="Slider 4" />
            </div>
          </div>
        </div>

        <div className="marquee-container">
          <div className="marquee marquee-right">
            <div className="marquee-content">
              <img src={marqueeTwoImageOne} alt="Slider 1" />
              <img src={marqueeTwoImageTwo} alt="Slider 2" />
              <img src={marqueeTwoImageThree} alt="Slider 3" />
              <img src={marqueeTwoImageFour} alt="Slider 4" />
            </div>
            {/* Duplicate marquee-content for continuous effect */}
            <div className="marquee-content">
              <img src={marqueeTwoImageOne} alt="Slider 1" />
              <img src={marqueeTwoImageTwo} alt="Slider 2" />
              <img src={marqueeTwoImageThree} alt="Slider 3" />
              <img src={marqueeTwoImageFour} alt="Slider 4" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomepageGallery;
