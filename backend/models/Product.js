import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    sku: { type: String, unique: true, index: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productName: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    status: { type: String, required: true },
    rating: { type: Number, required: true },
    image: { type: String, required: true },
    cloudinary_id: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);
