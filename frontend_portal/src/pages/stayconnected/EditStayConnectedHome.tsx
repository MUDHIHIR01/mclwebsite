import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the form's data values
interface FormData {
  heading: string;
  description: string;
  home_img: File | null;
}

// REFINEMENT 1: Create a dedicated interface for form error messages.
// This is the key to fixing the type errors. Each property is a string.
interface FormErrors {
  heading?: string;
  description?: string;
  home_img?: string;
}

// Interface for the data received from the API
interface StayConnectedHomeData {
  stay_connected_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

const EditStayConnectedHome: React.FC = () => {
  const navigate = useNavigate();
  const { s_connectedhome_id } = useParams<{ s_connectedhome_id: string }>();
  const [formData, setFormData] = useState<FormData>({
    heading: '',
    description: '',
    home_img: null,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  // REFINEMENT 2: Use the new FormErrors interface for the errors state.
  // Initialize with an empty object for cleanliness.
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchStayConnectedHome = async () => {
      if (!s_connectedhome_id) {
        toast.error('Stay Connected Home ID is missing.');
        navigate('/stay-connected/home');
        return;
      }
      try {
        const response = await axiosInstance.get<StayConnectedHomeData>(`/api/stay-connected-home/${s_connectedhome_id}`);
        setFormData({
          heading: response.data.heading || '',
          description: response.data.description || '',
          home_img: null,
        });
        setCurrentImage(response.data.home_img);
      } catch (error: any) {
        toast.error('Failed to fetch stay connected home entry');
        console.error("Fetch error:", error);
        navigate('/stay-connected/home');
      }
    };

    fetchStayConnectedHome();
  }, [s_connectedhome_id, navigate]);

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
    // REFINEMENT 3: Use FormErrors for the local newErrors object.
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
        // FIX: This is now valid because newErrors.home_img is a string.
        newErrors.home_img = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.home_img.size > 2 * 1024 * 1024) {
        // FIX: This is also valid now.
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
    }
    // This part seems complex, you might need to append a specific value
    // like `_method: 'PUT'` if your backend needs it for FormData updates.
    // For now, leaving the logic as is.
    
    // Note: Standard PUT with FormData can be tricky. Often, POST with a _method field is used.
    // We will append the method to the payload for some backend frameworks (like Laravel).
    payload.append('_method', 'PUT');

    try {
      // Use POST and let the backend handle the PUT via the _method field
      const response = await axiosInstance.post(`/api/stay-connected-home/${s_connectedhome_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message || 'Stay connected home entry updated successfully');
      setFormData((prev) => ({ ...prev, home_img: null }));
      // Use the correct field from the response to update the image
      setCurrentImage(response.data.stayConnectedHome?.home_img || null); 
      setTimeout(() => navigate('/stay-connected/home'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update stay connected home entry';
      const backendErrors = error.response?.data?.errors || {};
      
      // REFINEMENT 4: Explicitly map backend errors to our FormErrors type.
      const formattedErrors: FormErrors = {};
      if (backendErrors.heading) formattedErrors.heading = backendErrors.heading[0];
      if (backendErrors.description) formattedErrors.description = backendErrors.description[0];
      if (backendErrors.home_img) formattedErrors.home_img = backendErrors.home_img[0];
      
      setErrors(formattedErrors);
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
          Edit Stay Connected Home Entry
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... (form fields for heading and description remain the same) ... */}
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
              value={formData.description || ''}
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
                  alt="Current Stay Connected Home"
                  className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'; // Hide broken image
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
            {errors.home_img && (
              <p id="home_img-error" className="mt-1 text-sm text-red-500">
                {/* FIX: The cast `as string` is no longer needed because the type is correct. */}
                {errors.home_img}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          {/* ... (form buttons remain the same) ... */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/stay-connected/home')}
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
                'Update Stay Connected Home'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStayConnectedHome;