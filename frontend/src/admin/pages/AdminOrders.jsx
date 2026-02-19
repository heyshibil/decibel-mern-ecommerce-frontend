import React, { useEffect, useMemo, useState } from "react";
import StatusDropdown from "../components/StatusDropdown";
import { useAdminStats } from "../context/AdminStatsContext";
import api from "../../services/api";
import { showError, showSuccess } from "../../utils/toastService";
import { mirage } from "ldrs";

mirage.register();

const AdminOrders = () => {
  const { stats, refreshStats, loading } = useAdminStats();
  const [ordersList, setOrdersList] = useState(stats.orders || []);
  const [searchQuery, setSearchQuery] = useState("");

  // filteringOrderdes according to searchTerm
  const filteredOrders = useMemo(() => {
    return ordersList
      .filter((order) =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [ordersList, searchQuery]);

  // setting orders to state
  useEffect(() => {
    if (stats.orders) {
      setOrdersList(stats.orders);
    }
  }, [stats.orders]);

  // handle status
  const handleStatusChange = async (newStatus, orderId) => {
    try {
      const response = await api.patch(`/orders/${orderId}`, {
        status: newStatus,
      });

      if (response.status === 200) {
        refreshStats();
        showSuccess(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      showError("Failed to update status");
      console.error("Failed to update order status:", error);
    }
  };

  // date formatter
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <l-mirage size="60" speed="2.5" color="black"></l-mirage>
      </div>
    );
  }

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Orders</h1>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search Order ID"
            className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Orders ({ordersList.length})
        </h2>

        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2 w-[14%]">Order ID</th>
              <th className="py-2 w-[21%]">Products</th>
              <th className="py-2 w-[11%]">Total</th>
              <th className="py-2 w-[35%]">Address</th>
              <th className="py-2 w-[12%]">Date</th>
              <th className="py-2 w-[16%]">Status</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {filteredOrders
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((order) => {
                return (
                  <tr key={order._id} className="border-b">
                    <td className="py-3 font-medium">#{order.orderId}</td>

                    <td className="py-3 text-sm text-gray-500">
                      {(() => {
                        const names = order.items.map((item) => item.name);

                        if (names.length === 1) {
                          return names[0];
                        }

                        return `${names[0]} + ${names.length - 1} more`;
                      })()}
                    </td>

                    <td className="py-3 font-medium">₹{order.amount.total}</td>

                    <td className="py-3 max-w-xs truncate">
                      {order.address.firstName + " " + order.address.lastName}
                      <br />
                      {order.address.address}
                      <br />
                      {order.address.country}
                    </td>

                    <td className="py-3">{formatDate(order.createdAt)}</td>

                    <td className="py-3">
                      <StatusDropdown
                        value={order.orderStatus}
                        onChange={(newStatus) =>
                          handleStatusChange(newStatus, order._id)
                        }
                      />
                    </td>
                  </tr>
                );
              })}

            {ordersList.length === 0 && (
              <tr>
                <td colSpan="7" className="py-6 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
