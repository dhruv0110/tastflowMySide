import React, { useEffect, useState } from 'react'
import '../About/About.css';
import './Menu_Page.css';
import Footer from "../Footer/Footer";
import MenuSectionOne from './Images/Menu_section_one.png'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Menu_Page = ({showAlert}) => {
  const [userDetails, setUserDetails] = useState({ name: "", email: "", id: "" });
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  let navigate = useNavigate();

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      const response = await fetch("http://localhost:5000/api/users/getuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      return null;
    }
  };

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
    const getUserDetails = async () => {
      const userData = await fetchUserDetails();
      if(localStorage.getItem("token")){
        setUserDetails(userData);
      }else{
        navigate("/login");
      }
      if (userData) {
        setUserDetails(userData);
      } else {
        setUserDetails({ name: "", email: "", id: "" });
      }
    };

    getUserDetails();
    fetchFoodList();
  }, []);

  // Group food items by meal type and category
  const groupedFood = foodList.reduce((acc, item) => {
    if (!acc[item.mealType]) {
      acc[item.mealType] = {
        Starter: [],
        'Main Course': [],
        Dessert: [],
      };
    }
    if (acc[item.mealType][item.category]) {
      acc[item.mealType][item.category].push(item);
    }
    return acc;
  }, {});

  // Render menu section for a specific meal type
  const renderMealSection = (mealType) => {
    const mealData = groupedFood[mealType] || {
      Starter: [],
      'Main Course': [],
      Dessert: []
    };

    return (
      <div className="menu-time-section" key={mealType}>
        <div className="menu-time-header">
          <h2 className="meal-type-title">{mealType}</h2>
          <p className="meal-type-subtitle">Delicious {mealType.toLowerCase()} options</p>
        </div>
        
        <div className="menu-categories-grid">
          {/* Starter Section */}
          <div className="menu-category-card starter-card">
            <div className="category-header">
              <h3 className="category-title">Starters</h3>
            </div>
            <ul className="menu-items-list">
              {mealData.Starter.map((item, index) => (
                <li className="menu-item" key={index}>
                  <span className="item-name">{item.name}</span>
                  <span className="item-dots"></span>
                  <span className="item-price">${item.price}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Main Course Section */}
          <div className="menu-category-card main-course-card">
            <div className="category-header">
              <h3 className="category-title">Main Course</h3>
            </div>
            <ul className="menu-items-list">
              {mealData['Main Course'].map((item, index) => (
                <li className="menu-item" key={index}>
                  <span className="item-name">{item.name}</span>
                  <span className="item-dots"></span>
                  <span className="item-price">${item.price}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Dessert Section */}
          <div className="menu-category-card dessert-card">
            <div className="category-header">
              <h3 className="category-title">Desserts</h3>
            </div>
            <ul className="menu-items-list">
              {mealData.Dessert.map((item, index) => (
                <li className="menu-item" key={index}>
                  <span className="item-name">{item.name}</span>
                  <span className="item-dots"></span>
                  <span className="item-price">${item.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Hero Section */}
      <div className="AboutSectionOne pt-5 py-md-0">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-6 col-12 text-md-start text-center AboutSectionOneLeft">
              <h5 className="subheading">Menu</h5>
              <h1 className='menu-main-h1'>Our Exclusive Picks</h1>
              <p className='menu-main-p fs-5 text-sm-end text-md-start'>
                Each item has been handpicked, blending innovation and tradition to deliver an unforgettable dining experience.
              </p>
              {userDetails.role === 'admin' ? 
                <Link to='/admin/add'>
                  <button className="hero-button btn btn-outline-light">Add Menu</button>
                </Link>
                :
                <Link to='/table-reserve'>
                  <button className="hero-button btn btn-outline-light">Reserve</button>
                </Link>}
            </div>
            <div className="col-lg-6 col-md-6 col-12 text-center pt-md-5 mt-md-5">
              <img className="AboutSectionOneImage img-fluid mt-5" src={MenuSectionOne} alt="AboutSectionOneImage" />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <section className="menu-sections-container">
        <div className="container">
          <div className="menu-sections-wrapper">
            {['Breakfast', 'Lunch', 'Dinner'].map(mealType => (
              groupedFood[mealType] && renderMealSection(mealType)
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Menu_Page;