import api from "./api";

export const getOrdersApi = async () => {
  const { data } = await api.get("/orders");
  return data;
};

export const createOrderApi = async (orderData) => {
  const { data } = await api.post("/orders", orderData);
  return data;
};

export const createRazorpayOrderApi = async (amount) => {
  const { data } = await api.post("/orders/create-razorpay-order", { amount });
  return data;
};

export const verifyPaymentApi = async (paymentData) => {
  const { data } = await api.post("/orders/verify-payment", paymentData);
  return data;
};
