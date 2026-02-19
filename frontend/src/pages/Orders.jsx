import React, { useState } from "react";
import Header from "../components/Header";
import SubHead from "../components/SubHead";
import Footer from "../components/Footer";
import EmptyMessage from "../components/EmptyMessage";
import { useOrders } from "../context/OrdersContext";
import AlertMessage from "../components/AlertMessage";
import { getImagePath } from "../utils/getImage";
import { mirage } from "ldrs";

mirage.register();

const Orders = () => {
  const { orders, cancelOrder, loading } = useOrders();

  const [showAlert, setShowAlert] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const handleCancelOrder = (orderId) => {
    setShowAlert(true);
    setOrderId(orderId);
  };

  const confirmCancelOrder = () => {
    cancelOrder(orderId);
    setShowAlert(false);
    setOrderId(null);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <l-mirage size="60" speed="2.5" color="black"></l-mirage>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full lg:pt-24 pb-12 lg:pb-24 bg-gray-50">
      <Header />

      {showAlert && (
        <AlertMessage
          isClose={() => setShowAlert(false)}
          onCancel={confirmCancelOrder}
        />
      )}

      <div className="w-11/12 mx-auto pt-6 lg:pt-12">
        <div className="w-full flex justify-between items-center mb-8">
          <div className="w-fit">
            <SubHead head="My Orders" />
            <div className="bg-brand h-[1.5px]" />
          </div>
        </div>

        {orders.length === 0 && <EmptyMessage messageType="Orders" />}

        <div
          className={
            orders.length > 0 ? "mt-6 lg:mt-12 flex flex-col gap-4" : "hidden"
          }
        >
          {orders.map((order) => {
            return (
              <div
                key={order._id}
                className="bg-white border-2 border-gray-200/70 rounded-xl p-6 flex flex-col lg:flex-row justify-between gap-6"
              >
                {/* Left Section - Order Details */}
                <div className="flex gap-6 items-start flex-1">
                  {/* Product Images */}
                  <div className="flex gap-2">
                    {order.items.map((it) => (
                      <div
                        key={it._id}
                        className="h-24 w-24 rounded-lg overflow-hidden"
                      >
                        <img
                          src={getImagePath(it?.image)}
                          alt={it.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Order Info */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold">#{order.orderId}</h3>
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                    <p className="text-sm text-gray-600">
                      Items: {order.items.length}
                    </p>
                  </div>
                </div>

                {/* Right Section - Amount & Actions */}
                <div className="flex flex-col items-end gap-4 justify-between">
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xl font-semibold text-blue-500">
                      ₹{order.amount.total}
                    </p>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        order.orderStatus === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.orderStatus === "Shipped"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.orderStatus === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <div
                    className={`${
                      order.orderStatus === "Cancelled" ||
                      order.orderStatus === "Delivered"
                        ? "hidden"
                        : "flex gap-3"
                    }`}
                  >
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-500/85 transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* <div className="w-full mx-auto pt-12 lg:pt-24">
          <Footer />
        </div> */}
      </div>
    </div>
  );
};

export default Orders;
