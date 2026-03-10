import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 56,
  keyGenerator: (req) => {
    return req.body?.email || req.ip;
  },
  message: {
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  handler: (req, res, next, options) => {
    // 429 is the standard code for 'Too Many Requests'
    res.status(429).json(options.message);
  },
});
