import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useAppNavigation } from "../hooks/useAppNavigation";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { goHome, goLogin } = useAppNavigation();

  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Load session user if any exist
  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));

    if (sessionUser) setUser(sessionUser);
    setLoadingAuth(false);
  }, []);

  // polling for checking the access status of user
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/users/${user.id}`);
        const currentUser = res.data;

        if (currentUser.isBlocked) {
          toast.error("Your access has been restricted");
          logOut();
        }
      } catch (error) {
        toast.error("Something went wrong");
        console.error("Error happened:", error);
      }
    }, 3000);

    // cleanup function
    return () => clearInterval(interval);
  }, [user]);

  // Register
  const register = async ({ name, email, password }) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email address");
      return;
    }
    // Check password strength
    if (password.length < 6) {
      toast.error("Password is too short");
      return;
    }

    try {
      const res = await api.post("/users/register", {
        username: name,
        email,
        password,
      });

      toast.success("Registration successful! Please login.");
      goLogin();

      return res.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server is unreachable. Try again later")
      console.error("Registration failed:", err);
      return;
    }
  };

  // Login
  const login = async ({ email, password }) => {
    try {
      const res = await api.get(`/users?email=${encodeURIComponent(email)}`);

      if (!res.data || res.data.length === 0) {
        throw new Error("User not found");
      }

      const user = res.data[0];

      if (user.password != password) {
        throw new Error("Invalid password");
      }

      if (user?.isBlocked) {
        toast.error("Your access has been restricted");
        return;
      }

      // updating isOnline status of user
      await api.patch(`/users/${user.id}`, { isOnline: true });
      const updatedUser = { ...user, isOnline: true };

      // updating user state
      setUser(updatedUser);
      // setting user to session
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      goHome();
      return updatedUser;
    } catch (err) {
      throw err;
    }
  };

  // logout
  const logOut = async () => {
    try {
      if (!user?.id) return;

      await api.patch(`/users/${user.id}`, { isOnline: false });

      setUser(null);
      sessionStorage.removeItem("user");
      goLogin();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // check if user exist in session
  const requireAuth = () => {
    if (!user) {
      goLogin();
      return false;
    }

    return true;
  };

  // update user
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        login,
        logOut,
        loadingAuth,
        requireAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
