import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  event_category: string;
  description: string;
  img_file: File | null;
  video_link: string;
}

interface Errors {
  event_category: string;
  description: string;
  img_file: string;
  video_link: string;
}

const AddOurEvent: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    event_category: '',
    description: '',
    img_file: null,
    video_link: '',
  });
  const [errors, setErrors] = useState<Errors>({
    event_category: '',
    description: '',
    img_file: '',
    video_link: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    setErrors((prev: Errors) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData((prev: FormData) => ({ ...prev, [name]: file }));
    setErrors((prev: Errors) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {
      event_category: '',
      description: '',
      img_file: '',
      video_link: '',
    };

    if (!formData.event_category.trim()) {
      newErrors.event_category = 'Category is required';
    } else if (formData.event_category.length > 255) {
      newErrors.event_category = 'Category must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 100000) {
      newErrors.description = 'Description must not exceed 100000 characters';
    }

    if (formData.img_file) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.img_file.type)) {
        newErrors.img_file = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.img_file.size > 2 * 1024 * 1024) {
        newErrors.img_file = 'Image size must not exceed 2MB';
      }
    }

    if (formData.video_link) {
      try {
        new URL(formData.video_link);
      } catch {
        newErrors.video_link = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('event_category', formData.event_category);
      payload.append('description', formData.description || '');
      if (formData.img_file) {
        payload.append('img_file', formData.img_file);
      }
      if (formData.video_link) {
        payload.append('video_link', formData.video_link);
      }

      const response = await axiosInstance.post('/api/events', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Event record created successfully', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/our-events'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create event record';
      const backendErrors: Partial<Errors> = error.response?.data?.errors || {};
      setErrors((prev: Errors) => ({
        ...prev,
        event_category: backendErrors.event_category || '',
        description: backendErrors.description || '',
        img_file: backendErrors.img_file || '',
        video_link: backendErrors.video_link || '',
      }));
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
          Create New Event
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="event_category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="event_category"
              name="event_category"
              value={formData.event_category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter category"
              maxLength={255}
              aria-invalid={!!errors.event_category}
              aria-describedby={errors.event_category ? 'event_category-error' : undefined}
              required
            />
            {errors.event_category && (
              <p id="event_category-error" className="mt-1 text-sm text-red-500">
                {errors.event_category}
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
              maxLength={100000}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="img_file" className="block text-sm font-medium text-gray-700">
              Event Image (optional)
            </label>
            <input
              type="file"
              id="img_file"
              name="img_file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              aria-describedby={errors.img_file ? 'img_file-error' : 'img_file-info'}
            />
            {errors.img_file && (
              <p id="img_file-error" className="mt-1 text-sm text-red-500">
                {errors.img_file}
              </p>
            )}
            <p id="img_file-info" className="mt-1 text-xs text-gray-500">
              Max file size: 2MB. Allowed types: JPG, PNG, GIF.
            </p>
          </div>
          <div>
            <label htmlFor="video_link" className="block text-sm font-medium text-gray-700">
              Video Link (optional)
            </label>
            <input
              type="url"
              id="video_link"
              name="video_link"
              value={formData.video_link}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter video URL"
              aria-describedby={errors.video_link ? 'video_link-error' : undefined}
            />
            {errors.video_link && (
              <p id="video_link-error" className="mt-1 text-sm text-red-500">
                {errors.video_link}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/our-events')}
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
                  <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </div>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOurEvent;