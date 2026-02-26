import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import { showError, showSuccess } from "../utils/toastService";
import { createOrderApi, getOrdersApi } from "../services/orderService";
const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // load orders from db
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrdersApi();
        setOrders(data);
      } catch (error) {
        showError(
          error?.response?.data?.message ||
            "Server is unreachable. Try again later",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // create new order
  const createNewOrder = async (orderData) => {
    try {
      setLoading(true);
      const newOrder = await createOrderApi(orderData);

      // update new order on the top
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    } catch (error) {
      showError(error?.response?.data?.message || "Payment processing failed");

      // throw error to stop processing
      throw error;
    } finally {
      setLoading(false);
    }
  };

  //cancel order
  const cancelOrder = async (orderId) => {
    try {
      const response = await api.patch(`/orders/cancel/${orderId}`);

      if (response.status === 200) {
        const updatedOrder = response.data;

        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? updatedOrder : order)),
        );
      }

      showSuccess(`Order with id ${orderId} has been cancelled`);
    } catch (error) {
      console.error("Failed to cancel:", error);
      showError(`Failed to cancel order with ${orderId}`);
    }
  };

  return (
    <OrderContext.Provider
      value={{ orders, createNewOrder, cancelOrder, loading }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
