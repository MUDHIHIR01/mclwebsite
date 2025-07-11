import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  category: string;
  description: string;
  news_img: File | null;
  pdf_file: File | null;
}

interface Errors {
  category: string;
  description: string;
  news_img: string;
  pdf_file: string;
}

const AddNews: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    news_img: null,
    pdf_file: null,
  });
  const [errors, setErrors] = useState<Errors>({
    category: '',
    description: '',
    news_img: '',
    pdf_file: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    setErrors((prev: Errors) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData((prev: FormData) => ({ ...prev, [name]: file }));
    setErrors((prev: Errors) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {
      category: '',
      description: '',
      news_img: '',
      pdf_file: '',
    };

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.length > 255) {
      newErrors.category = 'Category must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 100000) {
      newErrors.description = 'Description must not exceed 100000 characters';
    }

    if (formData.news_img) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.news_img.type)) {
        newErrors.news_img = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.news_img.size > 20 * 1024 * 1024) {
        newErrors.news_img = 'Image size must not exceed 5MB';
      }
    }

    if (formData.pdf_file) {
      if (!['application/pdf'].includes(formData.pdf_file.type)) {
        newErrors.pdf_file = 'Only PDF files are allowed';
      } else if (formData.pdf_file.size > 2 * 1024 * 1024) {
        newErrors.pdf_file = 'PDF size must not exceed 2MB';
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('category', formData.category);
      payload.append('description', formData.description || '');
      if (formData.news_img) {
        payload.append('news_img', formData.news_img);
      }
      if (formData.pdf_file) {
        payload.append('pdf_file', formData.pdf_file);
      }

      const response = await axiosInstance.post('/api/news', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'News record created successfully', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/news'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create news record';
      const backendErrors: Partial<Errors> = error.response?.data?.errors || {};
      setErrors((prev: Errors) => ({
        ...prev,
        category: backendErrors.category || '',
        description: backendErrors.description || '',
        news_img: backendErrors.news_img || '',
        pdf_file: backendErrors.pdf_file || '',
      }));
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Create New News
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter category"
              maxLength={255}
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'category-error' : undefined}
              required
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
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter description"
              maxLength={100000}
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
            <input
              type="file"
              id="news_img"
              name="news_img"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              aria-describedby={errors.news_img ? 'news_img-error' : 'news_img-info'}
            />
            {errors.news_img && (
              <p id="news_img-error" className="mt-1 text-sm text-red-500">
                {errors.news_img}
              </p>
            )}
            <p id="news_img-info" className="mt-1 text-xs text-gray-500">
              Max file size: 5MB. Allowed types: JPG, PNG, GIF.
            </p>
          </div>
          <div>
            <label htmlFor="pdf_file" className="block text-sm font-medium text-gray-700">
              PDF File (optional)
            </label>
            <input
              type="file"
              id="pdf_file"
              name="pdf_file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              aria-describedby={errors.pdf_file ? 'pdf_file-error' : 'pdf_file-info'}
            />
            {errors.pdf_file && (
              <p id="pdf_file-error" className="mt-1 text-sm text-red-500">
                {errors.pdf_file}
              </p>
            )}
            <p id="pdf_file-info" className="mt-1 text-xs text-gray-500">
              Max file size: 2MB. Allowed type: PDF.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/news')}
              className="w-full sm:w-40 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-md text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-40 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md text-sm sm:text-base ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
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
                  Creating...
                </div>
              ) : (
                'Create News'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNews;