import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protect = async (req, res, next) => {
  // read jwt from cookie (possible by cookie-parser)
  const token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res
          .status(401)
          .json({ message: "User no longer exists. Access denied." });
      }

      if (user.isBlocked) {
        return res
          .status(403)
          .json({
            message: "Your access has been restricted. Please contact support",
          });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized. Token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized. No token" });
  }
};
