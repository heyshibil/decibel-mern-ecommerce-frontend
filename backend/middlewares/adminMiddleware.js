export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();

  // unauthorized
  return res.status(403).json({ message: "Access denied: Admins only" });
};
