import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Renamed for clarity and consistency
interface FormData {
  standard_category: string;
  standard_file: File | null;
  weblink: string;
  description: string;
}

// ***FIX 1: Define a dedicated type for form errors***
// This type correctly represents an object holding optional string-based
// validation messages for each field in FormData.
type FormErrors = {
  [K in keyof FormData]?: string;
};

const EditOurStandards: React.FC = () => {
  const navigate = useNavigate();
  const { 'our-standardid': ourStandardId } = useParams<{ 'our-standardid': string }>();
  const [formData, setFormData] = useState<FormData>({
    standard_category: '',
    standard_file: null,
    weblink: '',
    description: '',
  });
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  // ***FIX 2: Use the new FormErrors type for the errors state***
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState(true); // Added to manage loading state

  useEffect(() => {
    setFetching(true);
    const fetchStandard = async () => {
      if (!ourStandardId) {
        toast.error('Our Standard ID is missing.', { position: 'top-right' });
        navigate('/our_standards');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/our-standard/${ourStandardId}`);
        const standardData = response.data.our_standard;
        if (!standardData) {
          throw new Error('No standard record found in response');
        }
        setFormData({
          standard_category: standardData.standard_category || '',
          standard_file: null, // Always start with no new file selected
          weblink: standardData.weblink || '',
          description: standardData.description || '',
        });
        setCurrentFile(standardData.standard_file || null);
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to fetch our standard record', {
          position: 'top-right',
        });
        navigate('/our_standards');
      } finally {
        setFetching(false);
      }
    };

    fetchStandard();
  }, [ourStandardId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, standard_file: file }));
    setErrors((prev) => ({ ...prev, standard_file: undefined }));
  };

  const validateForm = (): boolean => {
    // ***FIX 3: Use the FormErrors type here***
    const newErrors: FormErrors = {};

    if (!formData.standard_category.trim()) {
      newErrors.standard_category = 'Standard category is required';
    } else if (formData.standard_category.length > 255) {
      newErrors.standard_category = 'Standard category must not exceed 255 characters';
    }

    if (formData.weblink && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(formData.weblink)) {
      newErrors.weblink = 'Please enter a valid URL';
    }

    if (formData.standard_file) {
      if (
        !['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(
          formData.standard_file.type
        )
      ) {
        // ***FIX 4: Removed `(as any)`. This is now type-safe.***
        newErrors.standard_file = 'Only PDF, XLS, or XLSX files are allowed';
      } else if (formData.standard_file.size > 2 * 1024 * 1024) {
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
    const payload = new FormData();
    payload.append('standard_category', formData.standard_category);
    payload.append('weblink', formData.weblink || '');
    payload.append('description', formData.description || '');
    if (formData.standard_file) {
      payload.append('standard_file', formData.standard_file);
    }
    // Correct method for sending updates with form-data in some frameworks
    payload.append('_method', 'PUT');

    try {
      // Use POST but framework will interpret as PUT due to _method field
      const response = await axiosInstance.post(`/api/our-standard/${ourStandardId}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
      const errorMessage = error.response?.data?.error || 'Failed to update our standard record';
      const backendErrors = error.response?.data?.errors || {};
      
      // ***FIX 5: Simplified and corrected backend error handling***
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

  const getFileUrl = (filePath: string | null): string | undefined => {
    if (!filePath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    return `${baseUrl}/${filePath}`;
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
          Loading...
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Edit Our Standard</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... other form fields ... */}
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
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-sm ${
                errors.standard_category ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.standard_category && (
              <p className="mt-1 text-sm text-red-500">{errors.standard_category}</p>
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
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-sm ${
                errors.weblink ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.weblink && <p className="mt-1 text-sm text-red-500">{errors.weblink}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-sm ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          <div>
            <label htmlFor="standard_file" className="block text-sm font-medium text-gray-700">Standard File (optional)</label>
            {currentFile && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current File:</p>
                <a
                  href={getFileUrl(currentFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 text-sm"
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
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50"
            />
            {/* ***FIX 6: Removed `as string`. This is now type-safe and valid.*** */}
            {errors.standard_file && (
              <p id="standard_file-error" className="mt-1 text-sm text-red-500">{errors.standard_file}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: PDF, XLS, XLSX.</p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/our_standards')}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Updating...' : 'Update Our Standard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOurStandards;