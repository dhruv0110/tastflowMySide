
import React from 'react'
import { useState } from 'react';
import './About.css'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Images
import CarouselImageOne from './Images/CarouselImageOne.jpg'
import CarouselImageTwo from './Images/CarouselImageTwo.jpg'
import CarouselImageThree from './Images/CarouselImageThree.jpg'
import CarouselImageFour from './Images/CarouselImageFour.jpg'
import CarouselImageFive from './Images/CarouselImageFive.jpg'
import CarouselImageSix from './Images/CarouselImageSix.jpg'

// Slide data
const slides = [
    {
        image: CarouselImageOne,
        text: "Local Markets founded 2016",
    },
    {
        image: CarouselImageTwo,
        text: "Iconic Restaurants founded 2017",

    },
    {
        image: CarouselImageThree,
        text: "Food Festivals founded 2018",
    },

    {
        image: CarouselImageFour,
        text: "Cooking Classes founded 2019",
    },

    {
        image: CarouselImageFive,
        text: "Street Food founded 2020",
    },

    {
        image: CarouselImageSix,
        text: "Food Markets founded 2021",
    },

];

const AboutSectionThreeCarousel = () => {


    const [activeSlide, setActiveSlide] = useState(0);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: "0px",
        prevArrow: <div className="AboutSlickPrev"></div>,
        nextArrow: <div className="AboutSlickNext"></div>,
        responsive: [
            {
                breakpoint: 900,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
        beforeChange: (oldIndex, newIndex) => setActiveSlide(newIndex),
    };

    return (
        <>
            <div className="AboutcarouselContainer">
                <Slider {...settings}>
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`AboutSlickSlide ${index === activeSlide ? "active" : ""}`}
                        >
                            <div className="AboutCarouselCard">
                                <img  src={slide.image} alt={`Slide ${index + 1}`} className="AboutCarouselImage"/>

                                <div className={`carousel-text ${index === activeSlide ? "" : "hidden"}`}>
                                    {slide.text}
                                </div>
                                
                            </div>
                        </div>

                    ))}
                </Slider>
            </div>
        </>
    )
}

export default AboutSectionThreeCarousel
