import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the form data the user interacts with
interface LeadershipHomeFormData {
  heading: string;
  description: string;
  home_img: File | null;
}

// A dedicated type for form errors. Each property is optional and holds a string message.
type FormErrors = {
  [K in keyof LeadershipHomeFormData]?: string;
};

// Interface for the data received from the API
interface ApiLeadershipHomeData {
  leadership_home_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

const EditLeadershipHome = () => {
  const navigate = useNavigate();
  const { leadership_home_id } = useParams<{ leadership_home_id: string }>();

  const [formData, setFormData] = useState<LeadershipHomeFormData>({
    heading: '',
    description: '',
    home_img: null,
  });

  // FIX: Use the new FormErrors type and initialize with an empty object.
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start true for initial fetch

  useEffect(() => {
    const fetchLeadershipHome = async () => {
      if (!leadership_home_id) {
        toast.error('Leadership Home ID is missing.');
        navigate('/leadership/home');
        return;
      }
      try {
        const response = await axiosInstance.get<ApiLeadershipHomeData>(`/api/leadership-homes/${leadership_home_id}`);
        setFormData({
          heading: response.data.heading || '',
          description: response.data.description || '',
          home_img: null, // Always start with null for a new upload
        });
        setCurrentImage(response.data.home_img);
      } catch (error) {
        toast.error('Failed to fetch leadership home entry');
        console.error("Fetch error:", error);
        navigate('/leadership/home');
      } finally {
        setLoading(false);
      }
    };

    fetchLeadershipHome();
  }, [leadership_home_id, navigate]);

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
    // FIX: Type newErrors with our dedicated FormErrors type.
    const newErrors: FormErrors = {};

    if (!formData.heading.trim()) newErrors.heading = 'Heading is required';
    else if (formData.heading.length > 255) newErrors.heading = 'Heading must not exceed 255 characters';

    if (formData.description && formData.description.length > 1000) newErrors.description = 'Description must not exceed 1000 characters';
    
    if (formData.home_img) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.home_img.type)) {
        // FIX: No cast needed. This assignment is now valid.
        newErrors.home_img = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.home_img.size > 2 * 1024 * 1024) {
        // FIX: No cast needed.
        newErrors.home_img = 'Image size must not exceed 2MB';
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
    payload.append('heading', formData.heading);
    payload.append('description', formData.description || '');
    if (formData.home_img) {
      payload.append('home_img', formData.home_img);
    }
    // Note: Your backend should handle the case where 'home_img' is not sent,
    // which means "do not update the image".

    try {
      // Use POST with method override for file uploads as some backends prefer it
      payload.append('_method', 'PUT'); 
      const response = await axiosInstance.post(`/api/leadership-homes/${leadership_home_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message || 'Leadership home entry updated successfully');
      setFormData((prev) => ({ ...prev, home_img: null })); // Clear file input
      if (response.data.leadership_home?.home_img) {
        setCurrentImage(response.data.leadership_home.home_img); // Update displayed image
      }
      setTimeout(() => navigate('/leadership/home'), 2000);
    } catch (error: unknown) {
      let errorMessage = 'Failed to update leadership home entry';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        const backendErrors = error.response.data?.errors;
        if (backendErrors) {
          const formattedErrors: FormErrors = {};
          for (const key in backendErrors) {
            if (Object.prototype.hasOwnProperty.call(formData, key)) {
              formattedErrors[key as keyof FormErrors] = backendErrors[key][0];
            }
          }
          setErrors(prev => ({ ...prev, ...formattedErrors }));
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null): string | undefined => {
    if (!imagePath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    const path = imagePath.replace(/^\//, '');
    return `${baseUrl}/${path}`;
  };

  if (loading && !formData.heading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="text-lg font-semibold">Loading...</div></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Edit Leadership Home Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields */}
          <div>
            <label htmlFor="heading" className="block text-sm font-medium text-gray-700">Heading <span className="text-red-500">*</span></label>
            <input type="text" id="heading" name="heading" value={formData.heading} onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-sm ${errors.heading ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.heading && <p className="mt-1 text-sm text-red-500">{errors.heading}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-sm ${errors.description ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="home_img" className="block text-sm font-medium text-gray-700">Change Image (optional)</label>
            {currentImage && (
              <div className="my-2"><p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img src={getImageUrl(currentImage)} alt="Current Leadership Home" className="h-32 w-auto object-contain rounded border"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
            <input type="file" id="home_img" name="home_img" accept="image/jpeg,image/png,image/jpg,image/gif" onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            
            {/* FIX: No cast needed. errors.home_img is a string and can be rendered directly. */}
            {errors.home_img && <p className="mt-1 text-sm text-red-500">{errors.home_img}</p>}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button type="button" onClick={() => navigate('/leadership/home')} disabled={loading} className="w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition shadow-sm text-sm disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={loading} className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Updating...
                </div>
              ) : 'Update Leadership Home'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadershipHome;