import React, { useEffect, useState } from "react";
import { HiMiniArrowLongRight } from "react-icons/hi2";
import Card from "./card";
import SubHead from "./SubHead";
import { useAppNavigation } from "../hooks/useAppNavigation";
import { useProducts } from "../context/ProductContext"

const Bestsellers = () => {

  // custom hook to navigate
  const {goProducts} = useAppNavigation();

  const { bestsellers } = useProducts();

  return (
    <div id="bestseller-sec">
      <div className="flex w-full items-center justify-between">
        <SubHead head="Bestsellers" sub="Our Most Loved Sounds" />

        <button onClick={goProducts} className="flex items-center justify-between w-[160px] px-6 py-2 rounded-full border-2 text-gray-700 border-gray-300 font-medium">View all
          <HiMiniArrowLongRight className="text-2xl" />
        </button>
      </div>

      <div id="product-grid" className="mt-6 lg:mt-12 grid grid-cols-1 lg:grid-cols-4 gap-6 w-[1fr, 1fr, 1fr, 1fr]">
        {
          bestsellers.map((product) => {
            return (<Card key={product._id} id={product.id} productName={product.productName} type={product.type} price={product.price} img={product.image} />)
          })
        }
        
        
      </div>
    </div>
  );
};

export default Bestsellers;
