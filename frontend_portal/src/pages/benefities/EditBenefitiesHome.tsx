import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  heading: string;
  description: string;
  home_img: File | null;
}

interface BenefitiesHomeData {
  benefit_home_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

// FIX: Create a dedicated interface for string-based error messages.
interface FormErrors {
    heading?: string;
    description?: string;
    home_img?: string;
}

const EditBenefitiesHome = () => {
  const navigate = useNavigate();
  const { benefityhome_id } = useParams<{ benefityhome_id: string }>();
  const [formData, setFormData] = useState<FormData>({
    heading: '',
    description: '',
    home_img: null,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  // FIX: Use the new FormErrors type.
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBenefitiesHome = async () => {
      if (!benefityhome_id) {
        toast.error('Benefities Home ID is missing.');
        navigate('/benefities/home');
        return;
      }
      try {
        const response = await axiosInstance.get<BenefitiesHomeData>(`/api/benefities-home/${benefityhome_id}`);
        setFormData({
          heading: response.data.heading || '',
          description: response.data.description || '',
          home_img: null,
        });
        setCurrentImage(response.data.home_img);
      } catch (error: any) {
        toast.error('Failed to fetch benefities home entry');
        console.error("Fetch error:", error);
        navigate('/benefities/home');
      }
    };

    fetchBenefitiesHome();
  }, [benefityhome_id, navigate]);

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
    // FIX: newErrors is now correctly typed.
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
    } else if (currentImage && !formData.home_img) {
      payload.append('home_img', '');
    }

    try {
      // NOTE: FormData with PUT requests often requires a POST method override.
      // Appending `_method: 'PUT'` might be necessary depending on the backend (Laravel).
      // Using .post() here to accommodate this common pattern.
      const response = await axiosInstance.post(`/api/benefities-home/${benefityhome_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Benefities home entry updated successfully');
      setFormData((prev) => ({ ...prev, home_img: null }));
      setCurrentImage(response.data.slider?.home_img || null);
      setTimeout(() => navigate('/benefities/home'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update benefities home entry';
      const backendErrors = error.response?.data?.errors || {};
      // FIX: Correctly type the formattedErrors object.
      const formattedErrors: FormErrors = {};
      for (const key in backendErrors) {
        if (key in formData) {
          (formattedErrors as Record<string, string>)[key] = backendErrors[key][0];
        }
      }
      setErrors((prev) => ({ ...prev, ...formattedErrors }));
      toast.error(errorMessage);
      console.error("Submit error:", error);
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

  const displayImageUrl = getImageUrl(currentImage);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit Benefities Home Entry
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
                errors.heading ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
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
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter description (optional)"
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
                  alt="Current Benefities Home"
                  className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/128x128?text=LoadError';
                    e.currentTarget.alt = 'Error loading current image';
                    console.warn("Error loading current image from URL:", displayImageUrl);
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
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* FIX: Removed the unsafe 'as string' cast. */}
            {errors.home_img && (
              <p id="home_img-error" className="mt-1 text-sm text-red-500">
                {errors.home_img}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/benefities/home')}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition shadow-sm text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm sm:text-base ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                'Update Benefities Home'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBenefitiesHome;