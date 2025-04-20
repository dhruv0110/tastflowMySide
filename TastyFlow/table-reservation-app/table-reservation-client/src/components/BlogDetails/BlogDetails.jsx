import React from 'react'
import './BlogDetails.css'
import Teams from '../Teams/Teams'
import Footer from '../Footer/Footer'

const BlogDeatils = () => {
  return (
    <>
    <div className="blog-details-recipe-section mt-5">
        <div className="blog-details-main-section">
            <div className="blog-details-recipe-section-main d-flex gap-5 ">

                <div className="blog-details-recipe-section-left">
                    <a href="#" className="blog-details-recipe-section-image-wrap recipe-image rounded-5 overflow-hidden">
                        <img src="https://cdn.prod.website-files.com/6544bbda2afd28e6b968f038/65cdd57a9edc17f970ea50d7_blog-featured-thumbnail.jpg"
                            alt="" className="blog-details-recipe-image"/>
                    </a>
                    <a href="#" className="bg-white fw-medium  text-dark rounded-5  blog-details-recipe-button">Recipes</a>
                </div>

                <div className="blog-details-recipe-section-right  d-flex flex-column justify-content-center">
                    <div className="blog-details-date">
                        <p className="blog-details-para-color fw-medium">April 2, 2024</p>
                    </div>
                    <a href="#" className="blog-details-recipe-title mb-3 text-dark fw-medium ">Chronicles: A Buffet of Delectable</a>
                    <p className="blog-details-para-color ">Tantalizing realms of food, presenting an array of flavourful experiences, recipes, culinary
                        tips, & culinary inspirations.</p>
                    <a href="#" className="blog-details-read-more text-dark fw-medium">Read More <span className="blog-details-arrow">--</span> </a>
                </div>
            </div>
        </div>
    </div>

    <div className="blog-details-section d-flex flex-nowrap mt-5 ">
        <div className="blog-details-main ">
            <div className="row">
                <div className=" col-md-12 col-lg-8">
                    <div className="blog-details-left">
                        <div className="blog-details-list d-flex flex-column gap-3">

                            <div className="blog-details-list-1 d-flex gap-4">
                                <div className="blog-details-list-1-div">
                                    <a href="#" className="blog-details-image-link mb-2">
                                    <img src="https://cdn.prod.website-files.com/6544bbda2afd28e6b968f038/65696ac2f24ca81fd0b0f40f_blog-thumbnail-01.jpg"
                                        alt="" className="blog-details-list-img rounded-5 mb-3"/>
                                        </a>
                                    <div className="blog-details-list-para mb-4">
                                        <p className="blog-details-para-color">Dessert <span className="mx-2 text-dark fs-5">|</span>April 2,
                                            2024</p>
                                        <h4 className="blog-details-para-text mb-3">Gourmet Gazette: From Kitchen to Table</h4>
                                        <p className="blog-details-para-color fs-5">Exploration of culinary indulgence and fine dining
                                            pleasures.</p>
                                        <a href="#" className="text-black blog-details-read-more">Read More <i
                                                className="fas fa-arrow-right ms-2    "></i></a>
                                    </div>
                                </div>
                                <div className="blog-details-list-1-div-second">
                                    <a href="#" className="blog-details-image-link  mb-2">
                                    <img src="https://cdn.prod.website-files.com/6544bbda2afd28e6b968f038/65fe87baf17be2404e246bf3_blog-thumbnail-03.jpg"
                                        alt="" className="blog-details-list-img rounded-5 mb-3"/>
                                        </a>
                                    <div className="blog-details-list-para mb-4">
                                        <p className="blog-details-para-color">Recipes <span className="mx-2 text-dark fs-5">|</span>April 2,
                                            2024</p>
                                        <h4 className="blog-details-para-text mb-3">Tasting Traditions: A Culinary and Odyssey</h4>
                                        <p className="blog-details-para-color fs-5">Journey through culinary , blending heritage and innovation in every dish.</p>
                                        <a href="#" className="text-black blog-details-read-more">Read More <i
                                                className="fas fa-arrow-right"></i></a>

                                    </div>
                                </div>
                            </div>

                            <div className="blog-details-list-2 d-flex gap-4">
                                <div className="blog-details-list-1-div">
                                    <a href="#" className="blog-details-image-link mb-2">
                                    <img src="https://cdn.prod.website-files.com/6544bbda2afd28e6b968f038/65696adf7cb8e22f8498128e_blog-thumbnail-03.jpg"
                                        alt="" className="blog-details-list-img rounded-5 mb-3"/>
                                        </a>
                                    <div className="blog-details-list-para mb-4">
                                        <p className="blog-details-para-color">Fast Food<span className="mx-2 text-dark fs-5">|</span>April 2,
                                            2024</p>
                                        <h4 className="blog-details-para-text mb-3">Gastronomy Gazette: Discovering Flavours</h4>
                                        <p className="blog-details-para-color fs-5">Uncovering the essence of gastronomy with each insightful piece.</p>
                                        <a href="#" className="text-black blog-details-read-more">Read More <i
                                                className="fas fa-arrow-right"></i></a>

                                    </div>
                                </div>
                                <div className="blog-details-list-1-div-second">
                                    <a href="#" className="blog-details-image-link mb-2">
                                    <img src="https://cdn.prod.website-files.com/6544bbda2afd28e6b968f038/65696af06a1ea6c7b7c9ab43_blog-thumbnail-04.jpg"
                                        alt="" className="blog-details-list-img rounded-5 mb-3"/>
                                        </a>
                                    <div className="blog-details-list-para mb-4">
                                        <p className="blog-details-para-color">Fast Food <span className="mx-2 text-dark fs-5">|</span>April 2,
                                            2024</p>
                                        <h4 className="blog-details-para-text mb-3">The Culinary Canvas: Artistry on a Plate Buffet</h4>
                                        <p className="blog-details-para-color fs-5">Crafted with artistic precision, each plate a masterpiece of culinary ingenuity.</p>
                                        <a href="#" className="text-black blog-details-read-more">Read More <i
                                                className="fas fa-arrow-right"></i></a>

                                    </div>
                                </div>
                            </div>
                           
                            <div className="blog-details-list-3">
                                <div className="blog-details-list-1 d-flex gap-4">
                                    <div className="blog-details-list-1-div">
                                        <a href="#" className="blog-details-image-link mb-2">
                                        <img src="https://cdn.prod.website-files.com/6544bbda2afd28e6b968f038/65ded0b70edf47638960d147_blog-thumbnail-06.jpg"
                                            alt="" className="blog-details-list-img rounded-5 mb-3"/>
                                            </a>
                                        <div className="blog-details-list-para mb-4">
                                            <p className="blog-details-para-color">Fast Food <span
                                                    className="mx-2 text-dark fs-5">|</span>April 2, 2024</p>
                                            <h4 className="blog-details-para-text mb-3">Gourmet Gazette: Tasting Life's Delectable Moments</h4>
                                            <p className="blog-details-para-color fs-5">Narrating exquisite culinary experiences in each delectable moment.</p>
                                            <a href="#" className="text-black blog-details-read-more">Read More <i
                                                    className="fas fa-arrow-right hover"></i></a>

                                        </div>
                                    </div>
                                    <div className="blog-details-list-1-div-second">
                                        <a href="#" className="blog-details-image-link mb-2 ">
                                        <img src="https://cdn.prod.website-files.com/6544bbda2afd28e6b968f038/65696afc1c2bdf62d22517bd_blog-thumbnail-05.jpg"
                                            alt="" className="blog-details-list-img rounded-5 mb-3"/>
                                            </a>
                                        <div className="blog-details-list-para mb-4">
                                            <p className="blog-details-para-color">Dessert <span
                                                    className="mx-2 text-dark fs-5">|</span>April 2, 2024</p>
                                            <h4 className="blog-details-para-text mb-3">The Palate Pioneer: Navigating the World of Tastes</h4>
                                            <p className="blog-details-para-color fs-5">Insights and discoveries into a mosaic of tastes, textures, and cultural cuisines.</p>
                                            <a href="#" className="text-black blog-details-read-more">Read More <i
                                                    className="fas fa-arrow-right"></i></a>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className=" col-lg-4">
                    <div className="blog-details-right">
                        <div className="blog-details-categories bg-secondary-subtle p-5 mb-4 rounded-4 ">
                            <div className="blog-details-categories-main d-flex flex-column gap-4">
                                <h3 className="blog-details-para-text ">Categories</h3>
                                <div className="blog-details-categories-list d-flex flex-column gap-2">
                                    <h5 className="blog-details-categories-border pb-3">Dessert</h5>
                                    <h5 className="blog-details-categories-border pb-3">Recipes</h5>
                                    <h5 className="blog-details-categories-border pb-3">Fast Food</h5>
                                </div>
                            </div>
                        </div>

                        <div className="blog-details-trending-dishes bg-secondary-subtle p-5 rounded-4">
                            <div className="blog-details-trending-dishes-main d-flex flex-column gap-3">
                                <h3 className="blog-details-para-text">Trending Dishes</h3>
                                <div className="blog-details-trending-dishes-list">
                                    <div className="blog-details-dishes-div-2 d-flex gap-3 align-items-center mb-3">
                                        <a href="#" className="blog-details-dishes-image-link d-block rounded-4 overflow-hidden">
                                            <img src="https://cdn.prod.website-files.com/6544bbda2afd28e6b968f038/6583f7b5f31288d455bf5383_recipe-thumbnail-01-p-500.jpg"
                                                alt="Dish Image" className="blog-details-dishes-img w-100" />
                                        </a>
                                        <h5>
                                            Garlic Shrimp
                                            -
                                            ₹25
                                        </h5>
                                    </div>
                                    <div className="blog-details-border-dishes"></div>

                                    <div className="blog-details-dishes-div-2 d-flex gap-3 align-items-center mb-3">
                                        <a href="#" className="blog-details-dishes-image-link d-block rounded-4 overflow-hidden">
                                        <img src="https://cdn.prod.website-files.com/6544bbda2afd28e6b968f038/6583f7c4b3878d4f245d42b3_recipe-thumbnail-02-p-500.jpg"
                                            alt="" className="blog-details-dishes-img w-100" />
                                            </a>
                                        <h5>
                                            Green Medley
                                            -
                                            ₹25
                                        </h5>
                                    </div>
                                    <div className="blog-details-border-dishes"></div>
                                    <div className="blog-details-dishes-div-3 d-flex gap-3 align-items-center mb-3">
                                        <a href="#" className="blog-details-dishes-image-link d-block rounded-4 overflow-hidden">
                                        <img src="https://cdn.prod.website-files.com/6544bbda2afd28e6b968f038/6583f7d0621c1ed99b81eb3e_recipe-thumbnail-03-p-500.jpg"
                                            alt="" className="blog-details-dishes-img w-100" />
                                            </a>
                                        <h5>
                                            Golden Seafare
                                            -
                                            ₹25
                                        </h5>
                                    </div>
                                    <div className="blog-details-border-dishes"></div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Teams />
    <Footer/>
    </>
  )
}

export default BlogDeatils