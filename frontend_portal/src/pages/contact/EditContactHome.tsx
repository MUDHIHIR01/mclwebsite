import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ContactHome data interface
interface ContactHomeData {
  cont_home_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
  created_at: string;
  updated_at?: string;
}

// Form data interface
interface FormData {
  heading: string;
  description: string;
  home_img: File | null;
}

export default function EditContactHome() {
  const navigate = useNavigate();
  const { cont_home_id } = useParams<{ cont_home_id: string }>();
  const [formData, setFormData] = useState<FormData>({
    heading: '',
    description: '',
    home_img: null,
  });
  const [initialData, setInitialData] = useState<FormData | null>(null); // Store initial data for comparison
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContactHome = async () => {
      if (!cont_home_id) {
        toast.error('Contact Home ID is missing.', { position: 'top-right' });
        navigate('/contact-homes');
        return;
      }
      try {
        const response = await axiosInstance.get<ContactHomeData>(`/api/contact-homes/${cont_home_id}`);
        const fetchedData = {
          heading: response.data.heading || '',
          description: response.data.description || '',
          home_img: null,
        };
        setFormData(fetchedData);
        setInitialData(fetchedData); // Save initial data
        setCurrentImage(response.data.home_img);
        console.log('Fetched contact home slider: ', response.data);
      } catch (error: any) {
        toast.error('Failed to fetch contact home slider.', { position: 'top-right' });
        console.error("Fetch error:", error);
        navigate('/contact/home');
      }
    };

    fetchContactHome();
  }, [cont_home_id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    const newErrors: Partial<FormData> = {};

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

    // Only append fields that have changed
    if (initialData) {
      if (formData.heading !== initialData.heading) {
        payload.append('heading', formData.heading);
      }
      if (formData.description !== initialData.description) {
        payload.append('description', formData.description || '');
      }
      if (formData.home_img) {
        // New image uploaded
        payload.append('home_img', formData.home_img);
      }
      // Do NOT append home_img if no new image is uploaded, to preserve existing image
    }

    // If no fields have changed, notify user and skip update
    if (payload.entries().next().done) {
      toast.info('No changes detected.', { position: 'top-right' });
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(`/api/contact-homes/${cont_home_id}/update`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Contact home slider updated successfully', {
        position: 'top-right',
      });
      setFormData((prev) => ({ ...prev, home_img: null }));
      setInitialData((prev) => ({
        ...prev!,
        heading: formData.heading,
        description: formData.description,
        home_img: null,
      }));
      setCurrentImage(response.data.slider?.home_img || null);
      setTimeout(() => navigate('/contact/home'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update contact home slider';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors);
      toast.error(errorMessage, { position: 'top-right' });
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null): string | undefined => {
    if (!imagePath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
  };

  const displayImageUrl = getImageUrl(currentImage);

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Edit Contact Home</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-sm ${
                errors.heading ? 'border-red-600 focus:border-red-600 focus:ring-red-600' : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600'
              }`}
              placeholder="Enter heading"
              maxLength={255}
              aria-invalid={!!errors.heading}
              aria-describedby={errors.heading ? 'heading-error' : undefined}
            />
            {errors.heading && (
              <p id="heading-error" className="mt-1 text-sm text-red-600">{errors.heading}</p>
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
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-sm ${
                errors.description ? 'border-red-600 focus:border-red-600 focus:ring-red-600' : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600'
              }`}
              placeholder="Enter description (optional)"
              maxLength={1000}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-600">{errors.description}</p>
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
                  alt="Current Contact Home Slider"
                  className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/128x128?text=LoadError';
                    e.currentTarget.alt = 'Error loading current image';
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
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
            />
            {errors.home_img && (
              <p id="home_img-error" className="mt-1 text-sm text-red-600">{errors.home_img}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: jpg, png, gif.</p>
          </div>
          <div className="flex justify-end gap-4">
            <Link
              to="/contact/home"
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.25A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </div>
              ) : (
                'Update Contact Home'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}