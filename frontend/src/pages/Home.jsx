import React from "react";
import Header from "../components/Header";
import HomeGrid from "../components/HomeGrid"
import Bestsellers from "../components/Bestsellers";
import Features from "../components/Features";
import Footer from "../components/Footer";
import ProductGrid from "../components/ProductGrid";
import TestimonialGrid from "../components/TestimonialGrid"
import Tailer from "../components/Tailer";

const Home = () => {
  return (
    <div id="container" className="relative w-full">
      <div className="bg-gradient-to-br from-lime-900/10 via-amber-700/10 to-lime-200/20 lg:pb-8">
        <Header />
        <div className="w-11/12 mx-auto pt-24 lg:pt-32">
          <HomeGrid />
        </div>
      </div>

      <div className="w-11/12 mx-auto pt-12 lg:pt-24">
        <Bestsellers />
      </div>

      <div className="w-11/12 mx-auto pt-12 lg:pt-24">
        <Features />
      </div>

      <div className="w-11/12 mx-auto pt-12 lg:pt-24">
        <ProductGrid />
      </div>

      <div className="w-11/12 mx-auto pt-12 lg:pt-24">
        <TestimonialGrid />
      </div>
      

      {/* <div className="w-full mx-auto pt-12 lg:pt-24">
        <About />
      </div> */}

      <div className="w-11/12 mx-auto lg:mt-10 pt-12 lg:pt-24">
        <Tailer />
      </div>

      <div className="w-11/12 mx-auto pt-12 lg:pt-24">
        <Footer />
      </div>

      
      {/* <div className="h-[2000px]"></div> */}
    </div>
  );
};

export default Home;
