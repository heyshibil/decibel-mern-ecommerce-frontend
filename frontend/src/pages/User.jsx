import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SubHead from "../components/SubHead";
import { FaRegUser } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { BsBoxSeam } from "react-icons/bs";
import api from "../services/api";
import { toast } from "react-toastify";
import { useOrders } from "../context/OrdersContext";
import { useAppNavigation } from "../hooks/useAppNavigation";

const User = () => {
  const { user, updateUser } = useAuth();

  const [saving, setSaving] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");

  const { goOrders } = useAppNavigation();
  const { orders } = useOrders();
  console.log(orders);

  // fetch orders details
  const totalOrders = orders.length;
  const totalSpend = orders.reduce(
    (sum, order) => sum + Number(order.amount.total),
    0
  );

  const handleSaveUsername = async () => {
    try {
      setSaving(true);
      // updating user in db
      const res = await api.patch("/users/profile", {
        username: newUsername,
      });

     updateUser(res.data);

      toast.success("Username updated Successfully");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "An unexpected error happen"
      console.error("Error while updating username:", error);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
      setEditingUsername(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      setSaving(true);
      const res = await api.patch("/users/profile", { email: newEmail });

      updateUser(res.data);
      toast.success("Email updated Successfully");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "An unexpected error happen"
      console.error("Error while updating email:", error);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
      setEditingEmail(false);
    }
  };

  const handleCancelUsername = () => {
    setNewUsername(user?.username || "");
    setEditingUsername(false);
  };

  const handleCancelEmail = () => {
    setNewEmail(user?.email || "");
    setEditingEmail(false);
  };

  return (
    <div className="relative min-h-screen w-full lg:pt-24 pb-12 lg:pb-24 bg-gray-50">
      <Header />
      <div className="w-11/12 mx-auto pt-6 lg:pt-12">
        <div className="w-full flex justify-between items-center mb-8">
          {/* <div className="w-fit">
            <SubHead head="My Profile" />
            <div className="bg-brand h-[1.5px]" />
          </div> */}
        </div>

        {/* Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Profile Info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* User Avatar & Name */}
            <div className="bg-white p-6 lg:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="bg-gradient-to-br from-gray-300 to-gray-200 rounded-full w-20 h-20 lg:w-24 lg:h-24 flex items-center justify-center">
                  <FaRegUser className="text-3xl lg:text-4xl text-gray-700" />
                </div>
                <div className="flex flex-col gap-2">
                  <h1 className="hh1 text-2xl lg:text-3xl font-bold">
                    {user?.username}
                  </h1>
                </div>
              </div>
            </div>

            {/* Username Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Username</h2>
                {!editingUsername && (
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium"
                  >
                    <MdEdit className="text-lg" />
                    Edit
                  </button>
                )}
              </div>

              {editingUsername ? (
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none"
                    placeholder="Enter new username"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveUsername}
                      className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelUsername}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700">{user?.username}</p>
                </div>
              )}
            </div>

            {/* Email Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Email Address</h2>
                {!editingEmail && (
                  <button
                    onClick={() => setEditingEmail(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium"
                  >
                    <MdEdit className="text-lg" />
                    Edit
                  </button>
                )}
              </div>

              {editingEmail ? (
                <div className="flex flex-col gap-4">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none"
                    placeholder="Enter new email"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveEmail}
                      className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEmail}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700">{user?.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right - Orders Summary */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
            <div className="flex gap-3 items-center mb-6">
              <h2 className="text-xl font-semibol">Orders</h2>
              <BsBoxSeam className="text-xl text-gray-500" />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-3xl font-bold text-gray-500">
                  {totalOrders}
                </p>
              </div>

              <div className="h-[1px] bg-gray-200"></div>

              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold">₹{totalSpend.toFixed(2)}</p>
              </div>

              {/* <div className="h-[1px] bg-gray-200"></div> */}

              <button
                onClick={goOrders}
                className="mt-2 w-full px-4 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>

        {/* <div className="w-full mx-auto pt-12 lg:pt-20">
          <Footer />
        </div> */}
      </div>
    </div>
  );
};

export default User;
