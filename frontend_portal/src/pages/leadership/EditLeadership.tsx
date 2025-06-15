
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormDataState {
  leader_name: string;
  position: string;
  leader_image: File | null;
  description: string;
}

const EditLeadership: React.FC = () => {
  const navigate = useNavigate();
  const { leadershipId } = useParams<{ leadershipId: string }>();
  const [formData, setFormData] = useState<FormDataState>({
    leader_name: '',
    position: '',
    leader_image: null,
    description: '',
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormDataState>>({
    leader_name: '',
    position: '',
    leader_image: undefined,
    description: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchLeadership = async () => {
      if (!leadershipId) {
        toast.error('Leadership ID is missing.');
        navigate('/leadership');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/leadership/${leadershipId}`);
        setFormData({
          leader_name: response.data.leadership?.leader_name || '',
          position: response.data.leadership?.position || '',
          leader_image: null,
          description: response.data.leadership?.description || '',
        });
        setCurrentImage(response.data.leadership?.leader_image || null);
      } catch (error) {
        toast.error('Failed to fetch leadership record');
        console.error("Fetch error:", error);
        navigate('/leadership');
      }
    };

    fetchLeadership();
  }, [leadershipId, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, leader_image: file }));
    setErrors((prev) => ({ ...prev, leader_image: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormDataState> = {};

    if (!formData.leader_name.trim()) {
      newErrors.leader_name = 'Leader name is required';
    } else if (formData.leader_name.length > 255) {
      newErrors.leader_name = 'Leader name must not exceed 255 characters';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    } else if (formData.position.length > 255) {
      newErrors.position = 'Position must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.leader_image) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.leader_image.type)) {
        (newErrors.leader_image as any) = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.leader_image.size > 2 * 1024 * 1024) {
        (newErrors.leader_image as any) = 'Image size must not exceed 2MB';
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
    payload.append('leader_name', formData.leader_name);
    payload.append('position', formData.position);
    payload.append('description', formData.description || '');
    if (formData.leader_image) {
      payload.append('leader_image', formData.leader_image);
    }

    try {
      const response = await axiosInstance.post(`/api/leadership/${leadershipId}/update`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message || 'Leadership record updated successfully');
      if (response.data.leadership?.leader_image) {
        setCurrentImage(response.data.leadership.leader_image);
        setFormData(prev => ({ ...prev, leader_image: null }));
      }
      setTimeout(() => navigate('/leadership'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update leadership record';
      const backendErrors = error.response?.data?.errors || {};
      const formattedErrors: Partial<FormDataState> = {};
      for (const key in backendErrors) {
        if (key in formData) {
          (formattedErrors as any)[key] = backendErrors[key][0];
        }
      }
      setErrors(prev => ({ ...prev, ...formattedErrors }));
      toast.error(errorMessage);
      console.error("Submit error:", error);
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

  const displayImageUrl = getImageUrl(currentImage);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit Leadership 
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="leader_name" className="block text-sm font-medium text-gray-700">
              Leader Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="leader_name"
              name="leader_name"
              value={formData.leader_name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.leader_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter leader name"
              maxLength={255}
              aria-invalid={!!errors.leader_name}
              aria-describedby={errors.leader_name ? 'leader_name-error' : undefined}
            />
            {errors.leader_name && (
              <p id="leader_name-error" className="mt-1 text-sm text-red-500">
                {errors.leader_name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.position ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter position"
              maxLength={255}
              aria-invalid={!!errors.position}
              aria-describedby={errors.position ? 'position-error' : undefined}
            />
            {errors.position && (
              <p id="position-error" className="mt-1 text-sm text-red-500">
                {errors.position}
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
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter description"
              maxLength={1000}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="leader_image" className="block text-sm font-medium text-gray-700">
              Leader Image (optional)
            </label>
            {displayImageUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img
                  src={displayImageUrl}
                  alt="Current Leadership"
                  className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=LoadError';
                    (e.currentTarget as HTMLImageElement).alt = 'Error loading current image';
                    console.warn("Error loading current image from URL:", displayImageUrl);
                  }}
                />
              </div>
            )}
            <input
              type="file"
              id="leader_image"
              name="leader_image"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.leader_image && (
              <p id="leader_image-error" className="mt-1 text-sm text-red-500">
                {errors.leader_image as string}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/leadership')}
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
                  Updating...
                </div>
              ) : (
                'Update Leadership'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadership;
