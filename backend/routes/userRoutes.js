import express from "express";
import {
  getAllUsers,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  toggleUserBlock,
  updateUserProfile,
  verifyEmail,
} from "../controllers/userController.js";
import { limiter } from "../middlewares/rateLimiter.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router
  .get("/", protect, admin, getAllUsers)
  .post("/register", registerUser)
  .post("/login", limiter, loginUser)
  .post("/logout", logoutUser)
  .patch("/profile", protect, updateUserProfile)
  .post("/verify-otp", verifyEmail)
  .get("/refresh", refreshAccessToken);

//admin routes
router.patch("/block/:id", protect, admin, toggleUserBlock);

export default router;
