
import React from 'react';
import './Blog.css'; // Import CSS for styling

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
      <button className="view-more-btn">View More</button> 
    </section>
  );
};

export default Blog;
