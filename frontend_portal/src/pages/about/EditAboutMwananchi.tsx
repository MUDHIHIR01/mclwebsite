import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormDataState {
  category: string;
  description: string;
  video_link: string;
}

interface FormErrors {
  category?: string;
  description?: string;
  video_link?: string;
}

const EditAboutMwananchi: React.FC = () => {
  const navigate = useNavigate();
  const { aboutmwanachi_id } = useParams<{ aboutmwanachi_id: string }>();
  const [formData, setFormData] = useState<FormDataState>({
    category: '',
    description: '',
    video_link: '',
  });
  const [currentVideoLink, setCurrentVideoLink] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAboutMwananchi = async () => {
      if (!aboutmwanachi_id) {
        toast.error('About Mwananchi ID is missing.');
        navigate('/about-mwananchi');
        return;
      }
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/about-mwananchi/${aboutmwanachi_id}`);
        const { category, description, video_link } = response.data.record || {};
        setFormData({
          category: category || '',
          description: description || '',
          video_link: video_link || '',
        });
        setCurrentVideoLink(video_link || null);
      } catch (error) {
        toast.error('Failed to fetch About Mwananchi entry');
        console.error('Fetch error:', error);
        navigate('/about-mwananchi');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutMwananchi();
  }, [aboutmwanachi_id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.length > 255) {
      newErrors.category = 'Category must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (
      formData.video_link &&
      !/^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+(\?si=[a-zA-Z0-9_-]+)?$/.test(
        formData.video_link
      )
    ) {
      newErrors.video_link = 'Please enter a valid YouTube embed URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const payload = {
      category: formData.category,
      description: formData.description || '',
      video_link: formData.video_link || null,
    };

    try {
      const response = await axiosInstance.post(`/api/about-mwananchi/${aboutmwanachi_id}`, payload);
      toast.success(response.data.message || 'About Mwananchi entry updated successfully');
      setCurrentVideoLink(formData.video_link || null);
      setTimeout(() => navigate('/about-mwananchi'), 2000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update About Mwananchi entry';
      const backendErrors = error.response?.data?.errors || {};
      const formattedErrors: FormErrors = {};
      for (const key in backendErrors) {
        if (key in formData) {
          (formattedErrors as Record<string, string>)[key] = backendErrors[key][0];
        }
      }
      setErrors((prev) => ({ ...prev, ...formattedErrors }));
      toast.error(errorMessage);
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit About Mwananchi Entry
        </h2>
        {loading && <div className="text-center text-gray-600">Loading...</div>}
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
                errors.category
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
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
                errors.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
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
            <label htmlFor="video_link" className="block text-sm font-medium text-gray-700">
              YouTube Video Embed Link (optional)
            </label>
            {currentVideoLink && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Video:</p>
                <div className="relative" style={{ paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
                  <iframe
                    src={currentVideoLink}
                    title="Current YouTube video"
                    className="absolute top-0 left-0 w-full h-full rounded border border-gray-200"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
            <input
              type="text"
              id="video_link"
              name="video_link"
              value={formData.video_link}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.video_link
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="e.g., https://www.youtube.com/embed/video_id"
            />
            {errors.video_link && (
              <p id="video_link-error" className="mt-1 text-sm text-red-500">
                {errors.video_link}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter a valid YouTube embed URL (e.g., https://www.youtube.com/embed/video_id).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/about-mwananchi')}
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
                'Update About Mwananchi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAboutMwananchi;