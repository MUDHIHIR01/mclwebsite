import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the form's data
interface FormData {
  mcl_category: string;
  description: string;
  weblink: string;
  image_file: File | null;
}

// 1. Create a dedicated interface for form validation errors
interface FormErrors {
  mcl_category?: string;
  description?: string;
  weblink?: string;
  image_file?: string;
}

const AddMclGroup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    mcl_category: '',
    description: '',
    weblink: '',
    image_file: null,
  });

  // 2. Use the new FormErrors interface for the errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for the specific field when it's changed
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image_file: file }));
    // This is now type-safe, as we're just clearing the string-based error
    if (errors.image_file) {
      setErrors((prev) => ({ ...prev, image_file: undefined }));
    }
  };

  const validateForm = (): boolean => {
    // 3. Use the FormErrors type for the newErrors object
    const newErrors: FormErrors = {};

    if (!formData.mcl_category.trim()) {
      newErrors.mcl_category = 'Category is required';
    } else if (formData.mcl_category.length > 255) {
      newErrors.mcl_category = 'Category must not exceed 255 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.weblink && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(formData.weblink)) {
      newErrors.weblink = 'Please enter a valid URL';
    } else if (formData.weblink && formData.weblink.length > 255) {
      newErrors.weblink = 'Weblink must not exceed 255 characters';
    }

    if (formData.image_file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      // These assignments are now correct and type-safe
      if (!allowedTypes.includes(formData.image_file.type)) {
        newErrors.image_file = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.image_file.size > 2 * 1024 * 1024) { // 2MB
        newErrors.image_file = 'Image size must not exceed 2MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('mcl_category', formData.mcl_category);
      payload.append('description', formData.description || '');
      payload.append('weblink', formData.weblink || '');
      if (formData.image_file) {
        payload.append('image_file', formData.image_file);
      }

      const response = await axiosInstance.post('/api/mcl-groups', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success(response.data.message || 'MCL Group created successfully', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/mcl-group'), 2000); // Navigate to the list page
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create MCL Group';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Create New MCL Group
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="mcl_category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="mcl_category"
              name="mcl_category"
              value={formData.mcl_category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-base ${errors.mcl_category ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter category"
              maxLength={255}
              required
            />
            {errors.mcl_category && (
              <p className="mt-1 text-sm text-red-500">{errors.mcl_category}</p>
            )}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-base ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter description (optional)"
              maxLength={1000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          <div>
            <label htmlFor="weblink" className="block text-sm font-medium text-gray-700">
              Weblink
            </label>
            <input
              type="url"
              id="weblink"
              name="weblink"
              value={formData.weblink}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-base ${errors.weblink ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="https://example.com (optional)"
              maxLength={255}
            />
            {errors.weblink && (
              <p className="mt-1 text-sm text-red-500">{errors.weblink}</p>
            )}
          </div>
          <div>
            <label htmlFor="image_file" className="block text-sm font-medium text-gray-700">
              Image (optional)
            </label>
            <input
              type="file"
              id="image_file"
              name="image_file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {/* 4. Remove the unsafe 'as string' cast. It is no longer needed. */}
            {errors.image_file && (
              <p className="mt-1 text-sm text-red-500">{errors.image_file}</p>
            )}
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/mcl-group')}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create MCL Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMclGroup;