import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
} from "../controllers/productController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/adminMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", protect, admin, upload.single("image"), createProduct);

// admin routes

export default router;
