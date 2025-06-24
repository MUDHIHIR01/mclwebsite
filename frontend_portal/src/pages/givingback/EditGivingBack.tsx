import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Describes the data for the form submission
interface FormDataState {
  givingBack_category: string;
  description: string;
  weblink: string;
  image_slider: File[] | null;
}

// **FIX 1: Create a dedicated interface for form error messages.**
interface FormErrors {
  givingBack_category?: string;
  description?: string;
  weblink?: string;
  image_slider?: string; // This will hold a single string error message.
}

// Describes the data shape coming from the API
interface GivingBackData {
    givingBack_category: string;
    description: string;
    weblink: string;
    image_slider: string; // The backend sends a JSON string of image paths
}

// Describes the nested structure of the API GET response
interface ApiGetResponse {
    giving_back: GivingBackData;
}

const EditGivingBack: React.FC = () => {
  const navigate = useNavigate();
  const { givingId } = useParams<{ givingId: string }>();
  const [formData, setFormData] = useState<FormDataState>({
    givingBack_category: '',
    description: '',
    weblink: '',
    image_slider: null,
  });
  const [currentImages, setCurrentImages] = useState<string[] | null>(null);
  // **FIX 2: Use the new FormErrors interface for the errors state.**
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchGivingBack = async () => {
      if (!givingId) {
        toast.error('Giving Back ID is missing.');
        navigate('/giving/back');
        return;
      }
      try {
        const response = await axiosInstance.get<ApiGetResponse>(`/api/giving-back/${givingId}`);
        const data = response.data.giving_back;
        setFormData({
          givingBack_category: data?.givingBack_category || '',
          description: data?.description || '',
          weblink: data?.weblink || '',
          image_slider: null,
        });
        // Safely parse the JSON string of image paths
        setCurrentImages(data?.image_slider ? JSON.parse(data.image_slider) : null);
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to fetch Giving Back record');
        navigate('/giving/back');
      }
    };

    fetchGivingBack();
  }, [givingId, navigate]);

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
    const files = e.target.files ? Array.from(e.target.files) : null;
    setFormData((prev) => ({ ...prev, image_slider: files }));
    if (errors.image_slider) {
        setErrors((prev) => ({ ...prev, image_slider: undefined }));
    }
  };

  const validateForm = (): boolean => {
    // **FIX 3: Type the newErrors object with FormErrors.**
    const newErrors: FormErrors = {};

    if (!formData.givingBack_category.trim()) {
      newErrors.givingBack_category = 'Category is required';
    }

    if (formData.weblink && !/^(https?:\/\/)/i.test(formData.weblink)) {
      newErrors.weblink = 'Please enter a valid URL';
    }

    if (formData.image_slider && formData.image_slider.length > 0) {
      for (const file of formData.image_slider) {
        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
          // **FIX 4: Remove the `(as any)` cast. This is now type-safe.**
          newErrors.image_slider = 'Only JPEG, PNG, JPG, or GIF files are allowed';
          break;
        } else if (file.size > 2 * 1024 * 1024) {
          newErrors.image_slider = 'Each image must not exceed 2MB';
          break;
        }
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
    payload.append('givingBack_category', formData.givingBack_category);
    payload.append('description', formData.description || '');
    payload.append('weblink', formData.weblink || '');
    if (formData.image_slider) {
      formData.image_slider.forEach((file) => {
        payload.append('image_slider[]', file);
      });
    }

    try {
      const response = await axiosInstance.post(`/api/giving-back/${givingId}/update`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Giving Back record updated successfully');
      if (response.data.giving_back?.image_slider) {
        setCurrentImages(JSON.parse(response.data.giving_back.image_slider));
        setFormData((prev) => ({ ...prev, image_slider: null }));
      }
      setTimeout(() => navigate('/giving-back'), 2000); // Corrected navigation path
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update Giving Back record';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors); // This is now type-safe
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string): string => {
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${baseUrl}/${cleanPath}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit Giving Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Field */}
          <div>
            <label htmlFor="givingBack_category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="givingBack_category"
              name="givingBack_category"
              value={formData.givingBack_category}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.givingBack_category ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.givingBack_category && (
              <p className="mt-1 text-sm text-red-500">{errors.givingBack_category}</p>
            )}
          </div>

          {/* Description Field */}
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
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Weblink Field */}
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
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.weblink ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {errors.weblink && (
              <p className="mt-1 text-sm text-red-500">{errors.weblink}</p>
            )}
          </div>
          
          {/* Image Slider Field */}
          <div>
            <label htmlFor="image_slider" className="block text-sm font-medium text-gray-700">
              Replace Images (optional)
            </label>
            {currentImages && currentImages.length > 0 && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Images:</p>
                <div className="flex flex-wrap gap-2">
                  {currentImages.map((image, index) => (
                    <img
                      key={index}
                      src={getImageUrl(image)}
                      alt={`Giving Back Image ${index + 1}`}
                      className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=LoadError';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <input
              type="file"
              id="image_slider"
              name="image_slider"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.image_slider && (
              <p className="mt-1 text-sm text-red-500">
                {/* **FIX 5: Remove the `as string` cast.** */}
                {errors.image_slider}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/giving-back')} // Corrected navigation path
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Updating...' : 'Update Giving Back'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGivingBack;