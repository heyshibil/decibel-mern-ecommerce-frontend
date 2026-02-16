import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists. Please login" });
    }

    // newUser instance
    const newUser = new User({
      username,
      email,
      password,
    });

    const savedUser = await newUser.save();

    // JWT token and HTTPOnly cookie generation
    generateToken(res, savedUser._id);

    // registration successful
    return res.status(201).json({
      message: "Registration successful",
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
        wishlist: savedUser.wishlist,
        cart: savedUser.cart,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    // user && comparing password with matchPassword method (model)
    if (user && (await user.matchPassword(password))) {
      if (user.isBlocked) {
        return res.status(403).json({
          message: "Your access has been restricted. Please contact support",
        });
      }

      // JWT token and HTTPOnly cookie generation
      generateToken(res, user._id);

      return res.status(200).json({
        message: "Login successful",
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          wishlist: user.wishlist,
          cart: user.cart,
        },
      });
    } else {
      return res.status(401).json({ message: "Verify your credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later" });
  }
};

export const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    return res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      wishlist: updatedUser.wishlist,
      cart: updatedUser.cart,
    });
  } catch (error) {
    // Handle Duplicate Email Error (MongoDB Error Code 11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    return res
      .status(500)
      .json({ message: "Server error during update", error: error.message });
  }
};

// Get all users **admin**
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: "Server Error: Could not fetch users",
    });
  }
};

// Block user **admin**
export const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params.id;
    const { isBlocked } = req.body;

    // Prevent Admin from blocking themselves
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot block your own admin account." });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked },
      { new: true, runValidators: true },
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res
      .status(200)
      .json({
        message: `User has been ${user.isBlocked ? "blocked" : "unblocked"}`,
        user
      });
  } catch (error) {
    return res.status(500).json({ message: "Server error during user status update" });
  }
};
