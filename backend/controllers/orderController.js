import { Order } from "../models/Order.js";

// Get order
export const getOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    // if orders empty
    if (!orders || orders.length === 0) return res.status(200).json([]);

    return res.status(200).json(orders);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Order fetching failed", error: error.message });
  }
};

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { items, amount, address, upiId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    //generate custom orderId
    const generatedOrderId = `ORD-${Date.now().toString().slice(-3)}${Math.random().toString(36).toUpperCase().slice(-3)}`;

    const orderItems = items.map((item) => ({
      product: item.product._id,
      name: item.product.productName,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    }));

    const newOrder = new Order({
      orderId: generatedOrderId,
      userId: req.user._id,
      items: orderItems,
      amount,
      address,
      paymentInfo: { upiId },
    });

    const savedOrder = await newOrder.save();

    return res.status(201).json(savedOrder);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Order creation failed", error: error.message });
  }
};

// Get allOrders **admin**
export const getAllOrders = async (req, res) => {
  try {
    const allOrders = await Order.find({})
      .populate("items.product")
      .sort({ createdAt: -1 });

    if (!allOrders || allOrders.length === 0) return res.status(200).json([]);

    return res.status(200).json(allOrders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

// Update order **admin**
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true, runValidators: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order.orderStatus);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to update order", error: error.message });
  }
};
