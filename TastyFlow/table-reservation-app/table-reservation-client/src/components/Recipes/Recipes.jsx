import React, { useEffect, useState } from "react";
import "../About/About.css";
import SectionOneImage from "./Images/recipe-banner-img.png";
import FoodDisplay from "../FoodDisplay/FoodDisplay";
import axios from "axios";
import Footer from "../Footer/Footer";
import { Link } from "react-router-dom"; // Import Link for navigation
import Teams from "../Teams/Teams";
const Recipes = ({ showAlert }) => {
  const [foodList, setFoodList] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchFoodList();
  }, []);
  return (
    <>
      {/* SectionOne */}
      <div className="AboutSectionOne pt-5 py-md-0">
        <div className="container">
          <div className="row align-items-center">
            {/* Left Content */}
            <div className="col-lg-6 col-md-6 col-12 text-md-start text-center AboutSectionOneLeft">
              <h5 className="subheading">Recipes</h5>
              <h1>Signature Dishes</h1>
              <p>
                Each dish is a masterpiece, meticulously curated to represent
                the pinnacle of our culinary expertise and innovation.
              </p>
              <Link to='/Menu_Page'>
              <button className="hero-button btn btn-outline-light">
                Get Menu
              </button>
              </Link>

              
            </div>

            {/* Right Image */}
            <div className="col-lg-6 col-md-6 col-12 text-center pt-md-5 mt-md-5">
              <img
                className="AboutSectionOneImage img-fluid mt-5"
                src={SectionOneImage}
                alt="AboutSectionOneImage"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <FoodDisplay category={category} food_list={foodList} />
      </div>

      <Teams/>
      <Footer />
    </>
  );
};

export default Recipes;
