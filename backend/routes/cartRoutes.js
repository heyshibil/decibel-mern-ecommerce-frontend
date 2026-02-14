import express from 'express';
import { addToCart, clearCart, getCart, removeFromCart, updateCart } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(protect)

router.get("/", getCart)
router.post("/add", addToCart);
router.patch("/update", updateCart);
router.delete("/remove/:productId", removeFromCart);
router.patch("/clear", clearCart)

export default router;
