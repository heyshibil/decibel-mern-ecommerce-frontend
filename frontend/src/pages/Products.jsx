import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import SubHead from "../components/SubHead";
import { useProducts } from "../context/ProductContext";
import Header from "../components/Header";
import { IoFilter } from "react-icons/io5";
import { useSearch } from "../context/SearchContext";
import { MdOutlineSearchOff } from "react-icons/md";
import api from "../services/api";
import Card from "../components/Card";

const Products = () => {
  const { products, loading } = useProducts();
  const { searchTerm, results, setResults } = useSearch();
  const [filter, setFilter] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    // fetch products if any searchterm
    const fetchLocalProducts = async () => {
      try {
        const response = await api.get(`/products?q=${searchTerm}`);
        setResults(response.data);
      } catch (error) {
        console.error("Error while fetching searched items", error);
      }
    };

    fetchLocalProducts();
  }, [searchTerm]);

  // toggle filter menu
  const toggleFilterMenu = () => {
    document.getElementById("filter").classList.toggle("hidden");
  };

  const finalProducts = searchTerm.trim() ? results : products;

  // update sorted products according to final products
  useEffect(() => {
    if (isFiltering) return;

    setFilter(finalProducts);
  }, [finalProducts, isFiltering]);

  // filter actions
  const handleFilter = (filterType) => {
    setIsFiltering(true);

    let filtered = [...finalProducts];

    switch (filterType) {
      case "lowToHigh":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "highToLow":
        filtered.sort((a,b) => b.price - a.price);
        break;
      case "bestsellers":
        filtered = filtered.filter(item => item.status === "Bestseller");
        break;
      case "flagships":
        filtered = filtered.filter(item => item.status === "Flagship");
        break;
      case "budgets":
        filtered = filtered.filter(item => item.status === "Budget");
        break;
      default : return filtered;
    }

    setFilter(filtered);
    document.getElementById("filter").classList.add("hidden");
  };

  // loading
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <l-mirage size="60" speed="2.5" color="black"></l-mirage>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen lg:pt-24 pb-12 lg:pb-24">
      <Header />
      <div className="w-11/12 mx-auto pt-6 lg:pt-12">
        <div className="w-full flex justify-between items-center">
          <div className="w-fit">
            <SubHead head="All Products" />
            <div className="bg-brand h-[1.5px]" />
          </div>

          <div
            id="filter-menu"
            className="relative hover:bg-gray-100 px-4 py-2 flex items-center gap-4 justify-between rounded-xl transition ease-in-out duration-300 cursor-pointer"
            onClick={toggleFilterMenu}
          >
            <p className="hh1 text-lg font-medium">Filter</p>
            <IoFilter className="text-lg" />

            {/* filter dropdown */}
            <div
              id="filter"
              className="hidden absolute w-[180%] bg-white top-14 right-0 rounded-xl border border-gray-300 shadow-md z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="w-full flex flex-col">
                <li
                  className="w-full flex px-3 justify-center items-center gap-6 h-10 font-medium text-gray-700 hover:bg-gray-100 cursor-pointer rounded-t-xl"
                  onClick={() => handleFilter("lowToHigh")}
                >
                  Price: Low to High
                </li>
                <div className="h-[1px] bg-gray-200"></div>
                <li
                  className="w-full flex px-3 justify-center items-center gap-6 h-10 font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleFilter("highToLow")}
                >
                  Price: High to Low
                </li>
                <div className="h-[1px] bg-gray-200"></div>
                <li
                  className="w-full flex px-3 justify-center items-center gap-6 h-10 font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleFilter("bestsellers")}
                >
                  Bestsellers
                </li>
                <div className="h-[1px] bg-gray-200"></div>
                <li
                  className="w-full flex px-3 justify-center items-center gap-6 h-10 font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleFilter("flagships")}
                >
                  Flagships
                </li>
                <div className="h-[1px] bg-gray-200"></div>
                <li
                  className="w-full flex px-3 justify-center items-center gap-6 h-10 font-medium text-gray-700 hover:bg-gray-100 cursor-pointer rounded-b-xl"
                  onClick={() => handleFilter("budgets")}
                >
                  Budgets
                </li>
              </ul>
            </div>
          </div>
        </div>

        {filter.length === 0 ? (
          <div className="w-full h-[500px] flex flex-col items-center justify-center gap-6 mt-12">
            <MdOutlineSearchOff className="text-7xl text-gray-300" />
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                No Products Found
              </h3>
              <p className="text-gray-500 text-lg">
                {searchTerm.trim()
                  ? `No products match your search for "${searchTerm}"`
                  : "No products available at the moment"}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 lg:mt-12 grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-10 w-[1fr, 1fr, 1fr, 1fr]">
            {filter.map((product) => {
              return (
                <Card
                  key={product._id}
                  _id={product._id}
                  productName={product.productName}
                  type={product.type}
                  price={product.price}
                  img={product.image}
                />
              );
            })}
          </div>
        )}

        {/* <div className="w-full mx-auto pt-12 lg:pt-24">
          <Footer />
        </div> */}
      </div>
    </div>  
  );
};

export default Products;
