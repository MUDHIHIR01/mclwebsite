import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  category: string;
  description: string;
  img_file: File | null;
}

// FIX: Create a dedicated interface for string-based error messages.
interface FormErrors {
  category?: string;
  description?: string;
  img_file?: string;
}

// FIX: Removed unused BenefitData interface.

const EditBenefit = () => {
  const navigate = useNavigate();
  const { benefity_id } = useParams<{ benefity_id: string }>();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    img_file: null,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  // FIX: Use the new FormErrors type and initialize as an empty object.
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBenefit = async () => {
      if (!benefity_id) {
        toast.error('Benefit ID is missing.');
        navigate('/benefities');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/benefits/${benefity_id}`);
        const benefit = response.data.benefit;
        setFormData({
          category: benefit.category || '',
          description: benefit.description || '',
          img_file: null,
        });
        setCurrentImage(benefit.img_file);
      } catch (error: any) {
        toast.error('Failed to fetch benefit');
        console.error("Fetch error:", error);
        navigate('/benefities');
      }
    };

    fetchBenefit();
  }, [benefity_id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, img_file: file }));
    // FIX: This assignment is now type-safe.
    setErrors((prev) => ({ ...prev, img_file: '' }));
  };

  const validateForm = (): boolean => {
    // FIX: The newErrors object is now correctly typed as FormErrors.
    const newErrors: FormErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.length > 255) {
      newErrors.category = 'Category must not exceed 255 characters';
    }

    if (formData.img_file) {
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

    try {
      const response = await axiosInstance.post(`/api/benefits/${benefity_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Benefit updated successfully');
      setFormData((prev) => ({ ...prev, img_file: null }));
      setCurrentImage(response.data.benefit?.img_file || null);
      setTimeout(() => navigate('/benefities'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update benefit';
      const backendErrors = error.response?.data?.errors || {};
      setErrors({
        category: backendErrors.category?.[0] || '',
        description: backendErrors.description?.[0] || '',
        img_file: backendErrors.img_file?.[0] || '',
      });
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
          Edit Benefit
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
              Image (optional)
            </label>
            {displayImageUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img
                  src={displayImageUrl}
                  alt="Current Benefit"
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
            {/* FIX: This is now type-safe because errors.img_file is a string. */}
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
              onClick={() => navigate('/benefities')}
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
                'Update Benefit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBenefit;