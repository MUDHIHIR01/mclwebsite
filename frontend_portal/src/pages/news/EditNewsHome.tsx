import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the form's data structure
interface FormData {
  heading: string;
  description: string;
  home_img: File | null;
}

// Interface for the form's validation error messages
interface FormErrors {
  heading?: string;
  description?: string;
  home_img?: string;
}

// Interface for the data fetched from the API
interface NewsHomeData {
  news_home_id: number;
  heading: string | null;
  description: string | null;
  home_img: string | null;
}

/**
 * A form component for editing a "News Home" slider entry.
 * It allows updating the heading, description, and the associated image.
 */
const EditNewsHome: React.FC = () => {
  const navigate = useNavigate();
  const { news_home_id } = useParams<{ news_home_id: string }>();

  const [formData, setFormData] = useState<FormData>({
    heading: '',
    description: '',
    home_img: null,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  // Use the dedicated FormErrors interface for the errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchNewsHome = async () => {
      if (!news_home_id) {
        toast.error('News Home ID is missing.');
        navigate('/news/home');
        return;
      }
      try {
        const response = await axiosInstance.get<NewsHomeData>(`/api/news-homes/${news_home_id}`);
        setFormData({
          heading: response.data.heading || '',
          description: response.data.description || '',
          home_img: null, // Reset file input
        });
        setCurrentImage(response.data.home_img);
      } catch (error) {
        toast.error('Failed to fetch news home entry');
        console.error("Fetch error:", error);
        navigate('/news/home');
      }
    };
    fetchNewsHome();
  }, [news_home_id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, home_img: file }));
    if (errors.home_img) {
      setErrors((prev) => ({ ...prev, home_img: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.heading && formData.heading.length > 255) {
      newErrors.heading = 'Heading must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.home_img) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.home_img.type)) {
        newErrors.home_img = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.home_img.size > 2 * 1024 * 1024) { // 2MB
        newErrors.home_img = 'Image size must not exceed 2MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warn('Please fix the errors before submitting.');
      return;
    }

    setLoading(true);
    const payload = new FormData();

    // Append data to the payload
    payload.append('heading', formData.heading.trim());
    payload.append('description', formData.description.trim());
    if (formData.home_img) {
      payload.append('home_img', formData.home_img);
    }
    
    try {
      // Use POST with a _method override if the API is RESTful and expects PUT/PATCH for updates
      const response = await axiosInstance.post(`/api/news-homes/${news_home_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message || 'News home entry updated successfully!');
      setTimeout(() => navigate('/news/home'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update entry.';
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setErrors(backendErrors);
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null): string | null => {
    if (!imagePath) return null;
    const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
    return `${baseUrl}/${imagePath.replace(/^\//, "")}`;
  };

  const displayImageUrl = getImageUrl(currentImage);

  const inputBaseClasses = 'mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base';
  const inputBorderClasses = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  const inputErrorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500';

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit News Home Entry
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Heading */}
          <div>
            <label htmlFor="heading" className="block text-sm font-medium text-gray-700">Heading <span className="text-gray-500">(optional)</span></label>
            <input type="text" id="heading" name="heading" value={formData.heading} onChange={handleChange} className={`${inputBaseClasses} ${errors.heading ? inputErrorClasses : inputBorderClasses}`} placeholder="Enter heading" maxLength={255} />
            {errors.heading && <p className="mt-1 text-sm text-red-500">{errors.heading}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-gray-500">(optional)</span></label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className={`${inputBaseClasses} ${errors.description ? inputErrorClasses : inputBorderClasses}`} placeholder="Enter description" maxLength={1000} />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Image */}
          <div>
            <label htmlFor="home_img" className="block text-sm font-medium text-gray-700">Image <span className="text-gray-500">(optional, will replace current)</span></label>
            {displayImageUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img src={displayImageUrl} alt="Current News Home" className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
            )}
            <input type="file" id="home_img" name="home_img" accept="image/jpeg,image/png,image/jpg,image/gif" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {errors.home_img && <p className="mt-1 text-sm text-red-500">{errors.home_img}</p>}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button type="button" onClick={() => navigate('/news/home')} className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition shadow-sm font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={loading} className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-semibold flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Update News Home'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNewsHome;