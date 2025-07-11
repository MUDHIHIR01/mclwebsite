import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// REFINED: All fields are now optional in the interface.
interface FormData {
  heading?: string;
  description?: string;
  home_img?: File | null;
}

interface FormErrors {
  heading?: string;
  description?: string;
  home_img?: string;
}

const AddAbout: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    heading: '',
    description: '',
    home_img: null,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, home_img: file }));
    setErrors((prev) => ({ ...prev, home_img: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // REFINED: Heading is no longer required. Validation only runs if a value is present.
    if (formData.heading && formData.heading.length > 255) {
      newErrors.heading = 'Heading must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.home_img) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.home_img.type)) {
        newErrors.home_img = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.home_img.size > 100 * 1024 * 1024) { // 100MB
        newErrors.home_img = 'Image size must not exceed 100MB';
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
      
      // REFINED: All fields are optional and only appended if they have a value.
      if (formData.heading) {
        payload.append('heading', formData.heading);
      }
      if (formData.description) {
        payload.append('description', formData.description);
      }
      if (formData.home_img) {
        payload.append('home_img', formData.home_img);
      }

      const response = await axiosInstance.post('/api/about', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message || 'About entry created successfully', {
        position: 'top-right',
        autoClose: 2000,
        onClose: () => navigate('/about'),
      });

    } catch (error) {
      let errorMessage = 'Failed to create about entry. Please try again.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        const backendErrors = error.response.data?.errors;
        if (backendErrors) {
          setErrors(backendErrors);
        }
      }
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
          Create New About
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {/* REFINED: Label updated to show the field is optional. */}
            <label htmlFor="heading" className="block text-sm font-medium text-gray-700">
              Heading (Optional)
            </label>
            <input
              type="text"
              id="heading"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 text-sm sm:text-base"
              placeholder="Enter heading"
              // REFINED: Removed the 'required' attribute.
              maxLength={255}
              aria-invalid={!!errors.heading}
              aria-describedby={errors.heading ? 'heading-error' : undefined}
            />
            {errors.heading && (
              <p id="heading-error" className="mt-1 text-sm text-red-500">
                {errors.heading}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 text-sm sm:text-base"
              placeholder="Enter description"
              maxLength={1000}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="home_img" className="block text-sm font-medium text-gray-700">
              Image (Optional)
            </label>
            <input
              type="file"
              id="home_img"
              name="home_img"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              aria-invalid={!!errors.home_img}
              aria-describedby={errors.home_img ? 'home_img-error' : undefined}
            />
            {errors.home_img && (
              <p id="home_img-error" className="mt-1 text-sm text-red-500">
                {errors.home_img}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/about')}
              className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-md text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md text-sm sm:text-base flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
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
                </>
              ) : (
                'Create About'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAbout;