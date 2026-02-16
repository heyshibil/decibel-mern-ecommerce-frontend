import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrders,
  updateOrder,
} from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/all", protect, admin, getAllOrders);
router.get("/", protect, getOrders);
router.post("/", protect, createOrder);

// admin routes
router.patch("/:id", protect, admin, updateOrder);

export default router;
