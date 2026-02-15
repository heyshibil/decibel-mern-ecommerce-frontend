import { Product } from "../models/Product.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";

// GET all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
};

// GET product by id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Invalid product id" });
  }
};

// CREATE product
export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      type,
      price,
      brand,
      model,
      rating,
      description,
      status,
    } = req.body;

    // Check if an image was uploaded via Multer
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a product image" });
    }

    // Manual Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "decibel_audio",
      resource_type: "auto",
    });

    // Remove the file from 'uploads' after Cloudinary is done
    fs.unlinkSync(req.file.path);

    // Generate unique SKU
    const sku = `PROD-${Date.now().toString().slice(-4)}`;

    // creating new product
    const product = new Product({
      sku,
      user: req.user._id, //tracks which admin created this
      productName,
      type,
      price: Number(price),
      brand,
      model,
      rating: Number(rating),
      description,
      status,
      image: uploadResult.secure_url, //CDN URL by cloudinary
      cloudinary_id: uploadResult.public_id,
    });

    const createdProduct = await product.save();
    return res.status(201).json(createdProduct);
  } catch (error) {
    // If Cloudinary fails, try to clean up the local file anyway
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }

    console.error("Product creation error:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
      file: req.file ? "present" : "missing",
    });

    res.status(500).json({
      message: "Product creation failed",
      error: error.message,
    });
  }
};
