import React, { useState, useEffect } from "react";
import { useWishlistCart } from "../context/WishlistCartContext";
import { useAppNavigation } from "../hooks/useAppNavigation";
import { showError } from "../utils/toastService";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrdersContext";

const Payment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [displayTotal, setDisplayTotal] = useState(0);
  const { total, cart, subTotal, gst, handleClearCart } = useWishlistCart();
  const [upi, setUPI] = useState("");
  const { goCheckout, goOrders } = useAppNavigation();
  const { createNewOrder } = useOrders();
  const { user } = useAuth();

  const storedData = JSON.parse(localStorage.getItem(`addressOf${user._id}`));

  // destructuring storedData
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    country,
    city,
    state,
    postalCode,
  } = storedData;

  const handlePayment = async () => {
    const upiRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$/;
    if (upi === "") {
      showError("Enter your UPI ID");
      return;
    }

    if (!upiRegex.test(upi)) {
      showError("Enter a valid UPI ID");
      return;
    }

    try {
      setIsProcessing(true);

      // creating new order
      const orderData = {
        items: cart,
        amount: {
          subTotal,
          gst,
          total,
        },
        address: storedData,
        upiId: upi,
      };

      const data = await createNewOrder(orderData);
      
      // Store total before clearing the cart
      setDisplayTotal(total);
      await handleClearCart();
      
      // Set success only after successful order creation
      setIsSuccess(true);
    } catch (error) {
      console.error("Payment error:", error);
      showError(
        error?.response?.data?.message ||
          "Payment processing failed. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16 pb-12">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Payment</h2>

        {/* Address Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Shipping Address</h3>
            <button
              onClick={goCheckout}
              className="text-gray-500 hover:underline font-medium text-sm"
            >
              Edit
            </button>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-sm">
            <p>
              {firstName} {lastName}
            </p>
            <p>
              {email} | {phone}
            </p>
            <p>{address}</p>
            <p>
              {city}, {state} - {postalCode}
            </p>
            <p>{country}</p>
          </div>
        </div>

        {/* UPI ID Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UPI ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your UPI ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setUPI(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1 ml-3">
              eg: name@okhdfcbank
            </p>
          </div>
        </div>

        {/* Amount Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-2xl font-bold text-blue-600">₹{displayTotal || total}</span>
          </div>
        </div>

        {/* Mock Razorpay Section */}
        {!isSuccess ? (
          <div
            className={`mb-4 transform transition-all duration-500 ease-out ${
              isProcessing ? "scale-105 shadow-2xl" : "scale-100 shadow-md"
            }`}
          >
            <div
              className={`bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center transition-all duration-500 ${
                isProcessing ? "bg-blue-50 border-blue-300" : ""
              }`}
            >
              <img
                src="https://razorpay.com/favicon.png"
                alt="Razorpay"
                className={`mb-2 transition-all duration-500 ${
                  isProcessing ? "w-16 h-16 animate-pulse" : "w-12 h-12"
                }`}
              />
              <p className="text-lg font-semibold mb-2">
                Pay securely with Razorpay
              </p>
              <button
                className={`w-full mt-4 py-3 rounded-lg font-semibold transition-all duration-500 ${
                  isProcessing
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                type="button"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${total}`
                )}
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`mb-4 transform transition-all duration-700 ease-out scale-100 shadow-2xl`}
          >
            <div
              className={`bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-8 flex flex-col items-center animate-in fade-in zoom-in duration-700`}
            >
              <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-green-500 rounded-full p-4 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                Payment Successful!
              </h3>
              <p className="text-center text-gray-600 mb-4">
                Your payment of
                <span className="font-bold text-green-600"> ₹{displayTotal}</span> has
                been processed successfully.
              </p>
              <button
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
                type="button"
                onClick={() => goOrders(user._id)}
              >
                View Orders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
