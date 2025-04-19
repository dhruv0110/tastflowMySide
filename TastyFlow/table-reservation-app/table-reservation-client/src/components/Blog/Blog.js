
import React from 'react';
import './Blog.css'; // Import CSS for styling
import {Link} from "react-router-dom"; // Import Link for navigation

const Blog = () => {
  return (
    <section className="blog-container">
      <div className="blog-content">
        <p className="blog-tag">Blog</p>
        <h1 className="blog-title">Latest Posts</h1>
        <p className="blog-description">
        Stay ahead of the curve, explore new ideas, and engage with the pulse of evolving trends through our repository of timely and insightful content.
        </p>
      </div>
      <Link to='/BlogDetails'>
      <button className="view-more-btn m-5">View More</button> 
      </Link>
    </section>
  );
};

export default Blog;
