import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormDataState {
  category: string;
  description: string;
  video: string;
  pdf_file: File | null;
}

const EditPink130: React.FC = () => {
  const navigate = useNavigate();
  const { pinkId } = useParams<{ pinkId: string }>();
  const [formData, setFormData] = useState<FormDataState>({
    category: '',
    description: '',
    video: '',
    pdf_file: null,
  });
  const [currentPdf, setCurrentPdf] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormDataState>>({
    category: '',
    description: '',
    video: '',
    pdf_file: undefined,
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPink130 = async () => {
      if (!pinkId) {
        toast.error('Pink130 ID is missing.');
        navigate('/pink-130');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/pink-130/${pinkId}`);
        setFormData({
          category: response.data.pink130?.category || '',
          description: response.data.pink130?.description || '',
          video: response.data.pink130?.video || '',
          pdf_file: null,
        });
        setCurrentPdf(response.data.pink130?.pdf_file || null);
      } catch (error) {
        toast.error('Failed to fetch pink-130 record');
        console.error("Fetch error:", error);
        navigate('/pink-130');
      }
    };

    fetchPink130();
  }, [pinkId, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, pdf_file: file }));
    setErrors((prev) => ({ ...prev, pdf_file: undefined }));
  };

 const validateForm = (): boolean => {
  const newErrors: Partial<FormDataState> = {};

  if (!formData.category.trim()) {
    newErrors.category = 'Category is required';
  } else if (formData.category.length > 255) {
    newErrors.category = 'Category must not exceed 255 characters';
  }

  if (formData.description && formData.description.length > 1000) {
    newErrors.description = 'Description must not exceed 1000 characters';
  }

  // Enhanced video URL pattern to support major video platforms
  const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|facebook\.com|twitch\.tv|video\.google\.com|archive\.org|streamable\.com)\/.+$/i;

  if (formData.video) {
    if (!videoUrlPattern.test(formData.video)) {
      newErrors.video = 'Please enter a valid video URL (e.g., YouTube, Vimeo, etc.)';
    } else if (formData.video.length > 255) {
      newErrors.video = 'Video URL must not exceed 255 characters';
    }
  }

  if (formData.pdf_file) {
    if (formData.pdf_file.type !== 'application/pdf') {
      (newErrors.pdf_file as any) = 'Only PDF files are allowed';
    } else if (formData.pdf_file.size > 5 * 1024 * 1024) {
      (newErrors.pdf_file as any) = 'PDF file size must not exceed 5MB';
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
    payload.append('video', formData.video || '');
    if (formData.pdf_file) {
      payload.append('pdf_file', formData.pdf_file);
    }

    try {
      const response = await axiosInstance.post(`/api/pink-130/${pinkId}/update`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message || 'Pink130 record updated successfully');
      if (response.data.pink130?.pdf_file) {
        setCurrentPdf(response.data.pink130.pdf_file);
        setFormData(prev => ({ ...prev, pdf_file: null }));
      }
      setTimeout(() => navigate('/pink-130'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update pink-130 record';
      const backendErrors = error.response?.data?.errors || {};
      const formattedErrors: Partial<FormDataState> = {};
      for (const key in backendErrors) {
        if (key in formData) {
          (formattedErrors as any)[key] = backendErrors[key][0];
        }
      }
      setErrors(prev => ({ ...prev, ...formattedErrors }));
      toast.error(errorMessage);
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (filePath: string | null): string | undefined => {
    if (!filePath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    const path = filePath.replace(/^\//, '');
    return `${baseUrl}/${path}`;
  };

  const displayPdfUrl = getFileUrl(currentPdf);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit Pink130
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
            <label htmlFor="video" className="block text-sm font-medium text-gray-700">
              Video URL (optional)
            </label>
            <input
              type="url"
              id="video"
              name="video"
              value={formData.video}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.video ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter video URL"
              maxLength={255}
              aria-invalid={!!errors.video}
              aria-describedby={errors.video ? 'video-error' : undefined}
            />
            {errors.video && (
              <p id="video-error" className="mt-1 text-sm text-red-500">
                {errors.video}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="pdf_file" className="block text-sm font-medium text-gray-700">
              PDF File (optional)
            </label>
            {displayPdfUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current PDF:</p>
                <a
                  href={displayPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  View Current PDF
                </a>
              </div>
            )}
            <input
              type="file"
              id="pdf_file"
              name="pdf_file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.pdf_file && (
              <p id="pdf_file-error" className="mt-1 text-sm text-red-500">
                {errors.pdf_file as string}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 5MB. Allowed type: PDF.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/pink-130')}
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
                'Update Pink130'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPink130;