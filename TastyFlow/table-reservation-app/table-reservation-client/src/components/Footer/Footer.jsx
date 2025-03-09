import React from 'react';
import './Footer.css'; // Import the CSS file
import img1 from "./Images/imageOne.jpg"
import img2 from "./Images/imageTwo.jpg"
import img3 from "./Images/imageThree.jpg"
import img4 from "./Images/imageFour.jpg"
import img5 from "./Images/imageFive.jpg"
import logo from "./Images/tastyflowlogo.svg";


const Footer = () => {
  return (
    <footer className="footer">
        <div className="container">
      {/* Follow Us Images Section */}
      <div className="footer-images">
        <div className="f-img">
        <img src={img1} alt="Drink" />
        </div>
        <div className="f-img">
        <img src={img2} alt="Cake" />
        </div>
        <div className="f-img">
        <img src={img3} alt="Grill" />
        </div>
        <div className="f-img">
        <img src={img4} alt="Dessert" />
        </div>
        <div className="f-img">
        <img src={img5} alt="Pudding" />
        </div>
      </div>

      {/* Pages, Logo, and Follow Links Section */}
      <div className=" container footer-content">
        {/* Pages Section */}
        <div className="footer-section pages">
          <h3>Pages</h3>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#menu">Menu</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* Logo and Description Section */}
        <div className="footer-section site-info">
          <img src={logo} alt="TastyFlow Logo" className="logo" />
          <p>
            It's an art form, a language that communicates across borders, 
            an expression of love and creativity plated to perfection.
          </p>
        </div>

        {/* Follow Links Section */}
        <div className="footer-section follow-links">
          <h3>Follow Us</h3>
          <ul>
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook"></i></a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-twitter"></i></a></li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram"></i></a></li>
          </ul>
        </div>
      </div>
      </div>
    </footer>
  );
};

export default Footer;
