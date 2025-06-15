import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import axiosInstance from "../../axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditRole() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const [formData, setFormData] = useState({
    category: "",
    description: ""
  });
  const [errors, setErrors] = useState({
    category: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axiosInstance.get(`/api/auth/roles/${roleId}`);
        setFormData({
          category: response.data.category || "",
          description: response.data.description || ""
        });
      } catch (error) {
        toast.error("Failed to fetch role");
        navigate("/user-roles");
      }
    };

    fetchRole();
  }, [roleId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.put(`/api/auth/roles/${roleId}`, formData);
      toast.success("Role updated successfully");
      setTimeout(() => navigate("/user-roles"), 3000);
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full mx-auto">
      {/* Toast Notification with Adjusted Position */}
      <ToastContainer position="top-right" autoClose={3000} style={{ marginTop: "60px" }} />
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-6">Edit Role</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Category *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/user-roles")}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {loading ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
