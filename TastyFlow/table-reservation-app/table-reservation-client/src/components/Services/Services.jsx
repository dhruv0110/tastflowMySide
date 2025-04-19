import React from 'react'
import AboutSectionOneImage from './Images/AboutSectionOneImage.png';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/CardGroup';
import './Services.css'
import Footer from '../Footer/Footer';


const Services = () => {
    return (
        <>
        {/* SectionOne */}
            <div className="AboutSectionOne pt-5 py-md-0">
                <div className="container">
                    <div className="row align-items-center">
                        {/* Left Content */}
                        <div className="col-lg-6 col-md-6 col-12 text-md-start text-center AboutSectionOneLeft">
                            <h5 className="subheading">Services</h5>
                            <h1>Our Offerings</h1>
                            <p>
                                From indulgent classics to innovative marvels, each creation is a testament to our commitment to culinary excellence.
                            </p>
                            <button className="hero-button btn btn-outline-light">Get Menu</button>
                        </div>

                        {/* Right Image */}
                        <div className="col-lg-6 col-md-6 col-12 text-center pt-md-5 mt-md-5">
                            <img className="AboutSectionOneImage img-fluid mt-5" src={AboutSectionOneImage} alt="AboutSectionOneImage" />
                        </div>
                    </div>
                </div>
            </div>

            <div className='main-div d-flex flex-column gap-4 mb-5 mt-5'>
                <div className='div-1'>
                    <CardGroup className='gap-3 d-flex flex-wrap justify-content-center services-card-group'>
                        <Card style={{ maxWidth: '20rem', backgroundColor: '#D3D3D3' }}
                            className='rounded-4 services-card pb-3 pt-2 mx-2 my-2 services-card'>
                            <Card.Img style={{ maxWidth: '5rem', maxHeight: '14rem' }} variant="top"
                                src="https://cdn.prod.website-files.com/653a12ff1d377f67d4b06d12/658eacc4c4c1c4b70cd1e20c_service-icon-01.svg"
                                className='rounded-5 mt-4 ms-4 mb-2' />
                            <Card.Body>
                                <Card.Title className='text-dark services-card-title pe-2 mb-3 px-2'>
                                    <div>Wholesome Cuisine</div>
                                </Card.Title>
                                <Card.Text className='text-secondary px-2 services-card-text' style={{ fontWeight: '600' }}>
                                    Values fresh, unprocessed ingredients and culinary techniques that preserve the natural goodness
                                    of food.
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card style={{ maxWidth: '20rem', backgroundColor: '#D3D3D3' }}
                            className='rounded-4 services-card pb-3 pt-3 mx-2 my-2 services-card'>
                            <Card.Img style={{ maxWidth: '5rem', maxHeight: '14rem' }} variant="top"
                                src="https://cdn.prod.website-files.com/653a12ff1d377f67d4b06d12/658eacc4754826eebe958241_service-icon-02.svg"
                                className='mt-4 ms-4 mb-2' />
                            <Card.Body>
                                <Card.Title className='text-dark services-card-title pe-2 mb-3 px-2'>
                                    <div>Prepare & Deliver</div>
                                </Card.Title>
                                <Card.Text className='text-secondary px-2 services-card-text' style={{ fontWeight: '600' }}>
                                    Meticulously crafted meals designed to elevate your dining experience without leaving the
                                    comfort of your own space.
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card style={{ maxWidth: '20rem', backgroundColor: '#D3D3D3' }}
                            className='rounded-4 services-card pb-3 pt-2 mx-2 my-2'>
                            <Card.Img style={{ maxWidth: '5rem', maxHeight: '14rem' }} variant="top"
                                src="https://cdn.prod.website-files.com/653a12ff1d377f67d4b06d12/658eacc4a5d5a58ad3aa1d92_service-icon-03.svg"
                                className='rounded-5 mt-4 ms-4 mb-2' />
                            <Card.Body>
                                <Card.Title className='text-dark services-card-title pe-2 mb-3 px-2'>
                                    <div>Ready-to-Serve</div>
                                </Card.Title>
                                <Card.Text className='text-secondary px-2services-card-text' style={{ fontWeight: '600' }}>
                                    Offering a range of ready-to-indulge meals designed to elevate your dining experience without
                                    compromising taste or quality.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </CardGroup>
                </div>

               
                <div className='div-2'>
                    <CardGroup className='gap-3 d-flex flex-wrap justify-content-center'>
                        <Card style={{ maxWidth: '20rem', backgroundColor: '#D3D3D3' }}
                            className='rounded-4 services-card pb-3 pt-2 mx-2 my-2'>
                            <Card.Img style={{ maxWidth: '5rem', maxHeight: '14rem' }} variant="top"
                                src="https://cdn.prod.website-files.com/653a12ff1d377f67d4b06d12/658eacc446a2dae0521c3b62_service-icon-04.svg"
                                className='mt-4 ms-4 mb-2' />
                            <Card.Body>
                                <Card.Title className='text-dark services-card-title pe-2 mb-3 px-2'>
                                    <div>Savor & Relish</div>
                                </Card.Title>
                                <Card.Text className='text-secondary px-2 services-card-text' style={{ fontWeight: '600' }}>
                                    Inviting you to relish in the symphony of aromas, textures, and tastes meticulously crafted to
                                    elevate your dining experience.
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card style={{ maxWidth: '20rem', backgroundColor: '#D3D3D3' }}
                            className='rounded-4 services-card pb-3 pt-1 mx-2 my-2'>
                            <Card.Img style={{ maxWidth: '5rem', maxHeight: '5rem' }} variant="top"
                                src="https://cdn.prod.website-files.com/653a12ff1d377f67d4b06d12/658eacc49b4bd43921d5ebc3_service-icon-05.svg"
                                className='mt-4 ms-4 mb-2' />
                            <Card.Body>
                                <Card.Title className='text-dark services-card-title pe-2 mb-3 px-2'>
                                    <div>Distinctive Deals</div>
                                </Card.Title>
                                <Card.Text className='text-secondary px-2 services-card-text' style={{ fontWeight: '600' }}>
                                    Sophistication and value, meticulously crafted to cater to the refined preferences of our
                                    esteemed patrons.
                                </Card.Text>
                            </Card.Body>
                        </Card>

                        <Card style={{ maxWidth: '20rem', backgroundColor: '#D3D3D3' }}
                            className='rounded-4 services-card pb-3 pt-3 mx-2 my-2'>
                            <Card.Img style={{ maxWidth: '5rem', maxHeight: '14rem' }} variant="top"
                                src="https://cdn.prod.website-files.com/653a12ff1d377f67d4b06d12/658eacc4b26b11084feb1bb8_service-icon-06.svg"
                                className='mt-4 ms-4 mb-2' />
                            <Card.Body>
                                <Card.Title className='text-dark services-card-title pe-2 mb-3 px-2'>
                                    <div>Cyber Buying Hub</div>
                                </Card.Title>
                                <Card.Text className='text-secondary px-2 services-card-text' style={{ fontWeight: '600' }}>
                                    Redefines the shopping experience, offering a virtual gateway to a myriad of products and
                                    services at your fingertips.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </CardGroup>
                </div>
            </div>
            <Footer/>
        </>
    )
}

export default Services
