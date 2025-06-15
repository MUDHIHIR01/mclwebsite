import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormDataState {
  givingBack_category: string;
  description: string;
  weblink: string;
  image_slider: File[] | null;
}

const EditGivingBack: React.FC = () => {
  const navigate = useNavigate();
  const { givingId } = useParams<{ givingId: string }>();
  const [formData, setFormData] = useState<FormDataState>({
    givingBack_category: '',
    description: '',
    weblink: '',
    image_slider: null,
  });
  const [currentImages, setCurrentImages] = useState<string[] | null>(null);
  const [errors, setErrors] = useState<Partial<FormDataState>>({
    givingBack_category: '',
    description: '',
    weblink: '',
    image_slider: undefined,
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchGivingBack = async () => {
      if (!givingId) {
        toast.error('Giving Back ID is missing.');
        navigate('/giving/back');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/giving-back/${givingId}`);
        setFormData({
          givingBack_category: response.data.giving_back?.givingBack_category || '',
          description: response.data.giving_back?.description || '',
          weblink: response.data.giving_back?.weblink || '',
          image_slider: null,
        });
        setCurrentImages(response.data.giving_back?.image_slider ? JSON.parse(response.data.giving_back.image_slider) : null);
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to fetch Giving Back record');
        navigate('/giving/back');
      }
    };

    fetchGivingBack();
  }, [givingId, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : null;
    setFormData((prev) => ({ ...prev, image_slider: files }));
    setErrors((prev) => ({ ...prev, image_slider: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormDataState> = {};

    if (!formData.givingBack_category.trim()) {
      newErrors.givingBack_category = 'Category is required';
    } else if (formData.givingBack_category.length > 255) {
      newErrors.givingBack_category = 'Category must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.weblink && !/^(https?:\/\/)/i.test(formData.weblink)) {
      newErrors.weblink = 'Please enter a valid URL';
    } else if (formData.weblink && formData.weblink.length > 255) {
      newErrors.weblink = 'Web link must not exceed 255 characters';
    }

    if (formData.image_slider) {
      for (const file of formData.image_slider) {
        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
          (newErrors.image_slider as any) = 'Only JPEG, PNG, JPG, or GIF files are allowed';
          break;
        } else if (file.size > 2 * 1024 * 1024) {
          (newErrors.image_slider as any) = 'Each image must not exceed 2MB';
          break;
        }
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
    payload.append('givingBack_category', formData.givingBack_category);
    payload.append('description', formData.description || '');
    payload.append('weblink', formData.weblink || '');
    if (formData.image_slider) {
      formData.image_slider.forEach((file) => {
        payload.append('image_slider[]', file);
      });
    }

    try {
      const response = await axiosInstance.post(`/api/giving-back/${givingId}/update`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message || 'Giving Back record updated successfully');
      if (response.data.giving_back?.image_slider) {
        setCurrentImages(JSON.parse(response.data.giving_back.image_slider));
        setFormData((prev) => ({ ...prev, image_slider: null }));
      }
      setTimeout(() => navigate('/giving/back'), 2000);
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update Giving Back record';
      const backendErrors = error.response?.data?.errors || {};
      const formattedErrors: Partial<FormDataState> = {};
      for (const key in backendErrors) {
        if (key in formData) {
          (formattedErrors as any)[key] = backendErrors[key][0];
        }
      }
      setErrors((prev) => ({ ...prev, ...formattedErrors }));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string): string => {
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${baseUrl}/${cleanPath}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit Giving Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="givingBack_category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="givingBack_category"
              name="givingBack_category"
              value={formData.givingBack_category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.givingBack_category ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter category"
              maxLength={255}
              aria-invalid={!!errors.givingBack_category}
              aria-describedby={errors.givingBack_category ? 'givingBack_category-error' : undefined}
            />
            {errors.givingBack_category && (
              <p id="givingBack_category-error" className="mt-1 text-sm text-red-500">
                {errors.givingBack_category}
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
                errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
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
            <label htmlFor="weblink" className="block text-sm font-medium text-gray-700">
              Web Link (optional)
            </label>
            <input
              type="url"
              id="weblink"
              name="weblink"
              value={formData.weblink}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.weblink ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter web link"
              maxLength={255}
              aria-invalid={!!errors.weblink}
              aria-describedby={errors.weblink ? 'weblink-error' : undefined}
            />
            {errors.weblink && (
              <p id="weblink-error" className="mt-1 text-sm text-red-500">
                {errors.weblink}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="image_slider" className="block text-sm font-medium text-gray-700">
              Image Slider (optional)
            </label>
            {currentImages && currentImages.length > 0 && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Images:</p>
                <div className="flex flex-wrap gap-2">
                  {currentImages.map((image, index) => (
                    <img
                      key={index}
                      src={getImageUrl(image)}
                      alt={`Giving Back Image ${index + 1}`}
                      className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200"
                      onError={(e) => {
                        console.warn('Error loading image:', getImageUrl(image));
                        (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=LoadError';
                        (e.currentTarget as HTMLImageElement).alt = 'Error loading current image';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <input
              type="file"
              id="image_slider"
              name="image_slider"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.image_slider && (
              <p id="image_slider-error" className="mt-1 text-sm text-red-500">
                {errors.image_slider as string}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/giving/back')}
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
                'Update Giving Back'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGivingBack;
