
import "./CulinaryFavorites.css"; // Import the CSS file for custom styling
import secondHero1 from "../../assets/secondHero1.jpg";
import secondHero2 from "../../assets/secondHero2.jpg";
import { Link } from "react-router-dom"; // Import Link for navigation

const CulinaryFavorites = () => {
  return (
    <>
      <div className="wrapper">
        <div className="fav-culinary-container">
          <div className="fav-image-section">
            <img
              src={secondHero1}
              alt="Delicious Chicken"
              className="fav-main-image"
            />
            <img
              src={secondHero2}
              alt="Pumpkin Soup"
              className="fav-secondary-image"
            />
          </div>
          <div className="fav-text-section">
            <h3 className="fav-about-us">About Us</h3>
            <h1 className="fav-title">Captivating Culinary Favorites.</h1>
            <p className="fav-description">
              Explore a world of enticing flavors and culinary marvels. Dive
              into a collection of captivating dishes designed to delight your
              senses. Experience an array of favorites that elevate your dining
              journey.
            </p>
            <div className="fav-button-container">
            <Link to='Menu_Page'>
            <button className="fav-get-menu-btn">Get Menu</button>
            </Link>

            <Link to='About'>
              About TastyFlow
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CulinaryFavorites;
