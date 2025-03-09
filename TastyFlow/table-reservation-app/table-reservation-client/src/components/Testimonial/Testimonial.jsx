import React from 'react'
import './Testimonial.css'
import Slider from 'react-slick';
import TestimonialCards from './TestimonialCards';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Images
import david from './Images/david.jpg';
import emily from './Images/emily.jpg';
import roberto from './Images/roberto.jpg';
import alex from './Images/alex.jpg';
import olivia from './Images/olivia.jpg';
import maria from './Images/maria.jpg';


const testimonialData = [
    {
        image: david,
        name: 'David Lewis',
        description: 'Discovering unique ingredients and cooking techniques that add depth and excitement to my culinary endeavors.'
    },
    {
        image: emily,
        name: 'Emily Kim',
        description: '‘Flavourful Feasts\' always delivers innovative and tasteful content that elevates my cooking experience.'
    },
    {
        image: roberto,
        name: 'Roberto Garcia',
        description: 'Ideas within each list have broadened my cooking repertoire & boosted my confidence in the kitchen.'
    },
    {
        image: alex,
        name: 'Alex Morgan',
        description: 'Their lists are an absolute goldmine for anyone passionate about cooking and exploring new flavours.'
    },
    {
        image: olivia,
        name: 'Olivia Ryn',
        description: 'Flavour explosions in every dish! The chefs here know how to elevate simple ingredients into extraordinary culinary experiences.'
    },
    {
        image: maria,
        name: 'Maria Fern',
        description: 'From introducing me to exotic spices to offering innovative ways to pair ingredients, these lists have broadened my culinary horizons in ways I never imagined.'
    }

];

const Testimonial = () => {
    const settings = {
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true,
        prevArrow: <button className="slick-prev"></button>,
        nextArrow: <button className="slick-next"></button>,
        responsive: [
            {
                breakpoint: 992, // Below 992px
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 768, // Below 768px
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    };

    return (
        <>
            <div className="container">
                <div className="testimonial mt-5 mb-5">
                    <p className='testimonialTitle'>Testimonial</p>
                    <h2 className='testimonialSubTitle'>Our Cherished Patrons.</h2>
                    <p className='testimonialPara'>Appreciation to those who sweeten our journey – our cherished patrons.
                        Your unwavering support is the sugar in our recipe, infusing each moment
                        with a delightful sweetness.
                    </p>
                </div>

                {/* Testimonial Cards */}
                <div className="testimonial-slider">
                    <Slider {...settings}>
                        {testimonialData.map((testimonial, index) => (
                            <TestimonialCards
                                key={index}
                                image={testimonial.image}
                                name={testimonial.name}
                                description={testimonial.description}
                            />
                        ))}
                    </Slider>
                </div>
            </div>
        </>
    )
}

export default Testimonial
