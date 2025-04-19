import React from 'react'
import '../About/About.css';
import './Menu_Page.css';
import Footer from "../Footer/Footer";

// Images
import MenuSectionOne from './Images/Menu_section_one.png'
import breakfastOne from './Images/breakfast-menu-01.png'
import breakfastTwo from './Images/breakfast-menu-02.png'
import LunchOne from './Images/lunch-menu-01.png'
import LunchTwo from './Images/lunch-menu-02.png'
import DinnerOne from './Images/dinner-menu-01.png'
import DinnerTwo from './Images/dinner-menu-02.png'
import { Link } from 'react-router-dom';

// Menu item arrays
const breakfastMenu1 = [
  { name: 'Scrambled or fried eggs', price: '$17.06' },
  { name: 'Crispy bacon or sausage links', price: '$22.06' },
  { name: 'Hash browns or breakfast', price: '$27.02' },
  { name: 'Fluffy pancakes', price: '$35.06' },
  { name: 'Delicious Pancakes', price: '$24.78' },
  { name: 'Griddled until brown', price: '$27.02' },
];

const breakfastMenu2 = [
  { name: 'Fluffy scrambled eggs', price: '$17.06' },
  { name: 'Golden hash browns', price: '$22.06' },
  { name: 'Muffin with butter and jam', price: '$27.02' },
  { name: 'Fluffy waffles', price: '$35.06' },
  { name: 'English muffin halves', price: '$24.78' },
  { name: 'Hollandaise sauce', price: '$27.02' },
];

const lunchMenu1 = [
  { name: 'Cheeseburger', price: '$17.06' },
  { name: 'Salad with Grilled Chicken', price: '$22.06' },
  { name: 'BLT Sandwich', price: '$27.02' },
  { name: 'Grilled Veggie Wrap', price: '$35.06' },
  { name: 'Chicken Club Sandwich', price: '$24.78' },
  { name: 'Southwest Chicken Salad', price: '$27.02' },
];

const lunchMenu2 = [
  { name: 'BBQ Pulled Sandwich', price: '$17.06' },
  { name: 'Caprese Panini', price: '$22.06' },
  { name: 'Southwest Chicken Salad', price: '$27.02' },
  { name: 'Fish Tacos', price: '$35.06' },
  { name: 'Mushroom Swiss Burger', price: '$24.78' },
  { name: 'Grilled Veggie Wrap', price: '$27.02' },
];

const dinnerMenu1 = [
  { name: 'Grilled Ribeye Steak', price: '$17.06' },
  { name: 'Lemon Herb Roast Chicken', price: '$22.06' },
  { name: 'Pasta Primavera', price: '$27.02' },
  { name: 'Shrimp Scampi', price: '$35.06' },
  { name: 'BBQ Ribs', price: '$24.78' },
  { name: 'Salmon with Dill Sauce', price: '$27.02' },
];

const dinnerMenu2 = [
  { name: 'Vegetarian Stir-Fry', price: '$17.06' },
  { name: 'Beef/Vegetable Lasagna', price: '$22.06' },
  { name: 'Mustard Pork Chops', price: '$27.02' },
  { name: 'Grilled Platter', price: '$35.06' },
  { name: 'Vegetarian Stir-Fry Bowl', price: '$24.78' },
  { name: 'Honey Mustard', price: '$27.02' },
];

