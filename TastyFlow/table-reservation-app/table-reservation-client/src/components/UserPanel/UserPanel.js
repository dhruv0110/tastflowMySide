import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./UserPanel.css";
import FoodDisplay from "../FoodDisplay/FoodDisplay";
import CulinaryFavorites from "../secondHero/CulinaryFavorites";
import ChoiceOfCustomers from "../ChoiceOfCustomers/ChoiceOfCustomers";
import gsap from "gsap";

// Import all images you want to use for rotation
import sectionOneRightTopOne from "../../assets/sectionOneRightTopOne.jpg";
import sectionOneRightTopTwo from "../../assets/sectionOneRightTopTwo.jpg";
import sectionOneRightBottomOne from "../../assets/sectionOneRightBottomOne.jpg";
import sectionOneRightBottomTwo from "../../assets/sectionOneRightBottomTwo.jpg";
import sectionOneRightTopThree from "../../assets/sectionOneRightTopThree.jpg";
import sectionOneRightBottomThree from "../../assets/sectionOneRightBottomThree.jpg";
import spinner from "../../assets/spinner.svg";
import ArtisanComponent from "../ArtisanComponent/ArtisanComponent";
import FilterDisplay from "../FilterDisplay/FilterDisplay";
import Teams from "../Teams/Teams";
import { HomepageGallery } from "../HomepageGallery/HomepageGallery";
import Footer from "../Footer/Footer";
import ContactUs from "../ContactUs/ContactUs";
import Blog from "../Blog/Blog";
import Testimonial from "../Testimonial/Testimonial";
import {Link} from "react-router-dom"; // Import Link for navigation

function UserPanel({ showAlert }) {
  const divRef = useRef(null);
  const heroTextRef = useRef(null); // Ref for .hero-text

  useEffect(() => {
    gsap.to(divRef.current, {
      rotation: 360,
      duration: 12,
      repeat: -1,
      ease: "linear",
    });
  }, []);

  useEffect(() => {
    gsap.fromTo(
      heroTextRef.current,
      { x: "-50%", opacity: 0 }, // Start position (off-screen to the left)
      { x: "0%", opacity: 1, duration: 1, ease: "power2.out" } // End position (its original place)
    );
  }, []);

  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

  // State for rotating images
  const [topImageIndex, setTopImageIndex] = useState(0);
  const [bottomImageIndex, setBottomImageIndex] = useState(0);
  const [fade, setFade] = useState(true); // State to handle fade effect

  // Array of images for rotation
  const topImages = [
    sectionOneRightTopOne,
    sectionOneRightTopTwo,
    sectionOneRightTopThree,
  ];
  const bottomImages = [
    sectionOneRightBottomOne,
    sectionOneRightBottomTwo,
    sectionOneRightBottomThree,
  ];

  useEffect(() => {
    fetchFoodList();

    // Interval for rotating top image
    const topImageInterval = setInterval(() => {
      setFade(false); // Start fade-out
      setTimeout(() => {
        setTopImageIndex((prevIndex) => (prevIndex + 1) % topImages.length);
        setFade(true); // Start fade-in
      }, 500); // Duration of fade-out
    }, 2500); // Change every 3 seconds

    // Interval for rotating bottom image
    const bottomImageInterval = setInterval(() => {
      setFade(false); // Start fade-out
      setTimeout(() => {
        setBottomImageIndex(
          (prevIndex) => (prevIndex + 1) % bottomImages.length
        );
        setFade(true); // Start fade-in
      }, 500); // Duration of fade-out
    }, 2500); // Change every 3 seconds

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(topImageInterval);
      clearInterval(bottomImageInterval);
    };
  }, []);

  const fetchFoodList = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/food/list");
      setFoodList(response.data.data);
    } catch (error) {
      console.error("Error fetching food list:", error);
      showAlert("Error fetching food list", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="hero-section">
        <div className="circle-bg"></div>
        <div className="arrow-img"></div>
        <div className="container hero-content">
          <div className="hero-text" ref={heroTextRef}> {/* Ref added here */}
            <p className="subheading">Best Taste</p>
            <h1>Healthy & Tasty Food</h1>
            <p className="description">
              Delight in the world of delectable, healthful cuisine that
              thrills your taste buds while feeding your body - welcome to the
              universe of Nutritious & Tasty food!
            </p>
            <Link to='Menu_Page'>
            <button className="hero-button">Get Menu</button>
            </Link>
          </div>

          <div className="spinner-div">
            <img
              src={spinner}
              loading="eager"
              alt="home wheel img"
              className="rotate-text"
              ref={divRef}
            />
          </div>
          <div className="hero-images">
            <img
              src={topImages[topImageIndex]}
              alt="Top Image"
              className={`hero-image1 ${fade ? "fade-in" : "fade-out"}`}
            />
            <img
              src={bottomImages[bottomImageIndex]}
              alt="Bottom Image"
              className={`hero-image2 ${fade ? "fade-in" : "fade-out"}`}
            />
          </div>
        </div>
      </div>

    
        <CulinaryFavorites />
      <div>
        <ChoiceOfCustomers />
      </div>
      <div className="container">
        <ArtisanComponent />
        <FoodDisplay category={category} food_list={foodList} />
      </div>

      <Teams />
      <Testimonial/>
      <HomepageGallery />
      <div className="container">
        <Blog />
        <FilterDisplay category={category} food_list={foodList} />
      </div>
      <ContactUs />
      <Footer />
    </>
  );
}

export default UserPanel;
