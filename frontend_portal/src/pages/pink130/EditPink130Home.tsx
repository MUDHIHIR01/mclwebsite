import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormDataState {
  heading: string;
  description: string;
  home_img: File | null;
}

interface FtPink130HomeData {
  ft_pink_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

interface ApiResponse {
  ft_pink_130_home?: FtPink130HomeData;
  error?: string;
  errors?: Record<string, string[]>;
}

const EditFtPink130Home: React.FC = () => {
  const navigate = useNavigate();
  const { ft_pink_id } = useParams<{ ft_pink_id: string }>();
  const [formData, setFormData] = useState<FormDataState>({
    heading: '',
    description: '',
    home_img: null,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormDataState>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);

  useEffect(() => {
    const fetchFtPink130Home = async () => {
      if (!ft_pink_id) {
        toast.error('Entry ID is missing.');
        navigate('/mcl-pink-130-home');
        return;
      }
      try {
        const response = await axiosInstance.get<ApiResponse>(`/api/mcl-pink-130-home/${ft_pink_id}`);
        const record = response.data.ft_pink_130_home;
        if (record) {
          setFormData({
            heading: record.heading || '',
            description: record.description || '',
            home_img: null,
          });
          setCurrentImage(record.home_img || null);
        } else {
          throw new Error('No record found');
        }
      } catch (error: any) {
        toast.error('Failed to fetch entry.');
        navigate('/mcl-pink-130-home');
      } finally {
        setFetching(false);
      }
    };

    fetchFtPink130Home();
  }, [ft_pink_id, navigate]);

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
    setErrors((prev) => ({ ...prev, home_img: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormDataState> = {};

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
        newErrors.home_img = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.home_img.size > 2 * 1024 * 1024) {
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
    const payload = new FormData();
    payload.append('heading', formData.heading);
    payload.append('description', formData.description || '');
    if (formData.home_img) {
      payload.append('home_img', formData.home_img);
    } else if (!currentImage) {
      payload.append('home_img', '');
    }

    try {
      const response = await axiosInstance.post(`/api/mcl-pink-130-home/${ft_pink_id}/update`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Entry updated successfully');
      if (response.data.ft_pink_130_home?.home_img) {
        setCurrentImage(response.data.ft_pink_130_home.home_img);
        setFormData((prev) => ({ ...prev, home_img: null }));
      }
      setTimeout(() => navigate('/mcl-pink-130-home'), 2000);
    } catch (error: any) {
      const errorResponse: ApiResponse = error.response?.data || {};
      const errorMessage = errorResponse.error || 'Failed to update entry';
      const backendErrors = errorResponse.errors || {};
      const formattedErrors: Partial<FormDataState> = {};
      for (const key in backendErrors) {
        if (key in formData) {
          formattedErrors[key as keyof FormDataState] = backendErrors[key][0];
        }
      }
      setErrors(formattedErrors);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null): string | undefined => {
    if (!imagePath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    const path = imagePath.replace(/^\//, '');
    return `${baseUrl}/${path}`;
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const displayImageUrl = getImageUrl(currentImage);

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Edit Pink 130 Home
        </h2>
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
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.heading ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter heading"
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
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
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
              Image (optional)
            </label>
            {displayImageUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img
                  src={displayImageUrl}
                  alt="Current entry image"
                  className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/128x128?text=LoadError';
                    e.currentTarget.alt = 'Error loading image';
                  }}
                />
              </div>
            )}
            <input
              type="file"
              id="home_img"
              name="home_img"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              aria-describedby={errors.home_img ? 'home_img-error' : undefined}
            />
            {errors.home_img && (
              <p id="home_img-error" className="mt-1 text-sm text-red-500">
                {errors.home_img}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/mcl-pink-130-home')}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
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
                  Updating...
                </div>
              ) : (
                'Update Entry'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFtPink130Home;