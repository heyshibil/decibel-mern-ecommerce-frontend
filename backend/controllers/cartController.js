import { User } from "../models/User.js";

// Get cart
export const getCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate("cart.product");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user.cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// Add to cart
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user._id;

  try {
    const existingUser = await User.findOne({
      _id: userId,
      "cart.product": productId,
    });

    if (existingUser) {
      // 409 Conflict ~ "Already exists"
      return res.status(409).json({ message: "Product already in cart" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { cart: { product: productId, quantity } } },
      { new: true },
    ).populate("cart.product");

    return res.status(201).json(user.cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to add to cart" });
  }
};

// Update cart
export const updateCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  if (quantity < 1) {
    return res
      .status(400)
      .json({ message: "Quantity must be at least 1. Remove item instead." });
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: userId, "cart.product": productId },
      { $set: { "cart.$.quantity": quantity } },
      { new: true },
    ).populate("cart.product");

    if (!user)
      return res.status(404).json({ message: "Product not found in cart" });

    return res.status(200).json(user.cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update quantity" });
  }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { cart: { product: productId } } },
      { new: true },
    ).populate("cart.product");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user.cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to remove item" });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { cart: [] } },
      { new: true },
    );
    return res.status(200).json(user.cart);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to clear cart" });
  }
};
