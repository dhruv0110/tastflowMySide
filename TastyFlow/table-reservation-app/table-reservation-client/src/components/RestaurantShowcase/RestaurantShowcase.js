import React from "react";
import "./RestaurantShowcase.css";
import choice1 from "../../assets/choice01.svg";
import choice2 from "../../assets/choice02.svg";
import choice3 from "../../assets/choice03.svg";
import choice4 from "../../assets/choice04.svg";
import choice5 from "../../assets/choice05.svg";

function RestaurantShowcase() {
  return (
    <div className="app-container">
      <div className="wrapper">
        <h1 className="restoh1">Choice among over 1250 restaurants globally.</h1>
        <p className="restop">
          Embark on a culinary journey with the preferred selection of over<br />
          1250 restaurants worldwide.
        </p>
        <div className="marquee">
          <div className="marquee-group">
            <div className="image-group">
              <img className="image" src={choice1} alt="Choice 1" />
            </div>
            <div className="image-group">
              <img className="image" src={choice2} alt="Choice 2" />
            </div>
            <div className="image-group">
              <img className="image" src={choice3} alt="Choice 3" />
            </div>
            <div className="image-group">
              <img className="image" src={choice4} alt="Choice 4" />
            </div>
            <div className="image-group">
              <img className="image" src={choice5} alt="Choice 5" />
            </div>
          </div>
          <div className="marquee-group">
            <div className="image-group">
              <img className="image" src={choice1} alt="Choice 1" />
            </div>
            <div className="image-group">
              <img className="image" src={choice2} alt="Choice 2" />
            </div>
            <div className="image-group">
              <img className="image" src={choice3} alt="Choice 3" />
            </div>
            <div className="image-group">
              <img className="image" src={choice4} alt="Choice 4" />
            </div>
            <div className="image-group">
              <img className="image" src={choice5} alt="Choice 5" />
            </div>
          </div>
        </div>
      </div>
    </div> 
  );
}

export default RestaurantShowcase;