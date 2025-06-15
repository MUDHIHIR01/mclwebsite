import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormDataState {
  standard_category: string;
  standard_file: File | null;
  weblink: string;
  description: string;
}

const EditOurStandards: React.FC = () => {
  const navigate = useNavigate();
  const { 'our-standardid': ourStandardId } = useParams<{ 'our-standardid': string }>();
  const [formData, setFormData] = useState<FormDataState>({
    standard_category: '',
    standard_file: null,
    weblink: '',
    description: '',
  });
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormDataState>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchStandard = async () => {
      if (!ourStandardId) {
        toast.error('Our Standard ID is missing.', { position: 'top-right' });
        navigate('/our_standards');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/our-standard/${ourStandardId}`);
        if (!response.data.our_standard) {
          throw new Error('No standard record found in response');
        }
        setFormData({
          standard_category: response.data.our_standard.standard_category || '',
          standard_file: null,
          weblink: response.data.our_standard.weblink || '',
          description: response.data.our_standard.description || '',
        });
        setCurrentFile(response.data.our_standard.standard_file || null);
      } catch (error: any) {
        console.error('Fetch error:', error.response || error.message || error);
        toast.error(error.response?.data?.error || 'Failed to fetch our standard record', {
          position: 'top-right',
        });
        navigate('/our_standards');
      }
    };

    fetchStandard();
  }, [ourStandardId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, standard_file: file }));
    setErrors((prev) => ({ ...prev, standard_file: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormDataState> = {};

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
      if (
        !['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(
          formData.standard_file.type
        )
      ) {
        (newErrors.standard_file as any) = 'Only PDF, XLS, or XLSX files are allowed';
      } else if (formData.standard_file.size > 2 * 1024 * 1024) {
        (newErrors.standard_file as any) = 'File size must not exceed 2MB';
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
    payload.append('standard_category', formData.standard_category);
    payload.append('weblink', formData.weblink || '');
    payload.append('description', formData.description || '');
    if (formData.standard_file) {
      payload.append('standard_file', formData.standard_file);
    }
    payload.append('_method', 'POST'); // Override POST to PUT for Laravel

    try {
      const response = await axiosInstance.post(`/api/our-standard/${ourStandardId}/update`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message || 'Our Standard record updated successfully', {
        position: 'top-right',
      });
      if (response.data.our_standard?.standard_file) {
        setCurrentFile(response.data.our_standard.standard_file);
        setFormData((prev) => ({ ...prev, standard_file: null }));
      }
      setTimeout(() => navigate('/our_standards'), 2000);
    } catch (error: any) {
      console.error('Update error:', error.response || error.message || error);
      const errorMessage = error.response?.data?.error || 'Failed to update our standard record';
      const backendErrors = error.response?.data?.errors || {};
      setErrors((prev) => ({
        ...prev,
        standard_category: backendErrors.standard_category?.[0] || prev.standard_category,
        weblink: backendErrors.weblink?.[0] || prev.weblink,
        description: backendErrors.description?.[0] || prev.description,
        standard_file: backendErrors.standard_file?.[0] || prev.standard_file,
      }));
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (filePath: string | null): string | undefined => {
    if (!filePath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    return `${baseUrl}/${filePath}`;
  };

  const displayFileUrl = getFileUrl(currentFile);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">Edit Our Standard</h2>
        {loading && (
          <div className="flex justify-center mb-4">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="standard_category" className="block text-sm font-medium text-gray-700">
              Standard Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="standard_category"
              name="standard_category"
              value={formData.standard_category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.standard_category ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter standard category"
              maxLength={255}
              aria-invalid={!!errors.standard_category}
              aria-describedby={errors.standard_category ? 'standard_category-error' : undefined}
            />
            {errors.standard_category && (
              <p id="standard_category-error" className="mt-1 text-sm text-red-500">{errors.standard_category}</p>
            )}
          </div>
          <div>
            <label htmlFor="weblink" className="block text-sm font-medium text-gray-700">Weblink (optional)</label>
            <input
              type="url"
              id="weblink"
              name="weblink"
              value={formData.weblink}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.weblink ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter weblink (e.g., https://example.com)"
              maxLength={255}
              aria-invalid={!!errors.weblink}
              aria-describedby={errors.weblink ? 'weblink-error' : undefined}
            />
            {errors.weblink && <p id="weblink-error" className="mt-1 text-sm text-red-500">{errors.weblink}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (optional)</label>
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
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          <div>
            <label htmlFor="standard_file" className="block text-sm font-medium text-gray-700">Standard File (optional)</label>
            {displayFileUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current File:</p>
                <a
                  href={displayFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 text-sm font-semibold"
                >
                  View Current File
                </a>
              </div>
            )}
            <input
              type="file"
              id="standard_file"
              name="standard_file"
              accept=".pdf,.xls,.xlsx"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.standard_file && (
              <p id="standard_file-error" className="mt-1 text-sm text-red-500">{errors.standard_file as string}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: PDF, XLS, XLSX.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/our_standards')}
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </div>
              ) : (
                'Update Our Standard'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOurStandards;