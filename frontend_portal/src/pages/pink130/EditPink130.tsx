import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the form data
interface FormDataState {
  category: string;
  description: string;
  video: string;
  pdf_file: File | null;
}

// Type for the validation errors object
type FormErrors = Partial<Record<keyof FormDataState, string>>;

const EditPink130: React.FC = () => {
  const navigate = useNavigate();
  const { pinkId } = useParams<{ pinkId: string }>();

  // State for form data
  const [formData, setFormData] = useState<FormDataState>({
    category: '',
    description: '',
    video: '',
    pdf_file: null,
  });

  // State for the currently saved PDF path (to display a link)
  const [currentPdfPath, setCurrentPdfPath] = useState<string | null>(null);
  
  // State for validation errors
  const [errors, setErrors] = useState<FormErrors>({});
  
  // State for the submission loading state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // State for the initial data fetching loading state
  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    const fetchPink130 = async () => {
      if (!pinkId) {
        toast.error('Pink130 ID is missing.');
        navigate('/pink-130');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/pink-130/${pinkId}`);
        const data = response.data.pink130;
        setFormData({
          category: data?.category || '',
          description: data?.description || '',
          video: data?.video || '',
          pdf_file: null, // Always start with null for the file input
        });
        setCurrentPdfPath(data?.pdf_file || null);
      } catch (error) {
        toast.error('Failed to fetch pink-130 record');
        console.error("Fetch error:", error);
        navigate('/pink-130');
      } finally {
        setIsFetching(false);
      }
    };

    fetchPink130();
  }, [pinkId]); // `navigate` is stable and not needed as a dependency

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error on change
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, pdf_file: file }));
    if (errors.pdf_file) {
      setErrors((prev) => ({ ...prev, pdf_file: '' })); // Clear file error
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    } else if (formData.category.length > 255) {
      newErrors.category = 'Category must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    const videoUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)\/.+$/i;
    if (formData.video && !videoUrlPattern.test(formData.video)) {
      newErrors.video = 'Please enter a valid video URL (e.g., YouTube, Vimeo)';
    }

    if (formData.pdf_file) {
      if (formData.pdf_file.type !== 'application/pdf') {
        newErrors.pdf_file = 'Only PDF files are allowed';
      } else if (formData.pdf_file.size > 5 * 1024 * 1024) { // 5MB
        newErrors.pdf_file = 'PDF file size must not exceed 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const payload = new FormData();
    payload.append('category', formData.category);
    payload.append('description', formData.description || '');
    payload.append('video', formData.video || '');
    if (formData.pdf_file) {
      payload.append('pdf_file', formData.pdf_file);
    }

    try {
      const response = await axiosInstance.post(`/api/pink-130/${pinkId}/update`, payload);
      toast.success(response.data.message || 'Record updated successfully');
      
      // Update current PDF path if a new one was uploaded and returned
      if (response.data.pink130?.pdf_file) {
        setCurrentPdfPath(response.data.pink130.pdf_file);
      }
      setFormData(prev => ({ ...prev, pdf_file: null })); // Clear file input after submission
      
      setTimeout(() => navigate('/pink-130'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update record';
      const backendErrors = error.response?.data?.errors || {};
      
      setErrors(prev => ({ ...prev, ...backendErrors }));
      toast.error(errorMessage);
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileUrl = (filePath: string | null): string | undefined => {
    if (!filePath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || '').replace(/\/$/, '');
    return `${baseUrl}/${filePath.replace(/^\//, '')}`;
  };

  // Show a loading indicator while fetching initial data
  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Loading editor...</p>
      </div>
    );
  }

  const displayPdfUrl = getFileUrl(currentPdfPath);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit Pink130
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Input */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text" id="category" name="category" value={formData.category} onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
              aria-invalid={!!errors.category}
            />
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="description" name="description" value={formData.description} onChange={handleChange} rows={4}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
               aria-invalid={!!errors.description}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Video URL Input */}
          <div>
            <label htmlFor="video" className="block text-sm font-medium text-gray-700">
              Video URL (optional)
            </label>
            <input
              type="url" id="video" name="video" value={formData.video} onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm ${errors.video ? 'border-red-500' : 'border-gray-300'}`}
               aria-invalid={!!errors.video}
            />
            {errors.video && <p className="mt-1 text-sm text-red-500">{errors.video}</p>}
          </div>
          
          {/* PDF File Input */}
          <div>
            <label htmlFor="pdf_file" className="block text-sm font-medium text-gray-700">
              PDF File (optional)
            </label>
            {displayPdfUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current PDF:</p>
                <a href={displayPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 text-sm">
                  View Current PDF
                </a>
              </div>
            )}
            <input
              type="file" id="pdf_file" name="pdf_file" accept="application/pdf" onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.pdf_file && <p className="mt-1 text-sm text-red-500">{errors.pdf_file}</p>}
            <p className="mt-1 text-xs text-gray-500">Max file size: 5MB. Allowed type: PDF.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button" onClick={() => navigate('/pink-130')}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center justify-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting ? 'Updating...' : 'Update Pink130'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPink130;