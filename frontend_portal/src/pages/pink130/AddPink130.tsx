import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// The data structure for the form itself
interface FormData {
  category: string;
  description: string;
  video: string;
  pdf_file: File | null;
}

// ***FIX 1: Define a dedicated type for form errors***
// This type maps the keys of FormData to optional string values,
// which is the correct type for storing validation messages.
type FormErrors = {
  [K in keyof FormData]?: string;
};

const AddPink130: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    video: '',
    pdf_file: null,
  });
  
  // ***FIX 2: Use the new FormErrors type for the errors state***
  // Initialize with an empty object, which resolves the first error.
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the specific error message when the user types
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, pdf_file: file }));
    // This is now type-safe. We are clearing the string-based error.
    setErrors((prev) => ({ ...prev, pdf_file: undefined }));
  };

  const validateForm = (): boolean => {
    // ***FIX 3: Use the FormErrors type for the local newErrors object***
    const newErrors: FormErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.length > 255) {
      newErrors.category = 'Category must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\/.+$/i;
    if (formData.video && !videoUrlPattern.test(formData.video)) {
      newErrors.video = 'Please enter a valid video URL (e.g., YouTube, Vimeo)';
    }

    if (formData.pdf_file) {
      if (formData.pdf_file.type !== 'application/pdf') {
        // This assignment is now valid because newErrors.pdf_file expects a string.
        newErrors.pdf_file = 'Only PDF files are allowed';
      } else if (formData.pdf_file.size > 5 * 1024 * 1024) {
        newErrors.pdf_file = 'PDF file size must not exceed 5MB';
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
      const response = await axiosInstance.post('/api/pink-130', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Pink130 record created successfully', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/pink-130'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create pink-130 record';
      const backendErrors = error.response?.data?.errors || {};
      
      // Type-safe handling of backend errors
      const formattedErrors: FormErrors = {};
      for (const key in backendErrors) {
          if (Object.prototype.hasOwnProperty.call(formData, key)) {
              formattedErrors[key as keyof FormData] = backendErrors[key][0];
          }
      }
      setErrors(formattedErrors);
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
          Create New Pink130
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-3 text-base ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter category"
              maxLength={255}
              aria-invalid={!!errors.category}
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">
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
              className={`mt-1 block w-full rounded-md border shadow-sm p-3 text-base ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter description"
              maxLength={1000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
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
              className={`mt-1 block w-full rounded-md border shadow-sm p-3 text-base ${
                errors.video ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter video URL"
              maxLength={255}
            />
            {errors.video && (
              <p className="mt-1 text-sm text-red-500">
                {errors.video}
              </p>
            )}
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
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {/* ***FIX 4: This is now valid. errors.pdf_file is a string.*** */}
            {errors.pdf_file && (
              <p id="pdf_file-error" className="mt-1 text-sm text-red-500">
                {errors.pdf_file}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/pink-130')}
              className="w-full sm:w-40 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-40 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Creating...
                </div>
              ) : (
                'Create Pink130'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPink130;