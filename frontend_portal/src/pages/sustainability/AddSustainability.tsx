import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// This interface remains the same, representing the form's data.
interface FormData {
  sustain_category: string;
  description: string;
  weblink: string;
  sustain_pdf_file: File | null;
  sustain_image_file: File | null;
}

// *** FIX 1: Create a dedicated interface for form errors. ***
// All properties are optional strings, which is what your error messages are.
interface FormErrors {
  sustain_category?: string;
  description?: string;
  weblink?: string;
  sustain_pdf_file?: string;
  sustain_image_file?: string;
}

// *** FIX 2: Update the validation function to use the new FormErrors type. ***
export const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.sustain_category.trim()) {
    errors.sustain_category = 'Category is required';
  } else if (formData.sustain_category.length > 255) {
    errors.sustain_category = 'Category must not exceed 255 characters';
  }

  if (formData.description && formData.description.length > 1000) {
    errors.description = 'Description must not exceed 1000 characters';
  }

  if (formData.weblink && !/^(https?:\/\/[^\s$.?#].[^\s]*)$/.test(formData.weblink)) {
    errors.weblink = 'Please enter a valid URL';
  } else if (formData.weblink && formData.weblink.length > 255) {
    errors.weblink = 'Web link must not exceed 255 characters';
  }

  if (formData.sustain_pdf_file) {
    if (formData.sustain_pdf_file.type !== 'application/pdf') {
      // Now this assignment is valid because errors.sustain_pdf_file is a string.
      errors.sustain_pdf_file = 'Only PDF files are allowed';
    } else if (formData.sustain_pdf_file.size > 2 * 1024 * 1024) {
      errors.sustain_pdf_file = 'PDF size must not exceed 2MB';
    }
  }

  if (formData.sustain_image_file) {
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(formData.sustain_image_file.type)) {
      // This assignment is also valid now.
      errors.sustain_image_file = 'Only PNG, JPEG, or JPG files are allowed';
    } else if (formData.sustain_image_file.size > 2 * 1024 * 1024) {
      errors.sustain_image_file = 'Image size must not exceed 2MB';
    }
  }

  return errors;
};

const AddSustainability: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    sustain_category: '',
    description: '',
    weblink: '',
    sustain_pdf_file: null,
    sustain_image_file: null,
  });
  
  // *** FIX 3: Update the errors state to use the FormErrors type. ***
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined })); // Use undefined to clear error
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'sustain_pdf_file' | 'sustain_image_file') => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [field]: file }));
    setErrors((prev) => ({ ...prev, [field]: undefined })); // Use undefined to clear error
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('sustain_category', formData.sustain_category);
      payload.append('description', formData.description || '');
      payload.append('weblink', formData.weblink || '');
      if (formData.sustain_pdf_file) {
        payload.append('sustain_pdf_file', formData.sustain_pdf_file);
      }
      if (formData.sustain_image_file) {
        payload.append('sustain_image_file', formData.sustain_image_file);
      }

      const response = await axiosInstance.post('/api/sustainability', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Sustainability record created successfully', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/sustainability'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create sustainability record';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors);
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
          Create New Sustainability Record
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... (no changes needed in the form inputs) ... */}
          <div>
            <label htmlFor="sustain_category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <input
              type="text"
              id="sustain_category"
              name="sustain_category"
              value={formData.sustain_category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter category"
              maxLength={255}
              aria-invalid={!!errors.sustain_category}
              aria-describedby={errors.sustain_category ? 'sustain_category-error' : undefined}
            />
            {errors.sustain_category && (
              <p id="sustain_category-error" className="mt-1 text-sm text-red-500">
                {errors.sustain_category}
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
              maxLength={1000}
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
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter web link (e.g., https://example.com)"
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
            <label htmlFor="sustain_pdf_file" className="block text-sm font-medium text-gray-700">
              PDF File (optional)
            </label>
            <input
              type="file"
              id="sustain_pdf_file"
              name="sustain_pdf_file"
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, 'sustain_pdf_file')}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.sustain_pdf_file && (
              <p className="mt-1 text-sm text-gray-600">Selected: {formData.sustain_pdf_file.name}</p>
            )}
            {/* This JSX is now valid because errors.sustain_pdf_file is a string. */}
            {errors.sustain_pdf_file && (
              <p id="sustain_pdf_file-error" className="mt-1 text-sm text-red-500">
                {errors.sustain_pdf_file}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed type: PDF.</p>
          </div>
          <div>
            <label htmlFor="sustain_image_file" className="block text-sm font-medium text-gray-700">
              Image File (optional)
            </label>
            <input
              type="file"
              id="sustain_image_file"
              name="sustain_image_file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => handleFileChange(e, 'sustain_image_file')}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.sustain_image_file && (
              <p className="mt-1 text-sm text-gray-600">Selected: {formData.sustain_image_file.name}</p>
            )}
            {/* This JSX is also valid now. */}
            {errors.sustain_image_file && (
              <p id="sustain_image_file-error" className="mt-1 text-sm text-red-500">
                {errors.sustain_image_file}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: PNG, JPEG, JPG.</p>
          </div>
          {/* ... (no changes needed in the form buttons) ... */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/sustainability')}
              className="w-full sm:w-40 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-md text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-40 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md text-sm sm:text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                'Create Sustainability'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSustainability;