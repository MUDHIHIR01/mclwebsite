import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the form's data values.
interface FormData {
  category: string;
  description: string;
  img_file: File | null; // A new image file to be uploaded.
}

// REFINEMENT 1: Use this interface to type the data fetched from the API.
// This resolves the "unused interface" error.
interface StayConnectedData {
  stay_connected_id: number;
  category: string;
  description: string | null;
  img_file: string | null; // The path to the existing image on the server.
}

// REFINEMENT 2: Create a dedicated interface for form error messages.
// This is the core fix for most of the type errors.
interface FormErrors {
  category?: string;
  description?: string;
  img_file?: string;
}

const EditStayConnected = () => {
  const navigate = useNavigate();
  const { stay_connected_id } = useParams<{ stay_connected_id: string }>();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    img_file: null,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  // REFINEMENT 3: Use the new FormErrors interface for the errors state.
  // Initialize to an empty object. This fixes the initial state type mismatch.
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchStayConnected = async () => {
      if (!stay_connected_id) {
        toast.error('Stay connected ID is missing.');
        navigate('/stay-connected');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/stay-connected/${stay_connected_id}`);
        // Apply the StayConnectedData type to the fetched object.
        const stayConnected: StayConnectedData = response.data.stay_connected;
        setFormData({
          category: stayConnected.category || '',
          description: stayConnected.description || '',
          img_file: null, // Always null on initial load.
        });
        setCurrentImage(stayConnected.img_file);
      } catch (error: any) {
        toast.error('Failed to fetch stay connected entry');
        console.error("Fetch error:", error);
        navigate('/stay-connected');
      }
    };

    fetchStayConnected();
  }, [stay_connected_id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the specific error for the field being changed.
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, img_file: file }));
    // REFINEMENT 4: This is now type-correct because errors.img_file expects a string.
    setErrors((prev) => ({ ...prev, img_file: undefined }));
  };

  const validateForm = (): boolean => {
    // REFINEMENT 5: Use FormErrors for the local newErrors object.
    const newErrors: FormErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.length > 255) {
      newErrors.category = 'Category must not exceed 255 characters';
    }

    if (formData.img_file) {
      // REFINEMENT 6: Assigning a string error message is now valid.
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.img_file.type)) {
        newErrors.img_file = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.img_file.size > 2 * 1024 * 1024) {
        newErrors.img_file = 'Image size must not exceed 2MB';
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
    payload.append('category', formData.category);
    payload.append('description', formData.description || '');
    if (formData.img_file) {
      payload.append('img_file', formData.img_file);
    }
    // Add _method for Laravel to handle POST as PUT/PATCH for form-data
    payload.append('_method', 'POST');

    try {
      // Use POST for form-data with method spoofing
      const response = await axiosInstance.post(`/api/stay-connected/${stay_connected_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Stay connected entry updated successfully');
      setFormData((prev) => ({ ...prev, img_file: null })); // Clear the file input
      setCurrentImage(response.data.stay_connected?.img_file || currentImage);
      setErrors({}); // Clear errors on success
      setTimeout(() => navigate('/stay-connected'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update stay connected entry';
      const backendErrors = error.response?.data?.errors || {};
      
      // REFINEMENT 7: Map backend errors to our FormErrors type. This is now type-correct.
      const formattedErrors: FormErrors = {};
      if (backendErrors.category) formattedErrors.category = backendErrors.category[0];
      if (backendErrors.description) formattedErrors.description = backendErrors.description[0];
      if (backendErrors.img_file) formattedErrors.img_file = backendErrors.img_file[0];

      setErrors(formattedErrors);
      toast.error(errorMessage);
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null): string | undefined => {
    if (!imagePath) return undefined;
    // Ensure the base URL does not have a trailing slash
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    // Ensure the image path does not have a leading slash
    const path = imagePath.replace(/^\//, '');
    return `${baseUrl}/${path}`;
  };

  const displayImageUrl = getImageUrl(currentImage);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit Stay Connected Entry
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.category ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter category"
              maxLength={255}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'category-error' : undefined}
            />
            {errors.category && (
              <p id="category-error" className="mt-1 text-sm text-red-500">
                {errors.category}
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
            <label htmlFor="img_file" className="block text-sm font-medium text-gray-700">
              Replace Image (optional)
            </label>
            {displayImageUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img
                  src={displayImageUrl}
                  alt="Current Stay Connected"
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
              id="img_file"
              name="img_file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* REFINEMENT 8: This is now valid. errors.img_file is a string, which is a valid ReactNode. */}
            {errors.img_file && (
              <p id="img_file-error" className="mt-1 text-sm text-red-500">
                {errors.img_file}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/stay-connected')}
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
              {loading ? 'Updating...' : 'Update Stay Connected'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStayConnected;