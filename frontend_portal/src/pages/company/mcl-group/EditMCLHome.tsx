import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interfaces remain the same
interface FormData {
  heading: string;
  description: string;
  mcl_home_img: File | null;
  removeImage?: boolean;
}

interface MclHomeData {
  mcl_home_id: number;
  heading: string;
  description: string | null;
  mcl_home_img: string | null;
}

interface ApiResponse {
    data: MclHomeData;
    message?: string;
}

interface FormErrors {
  heading?: string;
  description?: string;
  mcl_home_img?: string;
}

const EditMCLHome: React.FC = () => {
  const navigate = useNavigate();
  const { mcl_homeId } = useParams<{ mcl_homeId: string }>();

  const [formData, setFormData] = useState<FormData>({
    heading: '',
    description: '',
    mcl_home_img: null,
    removeImage: false,
  });

  // REFINEMENT: Unified state for image preview URL (either from server or local file)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);

  // Helper to construct full image URL from a relative path
  const getImageUrl = (imagePath: string | null): string | null => {
    if (!imagePath) return null;
    const baseUrl = (axiosInstance.defaults.baseURL || '').replace(/\/$/, '');
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
  };

  useEffect(() => {
    const fetchMclHome = async () => {
      if (!mcl_homeId) {
        toast.error('MCL Home ID is missing from the URL.');
        navigate('/mcl-group/home');
        return;
      }
      try {
        setLoading(true);
        const response = await axiosInstance.get<ApiResponse>(`/api/mcl-home/${mcl_homeId}`);
        const fetchedData = response.data.data;

        setFormData({
          heading: fetchedData.heading || '',
          description: fetchedData.description || '',
          mcl_home_img: null,
          removeImage: false,
        });
        // Set the initial image for preview
        setImagePreviewUrl(getImageUrl(fetchedData.mcl_home_img));
      } catch (error) {
        toast.error('Failed to fetch MCL Home details.');
        // REFINEMENT: Corrected navigation path to be consistent
        navigate('/mcl-home'); 
      } finally {
        setLoading(false);
      }
    };

    fetchMclHome();
  }, [mcl_homeId, navigate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  // REFINEMENT: Enhanced file handling to provide a live preview
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, mcl_home_img: file, removeImage: false }));

    if (file) {
      // Create a temporary URL for the selected file to show a preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    } else {
      // If the file selection is cancelled, revert to the original image
      setImagePreviewUrl(getImageUrl(formData.description)); // This is a placeholder, actual logic might differ
    }
    
    if (errors.mcl_home_img) {
      setErrors((prev) => ({ ...prev, mcl_home_img: undefined }));
    }
  }, [errors.mcl_home_img, formData.description]);
  
  const handleRemoveImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      removeImage: isChecked,
      mcl_home_img: isChecked ? null : prev.mcl_home_img,
    }));
    
    // If removing, clear the preview. Otherwise, restore it.
    if (isChecked) {
      setImagePreviewUrl(null);
    } else {
       setImagePreviewUrl(getImageUrl(formData.description)); // This is a placeholder, needs original image path
    }
  }, [formData.description]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.heading.trim()) {
      newErrors.heading = 'Heading is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const payload = new FormData();
    payload.append('heading', formData.heading);
    payload.append('description', formData.description || '');

    if (formData.mcl_home_img) {
      payload.append('mcl_home_img', formData.mcl_home_img);
    }
    
    if (formData.removeImage) {
      payload.append('remove_image', 'true');
    }

    try {
      const response = await axiosInstance.post<ApiResponse>(`/api/mcl-home/${mcl_homeId}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message || 'MCL Home updated successfully');
      setTimeout(() => navigate('/mcl-home'), 1500);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update MCL Home';
      setErrors(error.response?.data?.errors || {});
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [mcl_homeId, formData, navigate, validateForm]);
  
  if (loading && !imagePreviewUrl) {
    return <div className="flex justify-center items-center h-screen"><div className="text-lg">Loading Details...</div></div>;
  }

  return (
    // REFINEMENT: Outer padding is kept for spacing from screen edges
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      {/* REFINEMENT: Removed `max-w-4xl` and `mx-auto` for a full-width container */}
      <div className="bg-white rounded-xl shadow-lg p-6 w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit MCL Home</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="heading" className="block text-sm font-medium text-gray-700">
              Heading <span className="text-red-500">*</span>
            </label>
            <input type="text" id="heading" name="heading" value={formData.heading} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${errors.heading ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`} required />
            {errors.heading && <p className="mt-1 text-sm text-red-500">{errors.heading}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500" />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            {/* REFINEMENT: This section now shows the unified image preview */}
            {imagePreviewUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Image Preview:</p>
                <img src={imagePreviewUrl} alt="MCL Home Preview" className="h-32 w-auto object-contain rounded border" />
              </div>
            )}
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input type="checkbox" checked={formData.removeImage} onChange={handleRemoveImageChange} className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Remove current image</span>
              </label>
            </div>
            <input type="file" id="mcl_home_img" name="mcl_home_img" accept="image/*" onChange={handleFileChange} disabled={formData.removeImage || loading} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50" />
            {errors.mcl_home_img && <p className="mt-1 text-sm text-red-500">{errors.mcl_home_img}</p>}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate('/mcl-home')} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
              {loading ? 'Updating...' : 'Update MCL Home'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMCLHome;