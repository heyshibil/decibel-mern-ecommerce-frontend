import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { cloudinaryConfig } from "./config/cloudinary.js";

await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Cloudinary
cloudinaryConfig();

const allowedOrigins = [
  "http://localhost:5173",
  "https://decibel-ecommerce-frontend.vercel.app",
];

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// middlewares
app.use(express.json());
app.use(cookieParser());

// product router
app.use("/api/products", productRoutes);

// user router
app.use("/api/users", userRoutes);

// wishlist router
app.use("/api/wishlist", wishlistRoutes);

// cart router
app.use("/api/cart", cartRoutes);

// order router
app.use("/api/orders", orderRoutes);

app.listen(PORT, () =>
  console.log(`server is running at http://localhost:${PORT}`),
);
