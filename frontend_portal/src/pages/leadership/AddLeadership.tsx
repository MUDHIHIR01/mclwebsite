
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  leader_name: string;
  position: string;
  leader_image: File | null;
  description: string;
}

const AddLeadership: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    leader_name: '',
    position: '',
    leader_image: null,
    description: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({
    leader_name: '',
    position: '',
    leader_image: '',
    description: '',
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
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, leader_image: file }));
    setErrors((prev) => ({ ...prev, leader_image: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.leader_name.trim()) {
      newErrors.leader_name = 'Leader name is required';
    } else if (formData.leader_name.length > 255) {
      newErrors.leader_name = 'Leader name must not exceed 255 characters';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    } else if (formData.position.length > 255) {
      newErrors.position = 'Position must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.leader_image && !['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.leader_image.type)) {
      newErrors.leader_image = 'Only JPEG, PNG, JPG, or GIF files are allowed';
    } else if (formData.leader_image && formData.leader_image.size > 2 * 1024 * 1024) {
      newErrors.leader_image = 'Image size must not exceed 2MB';
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
      payload.append('leader_name', formData.leader_name);
      payload.append('position', formData.position);
      payload.append('description', formData.description || '');
      if (formData.leader_image) {
        payload.append('leader_image', formData.leader_image);
      }

      const response = await axiosInstance.post('/api/leadership', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Leadership record created successfully', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/leadership'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create leadership record';
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
          Create New Leadership 
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="leader_name" className="block text-sm font-medium text-gray-700">
              Leader Name *
            </label>
            <input
              type="text"
              id="leader_name"
              name="leader_name"
              value={formData.leader_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter leader name"
              maxLength={255}
              aria-invalid={!!errors.leader_name}
              aria-describedby={errors.leader_name ? 'leader_name-error' : undefined}
            />
            {errors.leader_name && (
              <p id="leader_name-error" className="mt-1 text-sm text-red-500">
                {errors.leader_name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position *
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter position"
              maxLength={255}
              aria-invalid={!!errors.position}
              aria-describedby={errors.position ? 'position-error' : undefined}
            />
            {errors.position && (
              <p id="position-error" className="mt-1 text-sm text-red-500">
                {errors.position}
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
            <label htmlFor="leader_image" className="block text-sm font-medium text-gray-700">
              Leader Image (optional)
            </label>
            <input
              type="file"
              id="leader_image"
              name="leader_image"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.leader_image && (
              <p id="leader_image-error" className="mt-1 text-sm text-red-500">
                {errors.leader_image}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/leadership')}
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
                'Create Leadership'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadership;
