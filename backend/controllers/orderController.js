import { Order } from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const { items, amount, address, upiId } = req.body;

    //generate custom orderId
    const generatedOrderId = `ORD-${Date.now().toString().slice(-6)}${Math.random().toString(36).toUpperCase().slice(-3)}`;

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
    return res.status(500).json({ message: "Order creation failed", error: error.message });
  }
};
