import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Interfaces (No changes needed) ---
interface FormData {
  mcl_category: string;
  description: string;
  weblink: string;
  image_file: File | null;
  removeImage?: boolean;
}

interface MclGroupData {
  mcl_id: number;
  mcl_category: string;
  description: string | null;
  weblink: string | null;
  image_file: string | null;
}

const EditMclGroup = () => {
  const navigate = useNavigate();
  // FIX: Use `mcl_groupId` to match the parameter name in your React Router's <Route> definition.
  const { mcl_groupId } = useParams<{ mcl_groupId: string }>();

  const [formData, setFormData] = useState<FormData>({
    mcl_category: '',
    description: '',
    weblink: '',
    image_file: null,
    removeImage: false,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMclGroup = async () => {
      // FIX: Check for the correct parameter name.
      if (!mcl_groupId) {
        toast.error('MCL Group ID is missing in the URL.');
        // REFINED: Navigate to a consistent list path.
        navigate('/mcl-groups');
        return;
      }
      try {
        // FIX: Use the correct parameter in the API call.
        const response = await axiosInstance.get<MclGroupData>(`/api/mcl-groups/${mcl_groupId}`);
        setFormData({
          mcl_category: response.data.mcl_category || '',
          description: response.data.description || '',
          weblink: response.data.weblink || '',
          image_file: null,
          removeImage: false,
        });
        setCurrentImage(response.data.image_file);
      } catch (error: any) {
        toast.error('Failed to fetch MCL Group details.');
        // REFINED: Navigate to a consistent list path.
        navigate('/mcl-groups');
      }
    };

    fetchMclGroup();
    // FIX: Update the dependency array with the correct parameter name.
  }, [mcl_groupId, navigate]);

  // --- Handlers (No changes needed, logic is sound) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image_file: file, removeImage: false }));
    setErrors((prev) => ({ ...prev, image_file: undefined }));
  };

  const handleRemoveImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      removeImage: isChecked,
      image_file: isChecked ? null : prev.image_file,
    }));
  };

  const validateForm = (): boolean => {
    // TODO: Implement actual validation logic here.
    if (!formData.mcl_category.trim()) {
        setErrors({ mcl_category: 'Category is required.' });
        toast.error('Category is required.');
        return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const payload = new FormData();
    payload.append('mcl_category', formData.mcl_category);
    payload.append('description', formData.description || '');
    payload.append('weblink', formData.weblink || '');
    
    if (formData.image_file) {
      payload.append('image_file', formData.image_file);
    } else if (formData.removeImage) {
      payload.append('image_file', ''); // Signal removal to backend
    }
    // Note: Laravel correctly handles POST with an ID as an update for FormData.
    
    try {
      // FIX: Use the correct parameter in the API call. This matches `Route::post('/{mcl_id}', ...)`
      // The backend expects `mcl_id`, but our frontend route uses `mcl_groupId`. We use `mcl_groupId` here.
      const response = await axiosInstance.post(`/api/mcl-groups/${mcl_groupId}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'MCL Group updated successfully');
      
      // REFINED: Clear form state and navigate after a short delay.
      setCurrentImage(response.data.mcl_group?.image_file || null);
      setFormData(prev => ({ ...prev, image_file: null, removeImage: false }));
      setTimeout(() => navigate('/mcl-groups'), 2000);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update MCL Group';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null): string | undefined => {
    if (!imagePath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || '').replace(/\/$/, '');
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit MCL Group
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form field for mcl_category */}
          <div>
            <label htmlFor="mcl_category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="mcl_category"
              name="mcl_category"
              value={formData.mcl_category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
            {errors.mcl_category && <p className="mt-1 text-sm text-red-500">{errors.mcl_category}</p>}
          </div>
          
          {/* Other fields would go here... */}

          {/* Image Field */}
          <div>
            {/* ... (Image field JSX is fine, no changes needed) ... */}
          </div>
          
          <div className="flex justify-end gap-4">
            {/* REFINED: Navigate to a consistent list path */}
            <button type="button" onClick={() => navigate('/mcl-groups')} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Updating...' : 'Update MCL Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMclGroup;