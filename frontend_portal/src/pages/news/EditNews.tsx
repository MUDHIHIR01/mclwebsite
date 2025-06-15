import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  category: string;
  description: string;
  news_img: File | null;
  pdf_file: File | null;
}

const EditNews: React.FC = () => {
  const navigate = useNavigate();
  const { news_id } = useParams<{ news_id: string }>();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    news_img: null,
    pdf_file: null,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentPdf, setCurrentPdf] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({
    category: '',
    description: '',
    news_img: undefined,
    pdf_file: undefined,
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchNews = async () => {
      if (!news_id) {
        toast.error('News ID is missing.');
        navigate('/news');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/news/${news_id}`);
        setFormData({
          category: response.data.news?.category || '',
          description: response.data.news?.description || '',
          news_img: null,
          pdf_file: null,
        });
        setCurrentImage(response.data.news?.news_img || null);
        setCurrentPdf(response.data.news?.pdf_file || null);
      } catch (error) {
        toast.error('Failed to fetch news record');
        console.error("Fetch error:", error);
        navigate('/news');
      }
    };

    fetchNews();
  }, [news_id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.length > 255) {
      newErrors.category = 'Category must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.news_img) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.news_img.type)) {
        (newErrors.news_img as any) = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.news_img.size > 2 * 1024 * 1024) {
        (newErrors.news_img as any) = 'Image size must not exceed 2MB';
      }
    }

    if (formData.pdf_file) {
      if (!['application/pdf'].includes(formData.pdf_file.type)) {
        (newErrors.pdf_file as any) = 'Only PDF files are allowed';
      } else if (formData.pdf_file.size > 2 * 1024 * 1024) {
        (newErrors.pdf_file as any) = 'PDF size must not exceed 2MB';
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
    if (formData.news_img) {
      payload.append('news_img', formData.news_img);
    }
    if (formData.pdf_file) {
      payload.append('pdf_file', formData.pdf_file);
    }

    try {
      const response = await axiosInstance.post(`/api/news/${news_id}/update`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message || 'News record updated successfully');
      if (response.data.news?.news_img) {
        setCurrentImage(response.data.news.news_img);
        setFormData((prev) => ({ ...prev, news_img: null }));
      }
      if (response.data.news?.pdf_file) {
        setCurrentPdf(response.data.news.pdf_file);
        setFormData((prev) => ({ ...prev, pdf_file: null }));
      }
      setTimeout(() => navigate('/news'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update news record';
      const backendErrors = error.response?.data?.errors || {};
      const formattedErrors: Partial<FormData> = {};
      for (const key in backendErrors) {
        if (key in formData) {
          (formattedErrors as any)[key] = backendErrors[key][0];
        }
      }
      setErrors((prev) => ({ ...prev, ...formattedErrors }));
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

  const displayImageUrl = getFileUrl(currentImage);
  const displayPdfUrl = getFileUrl(currentPdf);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit News
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
            <label htmlFor="news_img" className="block text-sm font-medium text-gray-700">
              News Image (optional)
            </label>
            {displayImageUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img
                  src={displayImageUrl}
                  alt="Current News"
                  className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=LoadError';
                    (e.currentTarget as HTMLImageElement).alt = 'Error loading current image';
                    console.warn("Error loading current image from URL:", displayImageUrl);
                  }}
                />
              </div>
            )}
            <input
              type="file"
              id="news_img"
              name="news_img"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.news_img && (
              <p id="news_img-error" className="mt-1 text-sm text-red-500">
                {errors.news_img as string}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
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
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed type: PDF.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/news')}
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
                'Update News'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNews;