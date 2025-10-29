// src/components/public/Hero.js
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = ({ title, subtitle, ctaText, ctaLink }) => {
  return (
    <section className="bg-blue-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">{subtitle}</p>
        {ctaText && ctaLink && (
          <Link 
            to={ctaLink} 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </section>
  );
};

export default Hero;