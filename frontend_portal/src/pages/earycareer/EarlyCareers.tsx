import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Data from form submission
interface FormData {
  category: string;
  description: string;
  img_file: File | null;
  video_file: File | null;
}

// **FIX 1: Create a dedicated interface for form error messages.**
interface FormErrors {
    category?: string;
    description?: string;
    img_file?: string;
    video_file?: string;
}

// Data from API
interface EarlyCareerData {
  early_career_id: number;
  category: string;
  description: string | null;
  img_file: string | null;
  video_file: string | null;
}

// API response might be nested
interface ApiGetResponse {
    early_career: EarlyCareerData;
}

const EditEarlyCareer = () => {
  const navigate = useNavigate();
  const { early_career_id } = useParams<{ early_career_id: string }>();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    img_file: null,
    video_file: null,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  // **FIX 2: Use the new FormErrors interface and initialize with an empty object.**
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchEarlyCareer = async () => {
      if (!early_career_id) {
        toast.error('Early career ID is missing.');
        navigate('/early-careers');
        return;
      }
      try {
        const response = await axiosInstance.get<ApiGetResponse>(`/api/early-careers/${early_career_id}`);
        const earlyCareer = response.data.early_career;
        setFormData({
          category: earlyCareer.category || '',
          description: earlyCareer.description || '',
          img_file: null,
          video_file: null,
        });
        setCurrentImage(earlyCareer.img_file);
        setCurrentVideo(earlyCareer.video_file);
      } catch (error: any) {
        toast.error('Failed to fetch early career entry');
        console.error("Fetch error:", error);
        navigate('/early-careers');
      }
    };

    fetchEarlyCareer();
  }, [early_career_id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    // **FIX 3: Type the newErrors object with FormErrors.**
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

    if (formData.video_file) {
      if (!['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-ms-wmv'].includes(formData.video_file.type)) {
        newErrors.video_file = 'Only MP4, AVI, MOV, or WMV files are allowed';
      } else if (formData.video_file.size > 10 * 1024 * 1024) {
        newErrors.video_file = 'Video size must not exceed 10MB';
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
    if (formData.video_file) {
      payload.append('video_file', formData.video_file);
    }

    try {
      // NOTE: For updates with FormData, you must use POST and may need a _method field
      // payload.append('_method', 'PUT'); // If Laravel backend expects it
      const response = await axiosInstance.post(`/api/early-careers/${early_career_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Early career entry updated successfully');
      setFormData((prev) => ({ ...prev, img_file: null, video_file: null }));
      setCurrentImage(response.data.early_career?.img_file || null);
      setCurrentVideo(response.data.early_career?.video_file || null);
      setTimeout(() => navigate('/early-careers'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update early career entry';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors);
      toast.error(errorMessage);
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMediaUrl = (mediaPath: string | null): string | undefined => {
    if (!mediaPath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    const path = mediaPath.replace(/^\//, '');
    return `${baseUrl}/${path}`;
  };

  const displayImageUrl = getMediaUrl(currentImage);
  const displayVideoUrl = getMediaUrl(currentVideo);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit Early Career Entry
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields remain the same */}
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
                  alt="Current Early Career"
                  className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/128x128?text=Image+Error';
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
            {errors.img_file && (
              <p id="img_file-error" className="mt-1 text-sm text-red-500">
                {errors.img_file}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          <div>
            <label htmlFor="video_file" className="block text-sm font-medium text-gray-700">
              Video (optional)
            </label>
            {displayVideoUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Video:</p>
                <video
                  src={displayVideoUrl}
                  controls
                  className="h-32 w-auto max-w-xs rounded border border-gray-200"
                  onError={(e) => {
                    (e.currentTarget.poster) = 'https://via.placeholder.com/128x128?text=Video+Error';
                    console.warn("Error loading current video from URL:", displayVideoUrl);
                  }}
                />
              </div>
            )}
            <input
              type="file"
              id="video_file"
              name="video_file"
              accept="video/mp4,video/avi,video/quicktime,video/wmv"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.video_file && (
              <p id="video_file-error" className="mt-1 text-sm text-red-500">
                {errors.video_file}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 10MB. Allowed types: MP4, AVI, MOV, WMV.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/early-careers')}
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
                'Update Early Career'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEarlyCareer;