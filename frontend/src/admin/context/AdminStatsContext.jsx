import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../../services/api";

const AdminStatsContext = createContext();

export const AdminStatsProvider = ({ children }) => {
  const [stats, setStats] = useState({
    users: [],
    orders: [],
    products: [],
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [userRes, productsRes, ordersRes] = await Promise.all([
          api.get("/users"),
          api.get("/products"),
          api.get("/orders/all"),
        ]);

        const userData = userRes.data || [];
        const productsData = productsRes.data || [];
        const ordersData = ordersRes.data || [];

        const revenue = ordersData.reduce((sum, item) => sum + item.amount?.total, 0)


        setStats({
          users: userData,
          orders: ordersData,
          products: productsData,
          totalUsers: userData.length,
          totalProducts: productsData.length,
          totalOrders: ordersData.length,
          revenue: revenue.toFixed(2),
        });
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      }
      finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <AdminStatsContext.Provider value={{ stats, setStats }}>
      {children}
    </AdminStatsContext.Provider>
  );
};

export const useAdminStats = () => useContext(AdminStatsContext);
