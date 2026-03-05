import { Product } from "../models/Product.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs";

// GET all products
export const getAllProducts = async (req, res) => {
  try {
    const searchTerm = req.query.q;

    if (!searchTerm || searchTerm.trim() === "") {
      const products = await Product.find();
      return res.status(200).json(products);
    }

    const products = await Product.find({
      $or: [
        { productName: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { brand: { $regex: searchTerm, $options: "i" } },
        { type: { $regex: searchTerm, $options: "i" } },
      ],
    });

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
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product id format" });
    }
    return res.status(500).json({ message: "Failed to fetch product" });
  }
};

// CREATE product **admin**
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

// UPDATE product **admin**
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateData = { ...req.body };

    if (req.file) {
      // delete old image from cloudinary
      if (existingProduct.cloudinary_id) {
        await cloudinary.uploader.destroy(existingProduct.cloudinary_id);
      }

      // upload new image
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "decibel_audio",
      });

      // cleanup local temp file
      fs.unlinkSync(req.file.path);

      updateData.image = uploadResult.secure_url;
      updateData.cloudinary_id = uploadResult.public_id;
    }

    // Convert numeric fields to ensure data type consistency
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.rating) updateData.rating = Number(updateData.rating);

    // update product in db
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    return res.status(200).json(updatedProduct);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);

    console.error("Update Error:", error);
    return res
      .status(500)
      .json({ message: "Update failed", error: error.message });
  }
};

// DELETE product **admin**
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // delete image from Cloudinary
    if (product.cloudinary_id) {
      await cloudinary.uploader.destroy(product.cloudinary_id);
    }
    // delete from db
    await Product.findByIdAndDelete(id);

    return res.status(200).json({ message: "Product and assets deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Deletion failed" });
  }
};
