import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// This interface is correct for the form's data (input values).
interface FormData {
  category: string;
  description: string;
  img_file: File | null;
}

// REFINEMENT 1: Create a dedicated interface for form error messages.
// Each property is a string, because error messages are strings.
interface FormErrors {
  category?: string;
  description?: string;
  img_file?: string;
}

const AddStayConnected: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    img_file: null,
  });
  // REFINEMENT 2: Use the new FormErrors interface for the errors state.
  // Initialize to an empty object.
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  // REMOVED: The 'isSubmitting' state was redundant as 'loading' serves the same purpose.
  // const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, img_file: file }));
    // This was the source of an error. It's now valid.
    setErrors((prev) => ({ ...prev, img_file: '' }));
  };

  const validateForm = (): boolean => {
    // REFINEMENT 3: Use FormErrors for the local newErrors object.
    const newErrors: FormErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.length > 255) {
      newErrors.category = 'Category must not exceed 255 characters';
    }

    if (formData.img_file) {
        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.img_file.type)) {
            // This was the source of an error. It's now valid.
            newErrors.img_file = 'Only JPEG, PNG, JPG, or GIF files are allowed';
        } else if (formData.img_file.size > 2 * 1024 * 1024) {
            // This was the source of an error. It's now valid.
            newErrors.img_file = 'Image size must not exceed 2MB';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    // REMOVED: setIsSubmitting(true) is no longer needed.

    try {
      const payload = new FormData();
      payload.append('category', formData.category);
      payload.append('description', formData.description || '');
      if (formData.img_file) {
        payload.append('img_file', formData.img_file);
      }

      const response = await axiosInstance.post('/api/stay-connected', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Stay connected entry created successfully', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/stay-connected'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create stay connected entry';
      const backendErrors = error.response?.data?.errors || {};
      
      // REFINEMENT 4: Map backend errors to our FormErrors type.
      const formattedErrors: FormErrors = {};
      if (backendErrors.category) formattedErrors.category = backendErrors.category[0];
      if (backendErrors.description) formattedErrors.description = backendErrors.description[0];
      if (backendErrors.img_file) formattedErrors.img_file = backendErrors.img_file[0];

      setErrors(formattedErrors);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
      // REMOVED: setIsSubmitting(false) is no longer needed.
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Create Stay Connected Entry
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter category"
              maxLength={255}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'category-error' : undefined}
            />
            {errors.category && (
              <p id="category-error" className="mt-1 text-sm text-red-500">
                {errors.category}
              </p>
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
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter description (optional)"
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="img_file" className="block text-sm font-medium text-gray-700">
              Image (optional)
            </label>
            <input
              type="file"
              id="img_file"
              name="img_file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.img_file && (
              // This was the source of the final error. It's now valid because errors.img_file is a string.
              <p id="img_file-error" className="mt-1 text-sm text-red-500">
                {errors.img_file}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/stay-connected')}
              className={`w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-md text-sm sm:text-base`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md text-sm sm:text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </div>
              ) : (
                'Create Stay Connected'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStayConnected;