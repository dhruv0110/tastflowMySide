import React from "react";
import "./Teams.css";
import teamsOne from './Images/teamsOne.jpg';
import teamsTwo from './Images/teamsTwo.jpg';
import teamsThree from './Images/teamsThree.jpg';

export const Teams = () => {
  return (
    <>
      <section className="container team-section">
        <h4 className="ourTeam">Our Team</h4>
        <h1 className="title">Our Culinary Artist</h1>
        <p className="subtitle">
          The kitchen brings a symphony of tastes to every plate, inviting you
          on a journey where each bite <br />
          tells a story of skill, passion, and devotion to the craft.
        </p>
        <div className="team-wrapper">
          <div className="member-card">
            <div className="image-wrapper">
              <img src={teamsOne} alt="Robert Williamson" />
            </div>
            <h3 className="member-name">Robert Williamson</h3>
            <p className="position">Kitchen Supervisor</p>
            <div className="social-icons">
              <a 
                href="https://facebook.com/robert.williamson" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Robert Williamson's Facebook"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a 
                href="https://xing.com/profile/robert_williamson" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Robert Williamson's Xing"
              >
                <i className="fab fa-xing"></i>
              </a>
              <a 
                href="https://instagram.com/chefrobert" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Robert Williamson's Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div className="member-card">
            <div className="image-wrapper">
              <img src={teamsTwo} alt="John Paul" />
            </div>
            <h3 className="member-name">John Paul</h3>
            <p className="position">Sous Culinaire</p>
            <div className="social-icons">
              <a 
                href="https://facebook.com/john.paul" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="John Paul's Facebook"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a 
                href="https://xing.com/profile/john_paul" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="John Paul's Xing"
              >
                <i className="fab fa-xing"></i>
              </a>
              <a 
                href="https://instagram.com/chefjohn" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="John Paul's Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div className="member-card">
            <div className="image-wrapper">
              <img src={teamsThree} alt="Sarah Jane" />
            </div>
            <h3 className="member-name">Sarah Jane</h3>
            <p className="position">Junior Executive Chef</p>
            <div className="social-icons">
              <a 
                href="https://facebook.com/sarah.jane" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Sarah Jane's Facebook"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a 
                href="https://xing.com/profile/sarah_jane" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Sarah Jane's Xing"
              >
                <i className="fab fa-xing"></i>
              </a>
              <a 
                href="https://instagram.com/chefsarah" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Sarah Jane's Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Teams;