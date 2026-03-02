import { Order } from "../models/Order.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

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

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
      return res.status(400).json({
        message: `Cannot cancel an order that is already ${order.status}`,
      });
    }

    // cancel order
    order.orderStatus = "Cancelled";
    const updatedOrder = await order.save();

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Cancellation failed", error: error.message });
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

// Create razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // razorpay expects paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_API_KEY, // sent to frontend to open modal
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return res.status(500).json({ message: "Failed to create payment order" });
  }
};

// Verify payment and create order
export const verifyAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      amount,
      address,
    } = req.body;

    // Verify HMAC signature to prevent fraud
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Payment verification failed. Invalid signature." });
    }

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
      paymentInfo: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "Paid",
        paidAt: new Date(),
      },
    });

    const savedOrder = await newOrder.save();

    return res.json(savedOrder);
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res
      .status(500)
      .json({ message: "Order creation failed after payment" });
  }
};
