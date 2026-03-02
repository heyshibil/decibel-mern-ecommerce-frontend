import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBlocked: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, min: 1, default: 1 },
      },
    ],
    refreshToken: { type: String },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOTP: {
      type: String,
    },
    otpExpire: {
      type: Date,
      expires: 0, // Document will be deleted exactly at the date stored in otpExpire (TTL)
    },
    resetPasswordOTP: { type: String },
    resetPasswordOTPExpire: { type: Date },
  },
  { timestamps: true },
);

// Password Hashing: runs before .save()
userSchema.pre("save", async function () {
  // only hash the password, if its new or modified
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error(error);
  }
});

// login password combine function
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
