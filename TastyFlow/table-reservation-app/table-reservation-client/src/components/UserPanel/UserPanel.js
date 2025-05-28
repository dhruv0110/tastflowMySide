import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./UserPanel.css";
import FoodDisplay from "../FoodDisplay/FoodDisplay";
import CulinaryFavorites from "../secondHero/CulinaryFavorites";
import ChoiceOfCustomers from "../ChoiceOfCustomers/ChoiceOfCustomers";
import gsap from "gsap";
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
import { Link } from "react-router-dom";

function UserPanel({ showAlert }) {
  const divRef = useRef(null);
  const heroTextRef = useRef(null);
  const [foodList, setFoodList] = useState([]);
  const [, setLoading] = useState(true); // Keep if needed for future use
  const [topImageIndex, setTopImageIndex] = useState(0);
  const [bottomImageIndex, setBottomImageIndex] = useState(0);
  const [fade, setFade] = useState(true);

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

  const fetchFoodList = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/food/list");
      setFoodList(response.data.data);
    } catch (error) {
      console.error("Error fetching food list:", error);
      showAlert("Error fetching food list", "danger");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    gsap.to(divRef.current, {
      rotation: 360,
      duration: 12,
      repeat: -1,
      ease: "linear",
    });

    gsap.fromTo(
      heroTextRef.current,
      { x: "-50%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 1, ease: "power2.out" }
    );

    fetchFoodList();

    // Interval for rotating top image
    const topImageInterval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTopImageIndex((prevIndex) => (prevIndex + 1) % topImages.length);
        setFade(true);
      }, 500);
    }, 2500);

    // Interval for rotating bottom image
    const bottomImageInterval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setBottomImageIndex((prevIndex) => (prevIndex + 1) % bottomImages.length);
        setFade(true);
      }, 500);
    }, 2500);

    return () => {
      clearInterval(topImageInterval);
      clearInterval(bottomImageInterval);
    };
  }, [fetchFoodList, topImages.length, bottomImages.length]);

  return (
    <>
      <div className="hero-section">
        <div className="circle-bg"></div>
        <div className="arrow-img"></div>
        <div className="container hero-content">
          <div className="hero-text" ref={heroTextRef}>
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
              alt="Decorative spinning wheel"
              className="rotate-text"
              ref={divRef}
            />
          </div>
          <div className="hero-images">
            <img
              src={topImages[topImageIndex]}
              alt="Delicious food presentation"
              className={`hero-image1 ${fade ? "fade-in" : "fade-out"}`}
            />
            <img
              src={bottomImages[bottomImageIndex]}
              alt="Tasty meal close-up"
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
        <FoodDisplay category="All" food_list={foodList} />
      </div>

      <Teams />
      <Testimonial/>
      <HomepageGallery />
      <div className="container">
        <Blog />
        <FilterDisplay category="All" food_list={foodList} />
      </div>
      <ContactUs />
      <Footer />
    </>
  );
}

export default UserPanel;