const Menu_Page = () => {
  return (
    <>
      {/* SectionOne */}
      <div className="AboutSectionOne pt-5 py-md-0">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-6 col-12 text-md-start text-center AboutSectionOneLeft">
              <h5 className="subheading">Menu</h5>
              <h1 className='menu-main-h1'>Our Exclusive Picks</h1>
              <p className='menu-main-p fs-5 text-sm-end text-md-start'>
                Each item has been handpicked, blending innovation and tradition to deliver an unforgettable dining experience.
              </p>
              <Link to='/table-reserve'>
              <button className="hero-button btn btn-outline-light">Reserve</button>
              </Link>
            </div>
            <div className="col-lg-6 col-md-6 col-12 text-center pt-md-5 mt-md-5">
              <img className="AboutSectionOneImage img-fluid mt-5" src={MenuSectionOne} alt="AboutSectionOneImage" />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <section class="menu-section">
        <div class="w-layout-blockcontainer container w-container">
          <div class="menu-whole-wrap">

            {/* Reuse this for breakfast, lunch, and dinner */}

            {/* Example: Breakfast Section */}
            <div class="menu-main-wrap">
              <div class="menu-title-area  mt-5 pt-5">
                <div class="menu-title-wrap">
                  <p class="menu-section-subtitle fw-bold">Breakfast</p>
                  <h2 class="menu-section-title  fs-1">Breakfast Menu</h2>
                </div>
              </div>
              <div class="menu-card-wrap">
                <div class="menu-content-area">
                  <div class="special-menu-wrap ">
                    <div class="menu-image-area">
                      <div class="menu-image-wrap">
                        <img src={breakfastOne} loading="lazy" alt="Menu dish img" class="menu-image" />
                      </div>
                    </div>
                    <div class="menu-content-wrap">
                      <div class="menu-subtitle-wrap">
                        <h3 class="menu-title">Our Delights</h3>
                        <p class="menu-description">The ordinary, inviting you to explore a world of flavours crafted with passion and precision.</p>
                      </div>

                      {/* BreakFast Menu-01 */}
                      <div class="menu-item-area">
                        {breakfastMenu1.map((item, index) => (
                          <div class="menu-item-wrap" key={index}>
                            <p class="menu-text">{item.name}</p>
                            <div class="menu-border-line"></div>
                            <p class="menu-price">{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div class="menu-center-border"></div>
                  <div class="classic-menu-wrap">
                    <div class="menu-image-area bottom-image">
                      <div class="menu-image-wrap">
                        <img src={breakfastTwo} alt="Menu dish img" class="menu-image" />
                      </div>
                    </div>
                    <div class="menu-content-wrap">
                      <div class="menu-subtitle-wrap">
                        <h3 class="menu-title">Breakfast Favourites</h3>
                        <p class="menu-description">Array of dishes that evoke warmth, satisfaction, and a touch of culinary nostalgia.</p>
                      </div>

                      {/* BreakFast Menu-02 */}
                      <div class="menu-item-area">
                        {breakfastMenu2.map((item, index) => (
                          <div class="menu-item-wrap" key={index}>
                            <p class="menu-text">{item.name}</p>
                            <div class="menu-border-line"></div>
                            <p class="menu-price">{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* LUNCH */}
            <div class="menu-main-wrap">
              <div class="menu-title-area mt-5 ">
                <div class="menu-title-wrap">
                  <p class="menu-section-subtitle fw-bold">Lunch</p>
                  <h2 class="menu-section-title fs-1">Lunch Menu</h2>
                </div>
              </div>
              <div class="menu-card-wrap">
                <div class="menu-content-area">
                  <div class="special-menu-wrap ">
                    <div class="menu-image-area">
                      <div class="menu-image-wrap">
                        <img src={LunchOne} alt="Menu dish img" class="menu-image" />
                      </div>
                    </div>
                    <div class="menu-content-wrap">
                      <div class="menu-subtitle-wrap">
                        <h3 class="menu-title">Our Delights</h3>
                        <p class="menu-description">Where every bite embodies passion, innovation, and the sheer pleasure of exceptional dining.</p>
                      </div>

                      {/* Lunch Menu-1 */}
                      <div class="menu-item-area">
                        {lunchMenu1.map((item, index) => (
                          <div class="menu-item-wrap" key={index}>
                            <p class="menu-text">{item.name}</p>
                            <div class="menu-border-line"></div>
                            <p class="menu-price">{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div class="menu-center-border"></div>
                  <div class="classic-menu-wrap">
                    <div class="menu-image-area bottom-image">
                      <div class="menu-image-wrap">
                        <img src={LunchTwo} alt="Menu dish img" class="menu-image" />
                      </div>
                    </div>
                    <div class="menu-content-wrap">
                      <div class="menu-subtitle-wrap">
                        <h3 class="menu-title">Lunch Favourites</h3>
                        <p class="menu-description">Flavours and textures, inviting you to savour the essence of American cuisine at its finest.</p>
                      </div>

                      {/* Lunch Menu-2 */}
                      <div class="menu-item-area">
                        {lunchMenu2.map((item, index) => (
                          <div class="menu-item-wrap" key={index}>
                            <p class="menu-text">{item.name}</p>
                            <div class="menu-border-line"></div>
                            <p class="menu-price">{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DINNER */}
            <div class="menu-main-wrap">
              <div class="menu-title-area mt-5 ">
                <div class="menu-title-wrap">
                  <p class="menu-section-subtitle fw-bold">Dinner</p>
                  <h1 class="menu-section-title fs-1">Dinner Menu</h1>
                </div>
              </div>
              <div class="menu-card-wrap">
                <div class="menu-content-area">
                  <div class="special-menu-wrap ">
                    <div class="menu-image-area">
                      <div class="menu-image-wrap">
                        <img src={DinnerOne} alt="Menu dish img" class="menu-image" />
                      </div>
                    </div>
                    <div class="menu-content-wrap">
                      <div class="menu-subtitle-wrap">
                        <h1 class="menu-title">Our Delights</h1>
                        <div class="menu-description-wrap">
                          <p class="menu-description">Innovation premium ingredients, and a passion for crafting memorable dining moments.</p>
                        </div>
                      </div>
                      {/* Dinner Menu-1 */}
                      <div class="menu-item-area">
                        {dinnerMenu1.map((item, index) => (
                          <div class="menu-item-wrap" key={index}>
                            <p class="menu-text">{item.name}</p>
                            <div class="menu-border-line"></div>
                            <p class="menu-price">{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div class="menu-center-border"></div>
                  <div class="classic-menu-wrap">
                    <div class="menu-image-area bottom-image">
                      <div class="menu-image-wrap">
                        <img src={DinnerTwo} alt="Menu dish img" class="menu-image" />
                      </div>
                    </div>
                      {/* Dinner Menu-2 */}
                    <div class="menu-content-wrap">
                      <div class="menu-subtitle-wrap">
                        <h1 class="menu-title">Dinner Favourites</h1>
                        <p class="menu-description">Array of dishes that evoke comfort, sophistication, and a fusion of culinary traditions.</p>
                      </div>
                      <div class="menu-item-area">
                        {dinnerMenu2.map((item, index) => (
                          <div class="menu-item-wrap" key={index}>
                            <p class="menu-text">{item.name}</p>
                            <div class="menu-border-line"></div>
                            <p class="menu-price">{item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  )
}

export default Menu_Page




