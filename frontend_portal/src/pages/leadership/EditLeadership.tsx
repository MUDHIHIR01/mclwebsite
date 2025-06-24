import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the form data itself
interface LeadershipFormData {
  leader_name: string;
  position: string;
  leader_image: File | null;
  description: string;
}

// A dedicated type for form errors. Each property is optional and holds a string message.
type FormErrors = {
  [K in keyof LeadershipFormData]?: string;
};

const EditLeadership: React.FC = () => {
  const navigate = useNavigate();
  const { leadershipId } = useParams<{ leadershipId: string }>();

  const [formData, setFormData] = useState<LeadershipFormData>({
    leader_name: '',
    position: '',
    leader_image: null,
    description: '',
  });

  // FIX: Use the new FormErrors type and initialize with an empty object.
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Start loading true to show loading state while fetching

  useEffect(() => {
    const fetchLeadership = async () => {
      if (!leadershipId) {
        toast.error('Leadership ID is missing.');
        navigate('/leadership');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/leadership/${leadershipId}`);
        const data = response.data.leadership;
        setFormData({
          leader_name: data?.leader_name || '',
          position: data?.position || '',
          leader_image: null, // Always start with null for a new upload
          description: data?.description || '',
        });
        setCurrentImage(data?.leader_image || null);
      } catch (error) {
        toast.error('Failed to fetch leadership record');
        console.error("Fetch error:", error);
        navigate('/leadership');
      } finally {
        setLoading(false);
      }
    };

    fetchLeadership();
  }, [leadershipId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for the field being edited
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, leader_image: file }));
    // Clear the error for the file input
    if (errors.leader_image) {
      setErrors((prev) => ({ ...prev, leader_image: undefined }));
    }
  };

  const validateForm = (): boolean => {
    // FIX: Type newErrors with our dedicated FormErrors type.
    const newErrors: FormErrors = {};

    if (!formData.leader_name.trim()) newErrors.leader_name = 'Leader name is required';
    else if (formData.leader_name.length > 255) newErrors.leader_name = 'Leader name must not exceed 255 characters';
    
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    else if (formData.position.length > 255) newErrors.position = 'Position must not exceed 255 characters';

    if (formData.description && formData.description.length > 1000) newErrors.description = 'Description must not exceed 1000 characters';
    
    if (formData.leader_image) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.leader_image.type)) {
        // FIX: No cast needed. newErrors.leader_image correctly accepts a string.
        newErrors.leader_image = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.leader_image.size > 2 * 1024 * 1024) {
        // FIX: No cast needed.
        newErrors.leader_image = 'Image size must not exceed 2MB';
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Leadership record updated successfully');
      // If a new image was uploaded and returned, update the current image display
      if (response.data.leadership?.leader_image) {
        setCurrentImage(response.data.leadership.leader_image);
      }
      setFormData(prev => ({ ...prev, leader_image: null })); // Clear file input
      setTimeout(() => navigate('/leadership'), 2000);
    } catch (error: unknown) {
      let errorMessage = 'Failed to update leadership record';
      if (axios.isAxiosError(error) && error.response) {
          errorMessage = error.response.data?.message || errorMessage;
          const backendErrors = error.response.data?.errors;
          if (backendErrors) {
            // FIX: Type backend errors correctly.
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

  if (loading && !formData.leader_name) {
    return <div className="flex justify-center items-center min-h-screen"><div className="text-lg font-semibold">Loading...</div></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Edit Leadership</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields remain the same */}
          <div>
            <label htmlFor="leader_name" className="block text-sm font-medium text-gray-700">Leader Name <span className="text-red-500">*</span></label>
            <input type="text" id="leader_name" name="leader_name" value={formData.leader_name} onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-sm ${errors.leader_name ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.leader_name && <p className="mt-1 text-sm text-red-500">{errors.leader_name}</p>}
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position <span className="text-red-500">*</span></label>
            <input type="text" id="position" name="position" value={formData.position} onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-sm ${errors.position ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.position && <p className="mt-1 text-sm text-red-500">{errors.position}</p>}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 text-sm ${errors.description ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="leader_image" className="block text-sm font-medium text-gray-700">Change Leader Image (optional)</label>
            {currentImage && (
              <div className="my-2"><p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img src={getImageUrl(currentImage)} alt="Current Leadership" className="h-32 w-auto object-contain rounded border"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
            <input type="file" id="leader_image" name="leader_image" accept="image/jpeg,image/png,image/jpg,image/gif" onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {/* FIX: No cast needed. errors.leader_image is now a string and can be rendered directly. */}
            {errors.leader_image && <p className="mt-1 text-sm text-red-500">{errors.leader_image}</p>}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button type="button" onClick={() => navigate('/leadership')} disabled={loading} className="w-full sm:w-auto px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition shadow-sm text-sm disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={loading} className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Updating...
                </div>
              ) : 'Update Leadership'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadership;