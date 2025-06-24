import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Describes the data for the form submission
interface FormData {
  heading: string;
  description: string;
  home_img: File | null;
}

// **FIX 1: Create a dedicated interface for form error messages.**
interface FormErrors {
    heading?: string;
    description?: string;
    home_img?: string;
}

// Describes the data shape from the API
interface GivingBackHomeData {
    gb_home_id: number;
    heading: string;
    description: string;
    home_img: string;
}

const EditGivingBackHome: React.FC = () => {
  const navigate = useNavigate();
  // Ensure the param name matches your route, e.g., /edit/giving-back-home/:gbHomeId
  const { gbHomeId } = useParams<{ gbHomeId: string }>(); 
  const [formData, setFormData] = useState<FormData>({
    heading: '',
    description: '',
    home_img: null,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  // **FIX 2: Use the new FormErrors interface for the errors state.**
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGivingBackHome = async () => {
      if (!gbHomeId) {
        toast.error('Giving Back Home ID is missing.');
        navigate('/giving-back');
        return;
      }
      try {
        const response = await axiosInstance.get<GivingBackHomeData>(`/api/giving-back-homes/${gbHomeId}`);
        const data = response.data;
        setFormData({
          heading: data.heading || '',
          description: data.description || '',
          home_img: null,
        });
        setCurrentImage(data.home_img);
      } catch (error) {
        toast.error('Failed to fetch Giving Back Home entry');
        console.error("Fetch error:", error);
        navigate('/giving-back');
      }
    };

    fetchGivingBackHome();
  }, [gbHomeId, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    // **FIX 3: Type the newErrors object with FormErrors.**
    const newErrors: FormErrors = {};

    if (!formData.heading.trim()) {
      newErrors.heading = 'Heading is required';
    }

    if (formData.home_img) {
        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.home_img.type)) {
          // This is now type-safe
          newErrors.home_img = 'Only JPEG, PNG, JPG, or GIF files are allowed';
        } else if (formData.home_img.size > 2 * 1024 * 1024) {
          // This is now type-safe
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

    try {
      // NOTE: For updates with FormData, use POST. Laravel handles it with a hidden _method field if needed.
      const response = await axiosInstance.post(`/api/giving-back-homes/${gbHomeId}/update`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Giving Back Home updated successfully');
      
      // If the API returns the new image path, update the state
      if (response.data.home_img) {
          setCurrentImage(response.data.home_img);
      }
      setFormData(prev => ({...prev, home_img: null})); // Clear the file input

      setTimeout(() => navigate('/giving-back'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update entry.';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null): string | undefined => {
    if (!imagePath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
  };
  
  const displayImageUrl = getImageUrl(currentImage);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Edit Giving Back Home
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields */}
          <div>
            <label htmlFor="heading" className="block text-sm font-medium text-gray-700">Heading *</label>
            <input
              type="text"
              id="heading"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 ${errors.heading ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.heading && <p className="mt-1 text-sm text-red-500">{errors.heading}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="home_img" className="block text-sm font-medium text-gray-700">Image (optional)</label>
            {displayImageUrl && (
                <div className="my-2">
                    <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                    <img
                        src={displayImageUrl}
                        alt="Current Giving Back Home"
                        className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200"
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/128x128?text=LoadError' }}
                    />
                </div>
            )}
            <input
              type="file"
              id="home_img"
              name="home_img"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0"
            />
            {errors.home_img && (
              <p className="mt-1 text-sm text-red-500">
                {/* **FIX 4: Remove the `as string` cast.** This is now type-safe. */}
                {errors.home_img}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB.</p>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/giving-back')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? 'Updating...' : 'Update Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGivingBackHome;