import React, { useState } from "react";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import ManualDropdown from "../components/ManualDropdown";
import { useAdminStats } from "../context/AdminStatsContext";
import AddProducts from "../components/AddProducts";
import api from "../../services/api";
import { toast } from "react-toastify";
AddProducts;

const AdminProducts = () => {
  const { stats, setStats } = useAdminStats();
  const products = stats.products;

  const emptyProduct = {
    productName: "",
    type: "",
    price: "",
    image: "",
    status: "",
    brand: "",
    model: "",
    rating: "",
    description: "",
  };

  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: "",
    type: "",
    price: "",
    image: "",
    status: "",
    brand: "",
    model: "",
    rating: "3",
    description: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const filteredProducts = (products || []).filter((product) => {
    return (
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAdd = () => {
    setIsEditing(false);
    setEditProduct(null);
    setNewProduct(emptyProduct);
    setIsAdding(true);
  };

  // edit product
  const handleEditProduct = (product) => {
    setIsEditing(true);
    setEditProduct(product);
    setNewProduct(product); //fill existing details
    setIsAdding(false);
  };

  // delete product
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete ${product.productName}?`))
      return;

    try {
      const response = await api.delete(`/products/${product.id}`);

      if (response.status === 200 || response.status === 201) {
        toast.success("Product deleted successfully");

        setStats((prev) => ({
          ...prev,
          products: prev.products.filter((item) => item.id !== product.id),
          totalProducts: prev.totalProducts - 1,
        }));
      }
    } catch (error) {
      toast.error("Failed to delete the product");
      console.error("Failed to delete product:",error);
    }
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search products"
            className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Category Dropdown */}
          {/* <ManualDropdown /> */}
        </div>

        {/* Add Product Button */}
        <button
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md font-medium hover:bg-indigo-700 transition"
          onClick={handleAdd}
        >
          <FiPlus size={18} />
          Add Product
        </button>
      </div>

      {/* MODAL OVERLAY */}
      {(isAdding || isEditing) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-6xl rounded-xl shadow-xl p-6 animate-fadeIn">
            <AddProducts
              mode={isAdding ? "add" : "edit"}
              onClose={isAdding ? setIsAdding : setIsEditing}
              setNewProduct={setNewProduct}
              newProduct={newProduct}
            />
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Products ({products?.length})
        </h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="py-2">#ID</th>
              <th className="py-2">Product Image</th>
              <th className="py-2">Product Name</th>
              <th className="py-2">Category</th>
              <th className="py-2">Price</th>
              <th className="py-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {filteredProducts.map((product) => (
              <tr key={product._id} className="border-b">
                <td className="py-3">{product.sku}</td>
                <td className="py-3">
                  <div className="flex items-center justify-center w-20 h-20 mx-3 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={`/${product.image}`}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="py-3">{product.productName}</td>
                <td className="py-3">{product.type}</td>
                <td className="py-3">₹{product.price}</td>

                <td className="py-3 text-center">
                  {" "}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      className="text-blue-400 hover:text-blue-500"
                      onClick={() => handleEditProduct(product)}
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      className="text-red-400 hover:text-red-500"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
