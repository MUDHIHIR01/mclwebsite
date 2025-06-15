import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  givingBack_category: string;
  description: string;
  weblink: string;
  image_slider: File[] | null;
}

const AddGivingBack: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    givingBack_category: '',
    description: '',
    weblink: '',
    image_slider: null,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({
    givingBack_category: '',
    description: '',
    weblink: '',
    image_slider: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : null;
    setFormData((prev) => ({ ...prev, image_slider: files }));
    setErrors((prev) => ({ ...prev, image_slider: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.givingBack_category.trim()) {
      newErrors.givingBack_category = 'Category is required';
    } else if (formData.givingBack_category.length > 255) {
      newErrors.givingBack_category = 'Category must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.weblink && !/^(https?:\/\/)/i.test(formData.weblink)) {
      newErrors.weblink = 'Please enter a valid URL';
    } else if (formData.weblink && formData.weblink.length > 255) {
      newErrors.weblink = 'Web link must not exceed 255 characters';
    }

    if (formData.image_slider) {
      for (const file of formData.image_slider) {
        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
          newErrors.image_slider = 'Only JPEG, PNG, JPG, or GIF files are allowed';
          break;
        } else if (file.size > 2 * 1024 * 1024) {
          newErrors.image_slider = 'Each image must not exceed 2MB';
          break;
        }
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
      payload.append('givingBack_category', formData.givingBack_category);
      payload.append('description', formData.description || '');
      payload.append('weblink', formData.weblink || '');
      if (formData.image_slider) {
        formData.image_slider.forEach((file) => {
          payload.append('image_slider[]', file);
        });
      }

      const response = await axiosInstance.post('/api/giving-back', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Giving Back record created successfully', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/giving/back'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create Giving Back record';
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
          Create New Giving Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="givingBack_category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <input
              type="text"
              id="givingBack_category"
              name="givingBack_category"
              value={formData.givingBack_category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter category"
              maxLength={255}
              aria-invalid={!!errors.givingBack_category}
              aria-describedby={errors.givingBack_category ? 'givingBack_category-error' : undefined}
            />
            {errors.givingBack_category && (
              <p id="givingBack_category-error" className="mt-1 text-sm text-red-500">
                {errors.givingBack_category}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter description"
              maxLength={1000}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="weblink" className="block text-sm font-medium text-gray-700">
              Web Link (optional)
            </label>
            <input
              type="url"
              id="weblink"
              name="weblink"
              value={formData.weblink}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter web link"
              maxLength={255}
              aria-invalid={!!errors.weblink}
              aria-describedby={errors.weblink ? 'weblink-error' : undefined}
            />
            {errors.weblink && (
              <p id="weblink-error" className="mt-1 text-sm text-red-500">
                {errors.weblink}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="image_slider" className="block text-sm font-medium text-gray-700">
              Image Slider (optional)
            </label>
            <input
              type="file"
              id="image_slider"
              name="image_slider"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.image_slider && (
              <p id="image_slider-error" className="mt-1 text-sm text-red-500">
                {errors.image_slider}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/giving/back')}
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
                'Create Giving Back'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGivingBack;