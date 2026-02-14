import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getWishlistApi, toggleWishlistApi } from "../services/wishlistService";
import {
  removeFromCartApi,
  clearCart,
  addToCartApi,
  getCartApi,
  updateCartApi,
} from "../services/cartService";
import { useAuth } from "./AuthContext";
import { toast, Slide } from "react-toastify";

const WishlistCartContext = createContext();

export const WishlistCartProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // fetch user wishlistCart datas
  useEffect(() => {
    const fetchWishlistCartDatas = async () => {
      if (!user) {
        setWishlist([]);
        setCart([]);
        return;
      }

      try {
        setLoading(true);
        // Promise.all() to reduce ms.
        const [wishlistData, cartData] = await Promise.all([
          getWishlistApi(),
          getCartApi(),
        ]);

        // filtering wishlist from null values
        const cleanWishlist = Array.isArray(wishlistData)
          ? wishlistData.filter((item) => item !== null)
          : [];

        setWishlist(cleanWishlist);
        setCart(cartData);
      } catch (error) {
        console.error(error);
        toast.error(
          error?.response?.data?.message ||
            "Server is unreachable. Try again later",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistCartDatas();
  }, [user]);

  const handleToggleWishlist = async (product) => {
    if (!user) return;

    try {
      const { message } = await toggleWishlistApi(product._id);

      const updatedWishlist = await getWishlistApi();
      const cleanWishlist = Array.isArray(updatedWishlist)
        ? updatedWishlist.filter((item) => item !== null)
        : [];

      setWishlist(cleanWishlist);
      toast.success(message);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Server is unreachable. Try again later",
      );
    }
  };

  // add to cart
  const handleAddToCart = async (productId) => {
    if (!user) return;

    try {
      setLoading(true);
      const updatedCart = await addToCartApi(productId);
      setCart(updatedCart);
      toast.success("Added to cart");
    } catch (error) {
      if (error?.response?.status === 409)
        toast.error("Product already exists in cart");
      else
        toast.error(
          error?.response?.data?.message ||
            "Server is unreachable. Try again later",
        );
    } finally {
      setLoading(false);
    }
  };

  //counter update quantity
  const handleUpdateQuantity = async (productId, quantity) => {
    if (!user) return;

    try {
      const updatedCart = await updateCartApi(productId, quantity);
      setCart(updatedCart);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Server is unreachable. Try again later",
      );
    }
  };

  // remove from cart
  const handleRemoveFromCart = async (productId) => {
    if (!user) return;

    try {
      setLoading(true);

      const updatedCart = await removeFromCartApi(productId);
      setCart(updatedCart);
      toast.success("Product removed from cart");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Server is unreachable. Try again later",
      );
    } finally {
      setLoading(false);
    }
  };

  // clear cart
  const handleClearCart = async () => {
    const clearedCart = await clearCart();
    setCart(clearedCart);
  };

  // memoized calculations
  const { subTotal, gst, total } = useMemo(() => {
    const subTotal = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    const gst = subTotal * 0.18;
    const total = (subTotal + gst).toFixed(2);

    return { subTotal, gst, total };
  });

  return (
    <WishlistCartContext.Provider
      value={{
        cart,
        handleAddToCart,
        handleUpdateQuantity,
        handleRemoveFromCart,
        handleClearCart,
        wishlist,
        handleToggleWishlist,
        subTotal,
        gst,
        loading,
        total,
      }}
    >
      {children}
    </WishlistCartContext.Provider>
  );
};

export const useWishlistCart = () => useContext(WishlistCartContext);
