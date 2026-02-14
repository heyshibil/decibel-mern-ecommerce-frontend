import api from "./api";

// Get cart
export const getCartApi = async () => {
  const { data } = await api.get("/cart");
  return data;
};

// Add to cart
export const addToCartApi = async (productId, quantity = 1) => {
  const { data } = await api.post("/cart/add", { productId, quantity });
  return data; //cart[]
};

// Update cart
export const updateCartApi = async (productId, quantity) => {
  const { data } = await api.patch("/cart/update", { productId, quantity });
  return data;
};

// Remove from cart
export const removeFromCartApi = async (productId) => {
  const { data } = await api.delete(`/cart/remove/${productId}`);
  return data;
};

// clear cart
export const clearCart = async () => {
  const { data } = await api.patch("/cart/clear");
  return data;
};
