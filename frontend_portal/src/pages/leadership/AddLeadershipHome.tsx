import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the form data itself
interface FormData {
  heading: string;
  description: string;
  home_img: File | null;
}

// A dedicated type for form errors. Each property is optional and holds a string message.
type FormErrors = {
  [K in keyof FormData]?: string;
};

const AddLeadershipHome = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    heading: '',
    description: '',
    home_img: null,
  });

  // FIX: Use the new FormErrors type and initialize with an empty object.
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for the field being edited
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, home_img: file }));
    // Clear the error for the file input
    if (errors.home_img) {
      setErrors((prev) => ({ ...prev, home_img: undefined }));
    }
  };

  const validateForm = (): boolean => {
    // FIX: Type newErrors with our dedicated FormErrors type.
    const newErrors: FormErrors = {};

    if (!formData.heading.trim()) {
      newErrors.heading = 'Heading is required';
    } else if (formData.heading.length > 255) {
      newErrors.heading = 'Heading must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.home_img) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.home_img.type)) {
        // This assignment is now valid because newErrors.home_img expects a string.
        newErrors.home_img = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.home_img.size > 2 * 1024 * 1024) {
        // This is also valid now.
        newErrors.home_img = 'Image size must not exceed 2MB';
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
      payload.append('heading', formData.heading);
      payload.append('description', formData.description || '');
      if (formData.home_img) {
        payload.append('home_img', formData.home_img);
      }

      const response = await axiosInstance.post('/api/leadership-homes', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Leadership home entry created successfully', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/leadership/home'), 2000);
    } catch (error: unknown) {
      let errorMessage = 'Failed to create leadership home entry';
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
          Create Leadership Home
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Heading Input */}
          <div>
            <label htmlFor="heading" className="block text-sm font-medium text-gray-700">Heading *</label>
            <input
              type="text" id="heading" name="heading"
              value={formData.heading} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm"
              placeholder="Enter heading" maxLength={255}
              aria-invalid={!!errors.heading} aria-describedby={errors.heading ? 'heading-error' : undefined}
            />
            {errors.heading && <p id="heading-error" className="mt-1 text-sm text-red-500">{errors.heading}</p>}
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description" name="description"
              value={formData.description} onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm"
              placeholder="Enter description (optional)" maxLength={1000}
            />
            {errors.description && <p id="description-error" className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Home Image Input */}
          <div>
            <label htmlFor="home_img" className="block text-sm font-medium text-gray-700">Image (optional)</label>
            <input
              type="file" id="home_img" name="home_img"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {/* FIX: This JSX is now valid because errors.home_img is a string | undefined, which can be rendered. */}
            {errors.home_img && <p id="home_img-error" className="mt-1 text-sm text-red-500">{errors.home_img}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button type="button" onClick={() => navigate('/leadership/home')} disabled={loading} className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-md text-sm disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={loading} className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </div>
              ) : 'Create Leadership Home'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadershipHome;