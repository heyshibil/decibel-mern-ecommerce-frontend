import { User } from "../models/User.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/emailService.js";
import { generateTokens } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      if (!userExists.isVerified) {
        return res.status(400).json({
          message:
            "Account exists but is unverified. Please request a new OTP.",
        });
      }

      return res
        .status(400)
        .json({ message: "User already exists. Please login" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // newUser instance
    const newUser = new User({
      username,
      email,
      password,
      verificationOTP: otp,
      otpExpire,
      isVerified: false,
    });

    await newUser.save();

    // send email via resend
    await sendVerificationEmail(newUser.email, otp);

    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
      email: newUser.email,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later" });
  }
};

// Verify Email with OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    // validateOTP
    if (user.verificationOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.otpExpire < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.otpExpire = undefined;

    // generate tokens
    const { refreshToken } = generateTokens(res, user._id);
    user.refreshToken = refreshToken;

    await user.save();

    return res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist,
        cart: user.cart,
      },
    });
  } catch (error) {
    console.error("Email verify error:", error);
    return res
      .status(500)
      .json({ message: "Verification failed. Please try again." });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res
        .status(404)
        .json({ message: "Email is already verified, Please login" });

    // backend throttling minimum 1min b/w OTPs
    const timeSinceLastOtp = user.otpExpire
      ? new Date(user.otpExpire).getTime() - Date.now()
      : 0;
    const nineMinute = 9 * 60 * 1000;

    // Check lasttime OTP is greater than 9min (Force wait 1min)
    if (timeSinceLastOtp > nineMinute) {
      return res.status(429).json({
        message: "Please wait 60 seconds before requesting a new OTP.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, otp);
    return res.status(200).json({ message: "New OTP sent successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to resend OTP" });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    // user validation | comparing password with matchPassword method (model)
    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res
          .status(403)
          .json({ message: "Please verify your email before logging in." });
      }

      if (user.isBlocked) {
        return res.status(403).json({
          message: "Your access has been restricted. Please contact support",
        });
      }

      // JWT refresh-token generation
      const { refreshToken } = generateTokens(res, user._id);
      user.refreshToken = refreshToken;
      await user.save();

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

// Logout
export const logoutUser = async (req, res) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  }

  // expires tokens //
  res.cookie("accessToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
};

// Refresh access token
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: "Not authorized, no refresh token found" });
    }

    // verify token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    // validating refresh token
    if (!user || user.isBlocked || user.refreshToken !== refreshToken) {
      return res
        .status(403)
        .json({ message: "Refresh token is invalid or account is restricted" });
    }

    // issue new access token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    // set new accessToken cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, //15min
    });

    return res
      .status(200)
      .json({ message: "Access token refreshed successfully" });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res
      .status(403)
      .json({ message: "Session expired. Please login again." });
  }
};

// Update user profile
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
    const { id } = req.params;
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

    return res.status(200).json({
      message: `User has been ${user.isBlocked ? "blocked" : "unblocked"}`,
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error during user status update" });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(200).json({
        message:
          "If an account with that email exists, we've sent a reset code.",
      });
    }

    // 60 sec Throttle
    if (user.resetPasswordOTPExpire) {
      const timeSinceLastOtp =
        new Date(user.resetPasswordOTPExpire).getTime() - Date.now();
      const nineMinutes = 9 * 60 * 1000;
      if (timeSinceLastOtp > nineMinutes) {
        return res.status(429).json({
          message: "Please wait 60 seconds before requesting a new code.",
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(email, otp);

    return res.status(200).json({
      message: "An verification OTP has sent to registered email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required" });
    }

    // Password validation
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate OTP
    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    // Validate OTP expiry
    if (
      !user.resetPasswordOTPExpire ||
      user.resetPasswordOTPExpire < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "Reset code has expired. Please request a new one." });
    }

    // set new password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;

    // SECURITY
    user.refreshToken = undefined;

    await user.save();

    return res.status(200).json({
      message:
        "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
