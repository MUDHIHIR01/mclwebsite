import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// The data structure for the form itself
interface FormData {
  standard_category: string;
  standard_file: File | null;
  weblink: string;
  description: string;
}

// ***FIX 1: Define a dedicated type for form errors***
// This type maps the keys of FormData to optional string values,
// which is the correct type for storing validation messages.
type FormErrors = {
  [K in keyof FormData]?: string;
};

const AddOurStandards: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    standard_category: '',
    standard_file: null,
    weblink: '',
    description: '',
  });

  // ***FIX 2: Use the new FormErrors type for the errors state***
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the specific error message for the field being changed
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, standard_file: file }));
    // This is now type-safe. We are clearing the string-based error for standard_file.
    setErrors((prev) => ({ ...prev, standard_file: undefined }));
  };

  const validateForm = (): boolean => {
    // ***FIX 3: Use the FormErrors type for the local newErrors object***
    const newErrors: FormErrors = {};

    if (!formData.standard_category.trim()) {
      newErrors.standard_category = 'Standard category is required';
    } else if (formData.standard_category.length > 255) {
      newErrors.standard_category = 'Standard category must not exceed 255 characters';
    }

    if (formData.weblink && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(formData.weblink)) {
      newErrors.weblink = 'Please enter a valid URL';
    } else if (formData.weblink && formData.weblink.length > 255) {
      newErrors.weblink = 'Weblink must not exceed 255 characters';
    }

    if (formData.standard_file) {
      if (!['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(formData.standard_file.type)) {
        // This is now valid: assigning a string to a property that expects a string.
        newErrors.standard_file = 'Only PDF, XLS, or XLSX files are allowed';
      } else if (formData.standard_file.size > 2 * 1024 * 1024) {
        // This is also now valid.
        newErrors.standard_file = 'File size must not exceed 2MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('standard_category', formData.standard_category);
      payload.append('weblink', formData.weblink || '');
      payload.append('description', formData.description || '');
      if (formData.standard_file) {
        payload.append('standard_file', formData.standard_file);
      }

      const response = await axiosInstance.post('/api/our-standard', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Our Standard record created successfully', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/our_standards'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create our standard record';
      const backendErrors = error.response?.data?.errors || {};
      // This assignment is now type-safe, assuming the backend returns
      // an object with keys matching FormErrors.
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
          Create New Our Standard
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="standard_category" className="block text-sm font-medium text-gray-700">
              Standard Category *
            </label>
            <input
              type="text"
              id="standard_category"
              name="standard_category"
              value={formData.standard_category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter standard category"
              maxLength={255}
              aria-invalid={!!errors.standard_category}
              aria-describedby={errors.standard_category ? 'standard_category-error' : undefined}
            />
            {errors.standard_category && (
              <p id="standard_category-error" className="mt-1 text-sm text-red-500">
                {errors.standard_category}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="weblink" className="block text-sm font-medium text-gray-700">
              Weblink (optional)
            </label>
            <input
              type="url"
              id="weblink"
              name="weblink"
              value={formData.weblink}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter weblink (e.g., https://example.com)"
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
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="standard_file" className="block text-sm font-medium text-gray-700">
              Standard File (optional)
            </label>
            <input
              type="file"
              id="standard_file"
              name="standard_file"
              accept=".pdf,.xls,.xlsx"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {/* ***FIX 4: This JSX is now valid***
                errors.standard_file is now a string, which is a valid ReactNode. */}
            {errors.standard_file && (
              <p id="standard_file-error" className="mt-1 text-sm text-red-500">
                {errors.standard_file}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: PDF, XLS, XLSX.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/our_standards')}
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
                'Create Our Standard'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOurStandards;