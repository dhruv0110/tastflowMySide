import React from "react";
import "./ChoiceOfCustomers.css";
import card1 from "../../assets/card1.svg"
import card2 from "../../assets/card2.svg"
import card3 from "../../assets/card3.svg"
import card4 from "../../assets/card4.svg"


const ChoiceOfCustomers = () => {
  return (
    <div className="choice-container">
      <div className="container">
        <div className="choice-main">
          <div className="choice-text-section">
            <h3 className="choice-services">Services</h3>
            <h1 className="choice-title">The Choice of <br/>Customers</h1>
            <p className="choice-description">
              Embraced by a discerning clientele, our offerings stand as the
              preferred choice among customers seeking excellence.
            </p>
            <button className="choice-view-more-btn">View More</button>
          </div>
          <div className="choice-cards-section">
              <div className="choice-card-1">
            <div className="choice-card">
                <div className="choice-icon-container">
                  <img
                    src={card1} // Replace with your icon URL
                    alt="Organic Food"
                    className="choice-icon"
                  />
                </div>
                <h2>Organic Food</h2>
                <p>
                  Where purity meets flavor, offering nature's finest for your
                  nourishment and taste.
                </p>
              </div>
              <div className="choice-card">
                <div className="choice-icon-container">
                  <img
                    src={card2} // Replace with your icon URL
                    alt="Delivery Services"
                    className="choice-icon"
                  />
                </div>
                <h2>Delivery Services</h2>
                <p>
                  Convenience meets reliability to bring your needs right to
                  your doorstep.
                </p>
              </div>
            </div>
            <div className="choice-card-2">
              <div className="choice-card">
                <div className="choice-icon-container">
                  <img
                    src={card3} // Replace with your icon URL
                    alt="Warm & Enjoy"
                    className="choice-icon"
                  />
                </div>
                <h2>Warm & Enjoy</h2>
                <p>
                  Where every experience is crafted to envelop you in comfort &
                  delight.
                </p>
              </div>
              <div className="choice-card">
                <div className="choice-icon-container">
                  <img
                    src={card4} // Replace with your icon URL
                    alt="Savour & Replay"
                    className="choice-icon"
                  />
                </div>
                <h2>Savour & Replay</h2>
                <p>
                  Welcome to the world where savoring and replaying joyous
                  tastes is the norm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoiceOfCustomers;
