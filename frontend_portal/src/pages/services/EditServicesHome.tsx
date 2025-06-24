import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// This interface is correct for the form's data
interface FormData {
  heading: string;
  description: string;
  home_img: File | null;
}

// REFINEMENT 1: Create a dedicated interface for form error messages.
// Each property is a string, which is the correct type for an error message.
interface FormErrors {
  heading?: string;
  description?: string;
  home_img?: string;
}

interface ServicesHomeData {
  services_home_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

interface ApiResponse {
  message: string;
  slider?: ServicesHomeData;
  error?: string;
  errors?: Record<string, string[]>;
}

const EditServicesHome: React.FC = () => {
  const navigate = useNavigate();
  const { services_homeId } = useParams<{ services_homeId: string }>();
  const [formData, setFormData] = useState<FormData>({
    heading: '',
    description: '',
    home_img: null,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  // REFINEMENT 2: Use the new FormErrors interface for the errors state.
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!services_homeId) {
      toast.error('Invalid entry ID', { position: 'top-right' });
      navigate('/services/home');
      return;
    }

    const fetchRecord = async () => {
      try {
        const response = await axiosInstance.get<ApiResponse>(
          `/api/services-homes/${services_homeId}`
        );
        const record = response.data.slider;
        if (record) {
          setFormData({
            heading: record.heading || '',
            description: record.description || '',
            home_img: null,
          });
          setCurrentImage(record.home_img);
        } else {
          throw new Error('Record not found');
        }
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to fetch entry', {
          position: 'top-right',
        });
        navigate('/services/home');
      } finally {
        setFetching(false);
      }
    };

    fetchRecord();
  }, [services_homeId, navigate]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    },
    []
  );

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, home_img: file }));
    // This was the source of the first error. It's now valid.
    setErrors((prev) => ({ ...prev, home_img: '' }));
  }, []);

  const validateForm = useCallback((): boolean => {
    // REFINEMENT 3: Use FormErrors for the local newErrors object.
    const newErrors: FormErrors = {};
    if (!formData.heading.trim()) newErrors.heading = 'Heading is required';
    if (formData.heading.length > 255)
      newErrors.heading = 'Heading must not exceed 255 characters';
    if (formData.description.length > 1000)
      newErrors.description = 'Description must not exceed 1000 characters';
    if (formData.home_img) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.home_img.type)) {
        // This was the source of the second error. It's now valid.
        newErrors.home_img = 'Only JPEG, PNG, JPG, or GIF files allowed';
      } else if (formData.home_img.size > 2 * 1024 * 1024) {
        // This was the source of the third error. It's now valid.
        newErrors.home_img = 'Image must not exceed 2MB';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm() || !services_homeId) return;

    setLoading(true);
    const payload = new window.FormData(); // Use window.FormData to avoid name collision
    payload.append('heading', formData.heading);
    payload.append('description', formData.description);
    if (formData.home_img) payload.append('home_img', formData.home_img);
    
    // For PUT requests with FormData, Laravel needs a method spoof.
    payload.append('_method', 'PUT');

    try {
      // Use POST to send multipart/form-data with a spoofed method.
      const response = await axiosInstance.post<ApiResponse>(
        `/api/services-homes/${services_homeId}`,
        payload,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success(response.data.message, { position: 'top-right' });
      if (response.data.slider?.home_img) {
        setCurrentImage(response.data.slider.home_img);
        setFormData((prev) => ({ ...prev, home_img: null }));
      }
      setTimeout(() => navigate('/services/home'), 2000);
    } catch (err: any) {
      const errorResponse = err.response?.data || {};
      const errorMessage = errorResponse.error || 'Failed to update entry';
      const backendErrors = errorResponse.errors || {};
      // REFINEMENT 4: Use FormErrors for mapping backend validation errors.
      const formattedErrors: FormErrors = {};
      for (const key in backendErrors) {
        if (key in formData) {
          formattedErrors[key as keyof FormErrors] = backendErrors[key][0];
        }
      }
      setErrors(formattedErrors);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, [formData, services_homeId, navigate, validateForm]);

  const getImageUrl = useCallback(
    (path: string | null): string | undefined =>
      path ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, '')}/${path}` : undefined,
    []
  );

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-lg text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Edit Services Home
        </h2>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="heading"
              className="block text-sm font-medium text-gray-700"
            >
              Heading <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="heading"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              className={`mt-1 w-full rounded-md border p-3 ${
                errors.heading ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              placeholder="Enter heading"
              maxLength={255}
            />
            {errors.heading && (
              <p className="mt-1 text-sm text-red-500">{errors.heading}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`mt-1 w-full rounded-md border p-3 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              placeholder="Enter description"
              maxLength={1000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="home_img"
              className="block text-sm font-medium text-gray-700"
            >
              Image
            </label>
            {currentImage && (
              <div className="my-2">
                <p className="text-sm text-gray-600">Current Image:</p>
                <img
                  src={getImageUrl(currentImage)}
                  alt="Current"
                  className="h-32 w-auto rounded border"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/128x128?text=Image+Not+Found';
                    e.currentTarget.alt = 'Current image not found';
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
              className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.home_img && (
              // This was the source of the fourth error. It's now valid.
              <p className="mt-1 text-sm text-red-500">{errors.home_img}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max 2MB. JPG, PNG, GIF. Leave blank to keep current image.</p>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/services/home')}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
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
        </div>
      </div>
    </div>
  );
};

export default EditServicesHome;