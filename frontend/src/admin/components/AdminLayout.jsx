import React, { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useAppNavigation } from "../../hooks/useAppNavigation";

const AdminLayout = () => {
  const { user, isAdmin, loading, logOut } = useAuth();
  const { goLogin } = useAppNavigation();

  useEffect(() => {
    if (loading) return;

    if (!user || !isAdmin) {
      goLogin();
    }
  }, [user, isAdmin, loading, goLogin]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col justify-between">
        {/* Logo */}
        <div>
          <div className="h-20 flex items-center px-6">
            <h1 className="text-2xl font-bold tracking-tighter">DECIBEL.</h1>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              <FiGrid size={20} />
              Dashboard
            </NavLink>

            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              <FiBox size={20} />
              Products
            </NavLink>

            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              <FiShoppingBag size={20} />
              Orders
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`
              }
            >
              <FiUsers size={20} />
              Users
            </NavLink>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            className="w-full flex items-center gap-3 text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 ease-in-out duration-200"
            onClick={() => logOut()}
          >
            <FiLogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content (Outlet) */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
