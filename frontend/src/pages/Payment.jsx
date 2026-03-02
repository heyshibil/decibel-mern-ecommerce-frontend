import React, { useState, useEffect } from "react";
import { useWishlistCart } from "../context/WishlistCartContext";
import { useAppNavigation } from "../hooks/useAppNavigation";
import { showError } from "../utils/toastService";
import { useAuth } from "../context/AuthContext";
import {
  createRazorpayOrderApi,
  verifyPaymentApi,
} from "../services/orderService";
import { useOrders } from "../context/OrdersContext";

const Payment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Failure States
  const [isFailed, setIsFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [displayTotal, setDisplayTotal] = useState(0);
  const { total, cart, subTotal, gst, handleClearCart } = useWishlistCart();
  const { goCheckout, goOrders } = useAppNavigation();
  const { user } = useAuth();
  const { refreshOrders } = useOrders();

  const storedData = JSON.parse(localStorage.getItem(`addressOf${user._id}`));

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

  // handle razor payment
  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setIsFailed(false);

      // Create Razorpay order on backend
      const razorpayData = await createRazorpayOrderApi(total);

      // Open Razorpay checkout modal
      const options = {
        key: razorpayData.key,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        name: "DECIBEL Audio",
        description: "Purchase Audio Equipment",
        order_id: razorpayData.orderId,
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: phone,
        },
        theme: {
          color: "#000000",
        },
        // called payment is SUCCESSFUL
        handler: async (response) => {
          try {
            // Step 3: Verify signature + create order on backend
            const savedOrder = await verifyPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cart,
              amount: { subTotal, gst, total },
              address: storedData,
            });

            // refreshing orders
            await refreshOrders();

            setDisplayTotal(total);
            await handleClearCart();
            setIsSuccess(true);
          } catch (verifyError) {
            setIsFailed(true);
            setErrorMessage("Payment verification failed. Contact support.");
          }
        },
        // called when user closes the modal
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setIsFailed(false);
          },
        },
      };
      const rzp = new window.Razorpay(options);
      // called when payment FAILS
      rzp.on("payment.failed", (response) => {
        setIsFailed(true);
        setErrorMessage(response.error.description || "Payment failed.");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      setIsFailed(true);
      setErrorMessage(
        error?.response?.data?.message || "Failed to initiate payment.",
      );
      setIsProcessing(false);
    }
  };

  // Reset function for the Retry button
  const handleRetry = () => {
    setIsFailed(false);
    setErrorMessage("");
  };

  return (
    <>
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
                disabled={isProcessing || isSuccess}
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

          {/* Amount Section */}
          <div className="mb-8 border-b pb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{displayTotal || total}
              </span>
            </div>
          </div>

          {/* DYNAMIC PAYMENT UI SECTION */}
          {isSuccess ? (
            /* --- SUCCESS UI --- */
            <div className="mb-4 transform transition-all duration-700 ease-out scale-100 shadow-2xl">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-8 flex flex-col items-center animate-in fade-in zoom-in duration-700">
                <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-green-500 rounded-full p-4 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-white"
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
                <h3 className="text-2xl font-bold text-green-600 mb-2 text-center">
                  Payment Successful!
                </h3>
                <p className="text-center text-gray-600 mb-4">
                  Your payment of{" "}
                  <span className="font-bold text-green-600">
                    ₹{displayTotal}
                  </span>{" "}
                  has been processed.
                </p>
                <button
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
                  onClick={() => goOrders(user._id)}
                >
                  View Orders
                </button>
              </div>
            </div>
          ) : isFailed ? (
            /* --- FAILED UI (NEW) --- */
            <div className="mb-4 transform transition-all duration-700 ease-out scale-100 shadow-lg">
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-lg p-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                  <div className="absolute inset-0 bg-red-200 rounded-full animate-pulse opacity-75"></div>
                  <div className="relative bg-red-500 rounded-full p-4 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-red-600 mb-2 text-center">
                  Payment Failed
                </h3>
                <p className="text-center text-gray-600 mb-6">{errorMessage}</p>
                <button
                  className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300"
                  onClick={handleRetry}
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`mb-4 transform transition-all duration-500 ease-out ${isProcessing ? "scale-105 shadow-2xl" : "scale-100 shadow-md"}`}
            >
              <div
                className={`bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center transition-all duration-500 ${isProcessing ? "bg-blue-50 border-blue-300" : ""}`}
              >
                <img
                  src="https://razorpay.com/favicon.png"
                  alt="Razorpay"
                  className={`mb-2 transition-all duration-500 ${isProcessing ? "w-16 h-16 animate-pulse" : "w-12 h-12"}`}
                />
                <p className="text-lg font-semibold mb-2">
                  Pay securely with Razorpay
                </p>
                <button
                  className={`w-full mt-4 py-3 rounded-lg font-semibold transition-all duration-500 ${
                    isProcessing
                      ? "bg-blue-400 text-white cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
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
          )}
        </div>
      </div>
    </>
  );
};

export default Payment;
