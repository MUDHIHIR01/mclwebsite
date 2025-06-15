import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Types
interface EarycareHomeData {
  earycare_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
  created_at: string;
  updated_at?: string;
}

interface FormData {
  heading: string;
  description: string;
  home_img: File | null;
}

interface FormErrors {
  heading?: string;
  description?: string;
  home_img?: string;
}

// Utility Functions
const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.heading.trim()) {
    errors.heading = 'Heading is required';
  } else if (formData.heading.length > 255) {
    errors.heading = 'Heading must not exceed 255 characters';
  }

  if (formData.description.length > 1000) {
    errors.description = 'Description must not exceed 1000 characters';
  }

  if (formData.home_img) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(formData.home_img.type)) {
      errors.home_img = 'Only JPEG, PNG, JPG, or GIF files are allowed';
    } else if (formData.home_img.size > 2 * 1024 * 1024) {
      errors.home_img = 'Image size must not exceed 2MB';
    }
  }

  return errors;
};

const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return 'https://via.placeholder.com/128x128?text=No+Image';
  const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
  return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
};

const handleApiError = (error: any, defaultMessage: string): FormErrors => {
  const errorMessage = error.response?.data?.error || defaultMessage;
  toast.error(errorMessage, { position: 'top-right' });
  return error.response?.data?.errors || {};
};

const EditEarycareHome: React.FC = () => {
  const navigate = useNavigate();
  const { earycarehome_id } = useParams<{ earycarehome_id: string }>();
  const [formData, setFormData] = useState<FormData>({ heading: '', description: '', home_img: null });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!earycarehome_id) {
      toast.error('Invalid Earycare Home ID.', { position: 'top-right' });
      navigate('/earycare/home');
      return;
    }

    const fetchData = async () => {
      setFetching(true);
      try {
        const response = await axiosInstance.get<EarycareHomeData>(`/api/earycare-home/${earycarehome_id}`);
        setFormData({
          heading: response.data.heading || '',
          description: response.data.description || '',
          home_img: null,
        });
        setCurrentImage(response.data.home_img);
      } catch (error: any) {
        toast.error('Failed to fetch entry.', { position: 'top-right' });
        navigate('/earycare/home');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [earycarehome_id, navigate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, home_img: file }));
    setErrors((prev) => ({ ...prev, home_img: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length) {
        setErrors(validationErrors);
        return;
      }

      setLoading(true);
      const payload = new FormData();
      payload.append('heading', formData.heading);
      payload.append('description', formData.description || '');
      if (formData.home_img) payload.append('home_img', formData.home_img);
      else if (currentImage && !formData.home_img) payload.append('home_img', '');

      try {
        const response = await axiosInstance.put(`/api/earycare-home/${earycarehome_id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(response.data.message || 'Entry updated successfully', { position: 'top-right' });
        setCurrentImage(response.data.slider?.home_img || null);
        setTimeout(() => navigate('/earycare/home'), 1500);
      } catch (error: any) {
        setErrors(handleApiError(error, 'Failed to update entry'));
      } finally {
        setLoading(false);
      }
    },
    [formData, currentImage, earycarehome_id, navigate]
  );

  if (fetching) return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading...</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Earycare Home</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="heading" className="block text-sm font-medium text-gray-700">
              Heading <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="heading"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${
                errors.heading ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter heading"
              maxLength={255}
              aria-invalid={!!errors.heading}
            />
            {errors.heading && <p className="mt-1 text-sm text-red-500">{errors.heading}</p>}
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
              className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${
                errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter description (optional)"
              maxLength={1000}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>
          <div>
            <label htmlFor="home_img" className="block text-sm font-medium text-gray-700">
              Image (optional)
            </label>
            {currentImage && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img src={getImageUrl(currentImage)} alt="Current Earycare Home" className="h-32 w-auto rounded border" />
              </div>
            )}
            <input
              type="file"
              id="home_img"
              name="home_img"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.home_img && <p className="mt-1 text-sm text-red-500">{errors.home_img}</p>}
            <p className="mt-1 text-xs text-gray-500">Max 2MB. JPG, PNG, GIF.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/earycare/home')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </div>
              ) : (
                'Update'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEarycareHome;