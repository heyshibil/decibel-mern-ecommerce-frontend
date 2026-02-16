import express from "express";
import {
  getAllUsers,
  loginUser,
  logoutUser,
  registerUser,
  toggleUserBlock,
  updateUserProfile,
} from "../controllers/userController.js";
import { limiter } from "../middlewares/rateLimiter.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", protect, admin, getAllUsers);
router.post("/register", registerUser);
router.post("/login", limiter, loginUser);
router.post("/logout", logoutUser);
router.patch("/profile", protect, updateUserProfile);

//admin routes
router.patch("/block/:id", admin, protect, toggleUserBlock);

export default router;
