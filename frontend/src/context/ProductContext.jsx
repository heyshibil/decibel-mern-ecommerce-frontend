import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [bestsellers, setBestsellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const { data: products } = await api.get("/products");
        const bestProducts = products.filter(product => product.status === "Bestseller").slice(4);

        setProducts(products);
        setBestsellers(bestProducts);
      } catch (err) {
        console.error("Error while loading datas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <ProductContext.Provider value={{ bestsellers, products, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

// created a custom hook to use this context easily
export const useProducts = () => useContext(ProductContext);
