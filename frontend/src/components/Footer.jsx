import React from "react";
import { FaInstagram } from "react-icons/fa6";
import { PiXLogoBold } from "react-icons/pi";
import { FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  const date = new Date();
  const year = date.getFullYear();

  return (
    <footer className="bg-white text-gray-700 py-8 md:py-12 px-6 mt-12 md:mt-20 border-t border-gray-200">
  <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">

    {/* Brand */}
    <div className="col-span-2 md:col-span-1 md:text-left text-center">
      <h2 className="text-gray-900 font-extrabold text-3xl tracking-tight mb-4 cursor-pointer">
        DECIBEL.
      </h2>
      <p className="text-gray-500 leading-relaxed text-sm md:text-base">
        Experience audio the way it’s meant to be heard. Premium headphones, TWS, and speakers designed for clarity and comfort.
      </p>
    </div>

    {/* Shop */}
    <div className="md:text-left text-center">
      <h3 className="text-gray-900 font-semibold text-lg mb-4">Shop</h3>
      <ul className="space-y-2 text-sm md:text-base">
        <li className="hover:text-gray-900 cursor-pointer">Headphones</li>
        <li className="hover:text-gray-900 cursor-pointer">TWS</li>
        <li className="hover:text-gray-900 cursor-pointer">Speakers</li>
        <li className="hover:text-gray-900 cursor-pointer">Bestsellers</li>
      </ul>
    </div>

    {/* Support */}
    <div className="md:text-left text-center">
      <h3 className="text-gray-900 font-semibold text-lg mb-4">Support</h3>
      <ul className="space-y-2 text-sm md:text-base">
        <li className="hover:text-gray-900 cursor-pointer">Order Tracking</li>
        <li className="hover:text-gray-900 cursor-pointer">Warranty & Service</li>
        <li className="hover:text-gray-900 cursor-pointer">Refund Policy</li>
        <li className="hover:text-gray-900 cursor-pointer">Contact Us</li>
      </ul>
    </div>

    {/* Social */}
    <div className="col-span-2 md:col-span-1 md:text-left text-center">
      <h3 className="text-gray-900 font-semibold text-lg mb-4">Connect</h3>
      <div className="flex items-center justify-center md:justify-start gap-6 text-2xl text-gray-700">
        <FaInstagram className="cursor-pointer hover:text-gray-900" />
        <PiXLogoBold className="cursor-pointer hover:text-gray-900" />
        <FaLinkedinIn className="cursor-pointer hover:text-gray-900" />
      </div>
    </div>
  </div>

  {/* Bottom Bar */}
  <div className="border-t border-gray-200 mt-8 md:mt-12 pt-6 text-sm flex flex-col md:flex-row justify-between items-center text-center">
    <p>&copy; {new Date().getFullYear()} Decibel. All rights reserved.</p>
    <div className="flex gap-6 mt-4 md:mt-0 justify-center">
      <p className="cursor-pointer hover:text-gray-900">Privacy Policy</p>
      <p className="cursor-pointer hover:text-gray-900">Terms of Service</p>
    </div>
  </div>
</footer>

  );
};

export default Footer;
