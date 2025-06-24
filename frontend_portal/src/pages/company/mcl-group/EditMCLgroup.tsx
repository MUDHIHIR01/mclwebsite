import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the form's data state, now with removeImage logic
interface FormData {
  mcl_category: string;
  description: string;
  weblink: string;
  home_page: boolean;
  image_file: File | null;
  removeImage?: boolean;
}

// Interface for the MCL group object from the API (aligned with controller)
interface MclGroupData {
  mcl_id: number;
  mcl_category: string;
  description: string | null;
  weblink: string | null;
  home_page: boolean;
  image_file: string | null;
}

// Interface for a SINGLE item response from the API: { "data": { ... } }
interface ApiSingleResponse {
  data: MclGroupData;
}

interface FormErrors {
  mcl_category?: string;
  image_file?: string;
}

const EditMclGroup = () => {
  const navigate = useNavigate();
  const { mcl_groupId } = useParams<{ mcl_groupId: string }>();
  
  const [formData, setFormData] = useState<FormData>({
    mcl_category: '',
    description: '',
    weblink: '',
    home_page: false,
    image_file: null,
    removeImage: false,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMclGroup = async () => {
      if (!mcl_groupId) {
        toast.error('MCL Group ID is missing.');
        navigate('/mcl-group');
        return;
      }
      setLoading(true);
      try {
        const response = await axiosInstance.get<ApiSingleResponse>(`/api/mcl-groups/${mcl_groupId}`);
        const groupDetails = response.data.data;

        if (groupDetails) {
          setFormData({
            mcl_category: groupDetails.mcl_category || '',
            description: groupDetails.description || '',
            weblink: groupDetails.weblink || '',
            home_page: groupDetails.home_page || false,
            image_file: null,
            removeImage: false,
          });
          setCurrentImage(groupDetails.image_file);
        } else {
          throw new Error('MCL Group not found.');
        }
      } catch (error: any) {
        toast.error('Failed to fetch MCL Group details.');
        navigate('/mcl-group');
      } finally {
        setLoading(false);
      }
    };
    fetchMclGroup();
  }, [mcl_groupId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const finalValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image_file: file, removeImage: false }));
    if (errors.image_file) setErrors((prev) => ({ ...prev, image_file: undefined }));
  };

  const handleRemoveImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({ ...prev, removeImage: isChecked, image_file: isChecked ? null : prev.image_file }));
    if (isChecked) {
        const fileInput = document.getElementById('image_file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.mcl_category.trim()) newErrors.mcl_category = 'Category is required';
    if (formData.image_file && formData.image_file.size > 2 * 1024 * 1024) { // 2MB
      newErrors.image_file = 'Image size must not exceed 2MB';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const payload = new FormData();
    payload.append('mcl_category', formData.mcl_category);
    payload.append('description', formData.description || '');
    payload.append('weblink', formData.weblink || '');
    payload.append('home_page', formData.home_page ? '1' : '0');
    
    if (formData.image_file) {
      payload.append('image_file', formData.image_file);
    } else if (formData.removeImage) {
      payload.append('image_file', '');
    }
    
    try {
      const response = await axiosInstance.post<{message: string, data: MclGroupData}>(`/api/mcl-groups/${mcl_groupId}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'MCL Group updated successfully');
      setCurrentImage(response.data.data?.image_file || null);
      setFormData(prev => ({ ...prev, image_file: null, removeImage: false }));
      setTimeout(() => navigate('/mcl-group'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update MCL Group';
      setErrors(error.response?.data?.errors || {});
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

  if (loading && !formData.mcl_category) {
      return <div className="flex justify-center items-center min-h-screen">Loading details...</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      {/* CHANGED: Removed max-w-4xl and mx-auto for full-width layout */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">Edit MCL Group</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="mcl_category" className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
            <input type="text" id="mcl_category" name="mcl_category" value={formData.mcl_category} onChange={handleChange} className={`mt-1 block w-full rounded-md shadow-sm p-2 ${errors.mcl_category ? 'border-red-500' : 'border-gray-300'}`} required />
            {errors.mcl_category && <p className="mt-1 text-sm text-red-500">{errors.mcl_category}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="weblink" className="block text-sm font-medium text-gray-700">Weblink</label>
            <input type="url" id="weblink" name="weblink" value={formData.weblink} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            {currentImage && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img src={getImageUrl(currentImage)} alt="Current MCL Group" className="h-32 w-auto object-contain rounded border" />
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input type="checkbox" checked={formData.removeImage} onChange={handleRemoveImageChange} className="rounded" />
                    <span className="ml-2 text-sm text-gray-600">Remove current image</span>
                  </label>
                </div>
              </div>
            )}
            <input type="file" id="image_file" name="image_file" accept="image/*" onChange={handleFileChange} disabled={formData.removeImage} className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50" />
            {errors.image_file && <p className="mt-1 text-sm text-red-500">{errors.image_file}</p>}
          </div>
          <div className="flex items-center">
             <input type="checkbox" id="home_page" name="home_page" checked={formData.home_page} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
             <label htmlFor="home_page" className="ml-2 block text-sm text-gray-900">Show on Home Page</label>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate('/mcl-group')} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
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