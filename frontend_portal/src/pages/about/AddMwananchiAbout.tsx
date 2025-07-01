import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  category: string;
  description: string;
  video_link: string;
}

interface FormErrors {
  category?: string;
  description?: string;
  video_link?: string;
}

const AddAboutMwananchi: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    video_link: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.length > 255) {
      newErrors.category = 'Category must not exceed 255 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.video_link && !/^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+(\?si=[a-zA-Z0-9_-]+)?$/.test(formData.video_link)) {
      newErrors.video_link = 'Please enter a valid YouTube embed URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        category: formData.category,
        description: formData.description || '',
        video_link: formData.video_link || null,
      };

      const response = await axiosInstance.post('/api/about-mwananchi', payload);
      toast.success(response.data.message || 'About Mwananchi entry created successfully', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/about-mwananchi'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create About Mwananchi entry';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Create New About Mwananchi
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
              maxLength={1000}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="video_link" className="block text-sm font-medium text-gray-700">
              YouTube Video Embed Link (optional)
            </label>
            <input
              type="text"
              id="video_link"
              name="video_link"
              value={formData.video_link}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="e.g., https://www.youtube.com/embed/job0f0pUu2I"
            />
            {errors.video_link && (
              <p id="video_link-error" className="mt-1 text-sm text-red-500">
                {errors.video_link}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Enter a valid YouTube embed URL (e.g., https://www.youtube.com/embed/video_id).</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/about-mwananchi')}
              className="w-full sm:w-40 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-md text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-40 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md text-sm sm:text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                'Create About Mwananchi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAboutMwananchi;