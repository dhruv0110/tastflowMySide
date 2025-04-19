import React from 'react'
import './About.css';
import { useState } from 'react';
import Testimonial from '../Testimonial/Testimonial';
import { Link } from 'react-router-dom';

// Images
import AboutSectionOneImage from './Images/AboutSectionOneImage.png';
import AboutStoryImageOne from './Images/aboutstory01.jpg'
import AboutStoryImageTwo from './Images/aboutstory02.jpg'
import AboutStoryImageThree from './Images/aboutstory03.jpg'
import AboutSectionThreeCarousel from './AboutSectionThreeCarousel';

// Menu Images
import aboutbreakfast01 from './Images/about-breakfast-01.png'
import aboutbreakfast02 from './Images/about-breakfast-02.png'
import aboutbreakfast03 from './Images/about-breakfast-03.png'
import aboutbreakfast04 from './Images/about-breakfast-04.png'
import aboutbreakfast05 from './Images/about-breakfast-05.png'
import aboutlunch01 from './Images/about-lunch-tab-01.png'
import aboutlunch02 from './Images/about-lunch-tab-02.png'
import aboutlunch03 from './Images/about-lunch-tab-03.png'
import aboutlunch04 from './Images/about-lunch-tab-04.png'
import aboutlunch05 from './Images/about-lunch-tab-05.png'
import aboutdinner01 from './Images/about-dinner-tab-01.png'
import aboutdinner02 from './Images/about-dinner-tab-02.png'
import aboutdinner03 from './Images/about-dinner-tab-03.png'
import aboutdinner04 from './Images/about-dinner-tab-04.png'
import aboutdinner05 from './Images/about-dinner-tab-05.png'
import Teams from '../Teams/Teams';
import Blog from "../Blog/Blog";
import Footer from "../Footer/Footer";



const About = () => {

    // Menu Array
    const [menu, setMenu] = useState("breakfast");

    const menuImages = {
        breakfast: [
            { id: 1, src: aboutbreakfast01, alt: "Top Image" },
            { id: 2, src: aboutbreakfast02, alt: "Left Image" },
            { id: 3, src: aboutbreakfast03, alt: "Center Image" },
            { id: 4, src: aboutbreakfast04, alt: "Right Image" },
            { id: 5, src: aboutbreakfast05, alt: "Bottom Image" },

        ],
        lunch: [
            { id: 1, src: aboutlunch01, alt: "Top Image" },
            { id: 2, src: aboutlunch02, alt: "Left Image" },
            { id: 3, src: aboutlunch03, alt: "Center Image" },
            { id: 4, src: aboutlunch04, alt: "Right Image" },
            { id: 5, src: aboutlunch05, alt: "Bottom Image" },
        ],
        dinner: [
            { id: 1, src: aboutdinner01, alt: "Top Image" },
            { id: 2, src: aboutdinner02, alt: "Left Image" },
            { id: 3, src: aboutdinner03, alt: "Center Image" },
            { id: 4, src: aboutdinner04, alt: "Right Image" },
            { id: 5, src: aboutdinner05, alt: "Bottom Image" },
        ],
    };

    const menuTexts = {
        breakfast: {
            heading: "Morning Feast",
            paragraph: "Essence of the morning feast—a celebration of flavors, aromas, and nourishment crafted to elevate your day from the very start."
        },

        lunch: {
            heading: "Midday Delights",
            paragraph: "This is a moment when palates are tantalized and cravings find their match. Midday isn't just a time of day; it's an opportunity to savor the culinary treasures that add flavor to our afternoons."
        },

        dinner: {
            heading: "Dining Delights",
            paragraph: "Dining Delights' is not just a mere collection of meals; it's an invitation to embark on a culinary journey filled with exquisite tastes and gastronomic adventures."
        }
    };
    return (
        <>

            {/* SectionOne */}
            <div className="AboutSectionOne pt-5 py-md-0">
                <div className="container">
                    <div className="row align-items-center">
                        {/* Left Content */}
                        <div className="col-lg-6 col-md-6 col-12 text-md-start text-center AboutSectionOneLeft">
                            <h5 className="subheading">About</h5>
                            <h1>Our Story</h1>
                            <p>
                                Sustenance and delight—a journey through culinary landscapes where
                                each dish narrates a unique tale.
                            </p>

                            <Link to='/Menu_Page'>
                            <button className="hero-button btn btn-outline-light">Get Menu</button>
                            </Link>
                        </div>

                        {/* Right Image */}
                        <div className="col-lg-6 col-md-6 col-12 text-center pt-md-5 mt-md-5">
                            <img className="AboutSectionOneImage img-fluid mt-5" src={AboutSectionOneImage} alt="AboutSectionOneImage" />
                        </div>
                    </div>
                </div>
            </div>


            {/* Section Two */}
            <div className="AboutSectionTwo pt-5 container pb-5">
                {/* Story Heading */}
                <div className="Subheadingflex text-center">
                    <div className="subheading">Story</div>
                    <h2 className="AboutStoryheading">In 1997, our company's journey commenced.</h2>
                    <p className="AboutStorysubheading">What began as a humble endeavour has blossomed into a celebration of flavours, an expedition through tastes and traditions.</p>
                </div>

                {/* Story Part */}
                <div className="row pt-5 justify-content-center">
                    <div className="col-lg-4 col-md-6 col-12 AboutStorySectionTwoLeft">
                        <img className="StoryImage img-fluid h-100" src={AboutStoryImageOne} alt="Story" />
                    </div>
                    <div className="col-lg-8 col-md-6 col-12 AboutStorySectionTwoRight">
                        <div className="AboutStorySectionTwoTop px-5 py-4 rounded-5 mt-4 mt-lg-0">
                            <h2>Our Triumph</h2>
                            <p>Achievement, and every milestone resonates with the spirit of our journey. Embark with us on this narrative of perseverance and accomplishment, where each chapter unfolds the stories behind our victories and the essence of our unwavering determination.</p>
                            <Link to='/Menu_Page'>
                            <button className='hero-button'>Get Menu</button>
                            </Link>
                        </div>

                        <div className="row AboutStorySectionTwoBottom mt-4">
                            <div className="col-md-6 col-12">
                                <img className="StoryImage img-fluid" src={AboutStoryImageTwo} alt="Story" />
                            </div>
                            <div className="col-md-6 col-12">
                                <img className="StoryImage img-fluid" src={AboutStoryImageThree} alt="Story" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Section-4 */}
            <div className="container text-center pt-4">
                <div className="row">
                    {/* Stat 1 */}
                    <div className="col-md-3 col-6">
                        <h2 className="stat-number">
                            25<span className="highlight">+</span>
                        </h2>
                        <p className="stat-text">Lifetime of Learning</p>
                    </div>

                    {/* Stat 2 */}
                    <div className="col-md-3 col-6">
                        <h2 className="stat-number">
                            400<span className="highlight">+</span>
                        </h2>
                        <p className="stat-text">Culinary Varieties</p>
                    </div>

                    {/* Stat 3 */}
                    <div className="col-md-3 col-6">
                        <h2 className="stat-number">
                            280<span className="highlight">+</span>
                        </h2>
                        <p className="stat-text">Explored</p>
                    </div>

                    {/* Stat 4 */}
                    <div className="col-md-3 col-6">
                        <h2 className="stat-number">
                            95<span className="highlight">%</span>
                        </h2>
                        <p className="stat-text">Satisfied Souls</p>
                    </div>
                </div>
            </div>
            {/* Section Three */}
            < div className="AboutSectionThree pt-5  bg-dark mt-5 pb-5 container" >
                <div className="AboutSectionThreeHeadingflex">
                    <div className="subheading text-center pt-5">Our Journey</div>
                    <h2 className='AboutSectionThreeheading text-white text-center'>Memorable Stops Along Our Journey</h2>
                    <p className='AboutSectionThreesubheading text-white text-center'>These stops are not merely destinations but pivotal
                        points that have shaped our narrative, leaving <br></br>an indelible mark on our collective experience.</p>
                </div>
                {/* Carousel Section */}
                <div className="slick-carousel pb-5">
                    <AboutSectionThreeCarousel />

                </div>
            </div >

            {/* Section 5 */}
            <div className="AboutSectionFive mb-5">
                <div className="container">
                    <div className="menu-container">
                        {/* Circular Images */}
                        <div className="circular-images">
                            {menuImages[menu].map((item, index) => (
                                <div key={item.id} className={`circle circle-${index + 1}`}>
                                    <img src={item.src} alt={item.alt} />
                                </div>
                            ))}
                        </div>

                        {/* Text Content */}
                        <div className="AboutMenu-text-content">
                            <h1>{menuTexts[menu].heading}</h1>
                            <p>{menuTexts[menu].paragraph}</p>
                            <button className="AboutMenuButton">Order Now</button>
                        </div>

                        {/* Menu Links */}
                        <div className="menu-links">
                            <span onClick={() => setMenu("breakfast")} className={menu === "breakfast" ? "active" : ""}>
                                Breakfast Menu
                            </span>
                            <span onClick={() => setMenu("lunch")} className={menu === "lunch" ? "active" : ""}>
                                Lunch Menu
                            </span>
                            <span onClick={() => setMenu("dinner")} className={menu === "dinner" ? "active" : ""}>
                                Dinner Menu
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section-6 Team section */}
            <div className="AboutRepeats mt-5">
                <Teams />
            </div>

            {/* Section-7 Testimonial */}
            <div className="AboutRepeats mt-0">
                <Testimonial />
            </div>

            {/* Footer */}
            <Footer/>
        </>


    )
}

export default About