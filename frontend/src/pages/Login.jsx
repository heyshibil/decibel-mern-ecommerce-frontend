import React, { useState } from "react";
import { Link } from "react-router-dom";
import LoginImage from "/src/assets/loginpage.webp";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // show toast for 403 status 
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("message") === "blocked") {
    toast.error("Access Denied: Your account has been suspended by the administrator.");
  }
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email && password) {
      try {
        const userData = await login({ email, password });

        if (userData.role === "user") {
          toast.success(`Welcome back, ${userData.username}`);
        }
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="w-full h-screen flex">
      <div className="w-1/2 lg:px-12 lg:py-6">
        <div className="max-w-md mx-auto text-left flex flex-col h-full justify-center">
          <p
            id="logo-text"
            className="font-bold text-3xl tracking-tighter cursor-pointer mb-10"
          >
            DECIBEL.
          </p>

          <div className="mt-4">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              Welcome Back, Homie
            </h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-900 transition-all"
              >
                Sign In
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-6">
              Don’t have an account?{" "}
              <Link to="/register" className="text-black hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="w-1/2">
        <img className="w-full h-full object-cover" src={LoginImage} alt="" />
      </div>
    </div>
  );
};

export default Login;
