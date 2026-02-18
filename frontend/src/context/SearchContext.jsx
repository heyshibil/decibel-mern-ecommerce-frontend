import React, { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <SearchContext.Provider
      value={{ searchTerm, results, setSearchTerm, setResults, clearSearch }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
