import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  category: string;
  description: string;
  video_link: string;
  pdf_file: File | null;
}

interface FormErrors {
  category?: string;
  description?: string;
  video_link?: string;
  pdf_file?: string;
}

const AddAboutMwananchi: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    video_link: '',
    pdf_file: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, pdf_file: file }));
    setErrors((prev) => ({ ...prev, pdf_file: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    else if (formData.category.length > 255) newErrors.category = 'Category must not exceed 255 characters';
    if (formData.description.length > 1000) newErrors.description = 'Description must not exceed 1000 characters';
    if (formData.video_link && !/^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+(\?si=[a-zA-Z0-9_-]+)?$/.test(formData.video_link)) {
      newErrors.video_link = 'Invalid YouTube embed URL';
    }
    if (formData.pdf_file) {
      if (formData.pdf_file.type !== 'application/pdf') newErrors.pdf_file = 'File must be a PDF';
      else if (formData.pdf_file.size > 10 * 1024 * 1024) newErrors.pdf_file = 'PDF must not exceed 10MB';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('category', formData.category);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('video_link', formData.video_link || '');
    if (formData.pdf_file) formDataToSend.append('pdf_file', formData.pdf_file);

    try {
      const response = await axiosInstance.post('/api/about-mwananchi', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Entry created successfully');
      setTimeout(() => navigate('/about-mwananchi'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create entry';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create New About Mwananchi</h2>
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category *</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`mt-1 w-full rounded-md border p-3 text-sm ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500`}
              placeholder="Enter category"
              maxLength={255}
            />
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`mt-1 w-full rounded-md border p-3 text-sm ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500`}
              placeholder="Enter description (optional)"
              maxLength={1000}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>
          <div>
            <label htmlFor="video_link" className="block text-sm font-medium text-gray-700">YouTube Video Embed Link (optional)</label>
            <input
              type="text"
              id="video_link"
              name="video_link"
              value={formData.video_link}
              onChange={handleChange}
              className={`mt-1 w-full rounded-md border p-3 text-sm ${errors.video_link ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500`}
              placeholder="e.g., https://www.youtube.com/embed/video_id"
            />
            {errors.video_link && <p className="mt-1 text-sm text-red-500">{errors.video_link}</p>}
            <p className="mt-1 text-xs text-gray-500">Enter a valid YouTube embed URL.</p>
          </div>
          <div>
            <label htmlFor="pdf_file" className="block text-sm font-medium text-gray-700">PDF File (optional)</label>
            <input
              type="file"
              id="pdf_file"
              name="pdf_file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.pdf_file && <p className="mt-1 text-sm text-red-500">{errors.pdf_file}</p>}
            <p className="mt-1 text-xs text-gray-500">Upload a PDF file (max 10MB).</p>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/about-mwananchi')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 text-white mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </div>
              ) : (
                'Create About Mwananchi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAboutMwananchi;