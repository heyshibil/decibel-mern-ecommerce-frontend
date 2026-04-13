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

// CORS
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://decibel-mern-ecommerce-frontend-qto.vercel.app"],
//     credentials: true,
//   }),
// );

app.use(cors());

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
