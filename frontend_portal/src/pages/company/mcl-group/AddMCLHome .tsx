import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  heading: string;
  description: string;
  mcl_home_img: File | null;
}

const AddMCLHome: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    heading: '',
    description: '',
    mcl_home_img: null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);

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
    setFormData((prev) => ({ ...prev, mcl_home_img: file }));
    setErrors((prev) => ({ ...prev, mcl_home_img: '' }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.heading.trim()) {
      newErrors.heading = 'Heading is required';
    } else if (formData.heading.length > 255) {
      newErrors.heading = 'Heading must not exceed 255 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.mcl_home_img) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.mcl_home_img.type)) {
        newErrors.mcl_home_img = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.mcl_home_img.size > 2 * 1024 * 1024) {
        newErrors.mcl_home_img = 'Image size must not exceed 2MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setLoading(true);
      try {
        const payload = new FormData();
        payload.append('heading', formData.heading);
        payload.append('description', formData.description || '');
        if (formData.mcl_home_img) {
          payload.append('mcl_home_img', formData.mcl_home_img);
        }

        const response = await axiosInstance.post('/api/mcl-home', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(response.data.message || 'Home slider created successfully', {
          position: 'top-right',
        });
        setTimeout(() => navigate('/mcl-group/home'), 2000);
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to create home slider';
        const backendErrors = error.response?.data?.errors || {};
        setErrors((prev) => ({
          ...prev,
          heading: backendErrors.heading?.[0] || '',
          description: backendErrors.description?.[0] || '',
          mcl_home_img: backendErrors.mcl_home_img?.[0] || '',
        }));
        toast.error(errorMessage, { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    },
    [formData, navigate, validateForm]
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Home Slider</h2>
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
              className={`mt-1 block w-full rounded-md border shadow-sm p-3 text-sm focus:outline-none focus:ring-2 ${
                errors.heading
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
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
              className={`mt-1 block w-full rounded-md border shadow-sm p-3 text-sm focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
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
            <label htmlFor="mcl_home_img" className="block text-sm font-medium text-gray-700">
              Image (optional)
            </label>
            {previewImage && (
              <div className="mt-2 mb-4">
                <p className="text-sm text-gray-600">Image Preview:</p>
                <img
                  src={previewImage}
                  alt="Image preview"
                  className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200"
                />
              </div>
            )}
            <input
              type="file"
              id="mcl_home_img"
              name="mcl_home_img"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.mcl_home_img ? 'border-red-500' : ''
              }`}
              aria-invalid={!!errors.mcl_home_img}
              aria-describedby={errors.mcl_home_img ? 'mcl_home_img-error' : undefined}
            />
            {errors.mcl_home_img && (
              <p id="mcl_home_img-error" className="mt-1 text-sm text-red-500">
                {errors.mcl_home_img}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/mcl-group/home')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
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
                  Creating...
                </div>
              ) : (
                'Create Home Slider'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMCLHome;