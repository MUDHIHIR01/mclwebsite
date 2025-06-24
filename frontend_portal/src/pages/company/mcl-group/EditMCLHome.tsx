import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the form's data state
interface FormData {
  heading: string;
  description: string;
  mcl_home_img: File | null;
  removeImage?: boolean;
}

// Interface for the data fetched from the API
interface MclHomeData {
  mcl_home_id: number;
  heading: string;
  description: string | null;
  mcl_home_img: string | null;
}

// Interface for form validation errors
interface FormErrors {
  heading?: string;
  description?: string;
  mcl_home_img?: string;
}

const EditMCLHome: React.FC = () => {
  const navigate = useNavigate();
  // Use the correct parameter name from your route, e.g., /edit/mcl-home/:id
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState<FormData>({
    heading: '',
    description: '',
    mcl_home_img: null,
    removeImage: false,
  });

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMclHome = async () => {
      if (!id) {
        toast.error('MCL Home ID is missing.');
        navigate('/mcl-group/home'); // Navigate to the list page
        return;
      }
      try {
        const response = await axiosInstance.get<MclHomeData>(`/api/mcl-home/${id}`);
        setFormData({
          heading: response.data.heading || '',
          description: response.data.description || '',
          mcl_home_img: null,
          removeImage: false,
        });
        setCurrentImage(response.data.mcl_home_img);
      } catch (error) {
        toast.error('Failed to fetch MCL Home details.');
        navigate('/mcl-group/home');
      }
    };

    fetchMclHome();
  }, [id, navigate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, mcl_home_img: file, removeImage: false }));
    if (errors.mcl_home_img) {
      setErrors((prev) => ({ ...prev, mcl_home_img: undefined }));
    }
  }, [errors.mcl_home_img]);

  const handleRemoveImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      removeImage: isChecked,
      mcl_home_img: isChecked ? null : prev.mcl_home_img, // Clear file if checkbox is checked
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.heading.trim()) {
      newErrors.heading = 'Heading is required.';
    }
    // Add other validations if needed
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
    } else if (formData.removeImage) {
      payload.append('remove_image', 'true');
    }

    try {
      const response = await axiosInstance.post(`/api/mcl-home/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'MCL Home updated successfully');
      setCurrentImage(response.data.mcl_home?.mcl_home_img || null);
      setFormData(prev => ({ ...prev, mcl_home_img: null, removeImage: false }));
      setTimeout(() => navigate('/mcl-group/home'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update MCL Home';
      setErrors(error.response?.data?.errors || {});
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id, formData, navigate, validateForm]);

  const getImageUrl = (imagePath: string | null): string | undefined => {
    if (!imagePath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || '').replace(/\/$/, '');
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
  };
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit MCL Home</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="heading" className="block text-sm font-medium text-gray-700">
              Heading <span className="text-red-500">*</span>
            </label>
            <input type="text" id="heading" name="heading" value={formData.heading} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm p-2 ${errors.heading ? 'border-red-500' : 'border-gray-300'}`} required />
            {errors.heading && <p className="mt-1 text-sm text-red-500">{errors.heading}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            {currentImage && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img src={getImageUrl(currentImage)} alt="Current MCL Home" className="h-32 w-auto object-contain rounded border" />
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input type="checkbox" checked={formData.removeImage} onChange={handleRemoveImageChange} className="rounded" />
                    <span className="ml-2 text-sm text-gray-600">Remove current image</span>
                  </label>
                </div>
              </div>
            )}
            <input type="file" id="mcl_home_img" name="mcl_home_img" accept="image/*" onChange={handleFileChange} disabled={formData.removeImage} className="mt-1 block w-full text-sm disabled:opacity-50" />
            {errors.mcl_home_img && <p className="mt-1 text-sm text-red-500">{errors.mcl_home_img}</p>}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate('/mcl-group/home')} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Updating...' : 'Update MCL Home'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMCLHome;