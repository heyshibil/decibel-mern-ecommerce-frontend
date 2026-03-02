import express from "express";
import {
  cancelOrder,
  createOrder,
  createRazorpayOrder,
  getAllOrders,
  getOrders,
  updateOrder,
  verifyAndCreateOrder,
} from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router
  .get("/all", protect, admin, getAllOrders)
  .get("/", protect, getOrders)
  .post("/", protect, createOrder)
  .patch("/cancel/:id", protect, cancelOrder)
  .post("/create-razorpay-order", protect, createRazorpayOrder)
  .post("/verify-payment", protect, verifyAndCreateOrder);

// admin routes
router.patch("/:id", protect, admin, updateOrder);

export default router;
