import React, { useEffect, useMemo, useState } from "react";
import { FiLock, FiUnlock } from "react-icons/fi";
import { useAdminStats } from "../context/AdminStatsContext";
import api from "../../services/api";
import { showError, showSuccess } from "../../utils/toastService";
import { mirage } from "ldrs";

mirage.register();

const AdminUsers = () => {
  const { stats, loading, refreshStats } = useAdminStats();
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // fetch users
  useEffect(() => {
    if (stats.users) setUsersList(stats.users);
  }, [stats.users]);

  // toggle block
  const toggleBlock = async (userId, currentBlockStatus) => {
    try {
      const response = await api.patch(`/users/block/${userId}`, {
        isBlocked: !currentBlockStatus,
      });

      if (response.status === 200) {
        showSuccess(`User ${currentBlockStatus ? "Unblocked" : "blocked"} successfully`);
        refreshStats();
      }

    } catch (error) {
      showError(error.response?.data?.message || "Failed to update user status");
      console.error("Failed to update:", error);
    }
  };

  // filtered products
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return usersList.filter(
      (u) =>
        u._id.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query),
    );
  }, [usersList, searchQuery]);

  const statusColors = {
    true: "text-green-600",
    false: "text-gray-500",
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <l-mirage size="60" speed="2.5" color="black"></l-mirage>
      </div>
    );
  }

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Users</h1>

      {/* Search Bar */}
      <div className="flex mb-6">
        <input
          type="text"
          placeholder="Search users"
          className="px-4 py-2 border rounded-lg shadow-sm w-72 focus:outline-none focus:ring-2 focus:ring-gray-700"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Users ({usersList.length})
        </h2>

        <table className="w-full text-left table-auto">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2 w-[15%]">User ID</th>
              <th className="py-2 w-[10%]">Username</th>
              <th className="py-2 w-[30%]">Email</th>
              <th className="py-2 w-[15%]">Status</th>
              <th className="py-2 w-[20%]">Action</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="border-b">
                <td className="py-3 font-medium">{user._id}</td>

                <td className="py-3">{user.username}</td>

                <td className="py-3">{user.email}</td>

                <td className="py-3">
                  <span
                    className={`capitalize font-semibold ${
                      statusColors[user.isOnline]
                    }`}
                  >
                    {user.isOnline ? "online" : "offline"}
                  </span>
                </td>

                <td className="py-3 text-center">
                  <button
                    onClick={() => toggleBlock(user._id, user.isBlocked)}
                    className={`w-40 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition
    ${
      user.isBlocked
        ? "bg-red-500 text-white hover:bg-red-600"
        : "bg-indigo-600 text-white hover:bg-indigo-700"
    }`}
                  >
                    {user.isBlocked ? (
                      <FiUnlock size={16} />
                    ) : (
                      <FiLock size={16} />
                    )}
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
