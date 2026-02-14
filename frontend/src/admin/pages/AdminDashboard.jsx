import React, { useEffect } from "react";
import { FiUsers, FiShoppingBag, FiBox } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { useAdminStats } from "../context/AdminStatsContext";
import ChartSection from "../components/ChartSection";

const AdminDashboard = () => {
  const { stats } = useAdminStats();
  const { users, orders, totalUsers, totalProducts, totalOrders, revenue } = stats;

  const colorStatus = {
    Processing : "text-gray-400",
    Shipped : "text-amber-500",
    Delivered : "text-green-500",
  }

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      {/* Top Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {totalUsers}
              </h2>
            </div>
            <FiUsers size={32} className="text-indigo-600" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {totalOrders}
              </h2>
            </div>
            <FiShoppingBag size={32} className="text-green-600" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Products</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {totalProducts}
              </h2>
            </div>
            <FiBox size={32} className="text-orange-500" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Revenue</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {revenue}
              </h2>
            </div>
            <FaRupeeSign size={32} className="text-blue-600" />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white mt-8 p-6 border rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Orders
        </h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2">Order ID</th>
              <th className="py-2">User</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {orders.map((order) => {

              return (
                <tr key={order._id} className="border-b">
                  <td className="py-3">#{order.orderId}</td>
                  <td className="py-3">{order.address.email ?? "Unknown"}</td>
                  <td className="py-3">₹{order.amount.total}</td>
                  <td className={`py-3 ${colorStatus[order.orderStatus]} font-medium`}>
                    {order.orderStatus}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Chart section */}
      <ChartSection />
    </div>
  );
};

export default AdminDashboard;
