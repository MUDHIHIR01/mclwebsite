import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the form's data state
interface FormData {
  mcl_category: string;
  description: string;
  weblink: string;
  image_file: File | null;
  removeImage?: boolean;
}

// Interface for the fetched data from the API
interface MclGroupData {
  mcl_id: number;
  mcl_category: string;
  description: string | null;
  weblink: string | null;
  image_file: string | null;
}

// 1. Create a dedicated interface for form validation errors
interface FormErrors {
  mcl_category?: string;
  description?: string;
  weblink?: string;
  image_file?: string;
}

const EditMclGroup = () => {
  const navigate = useNavigate();
  const { mcl_id } = useParams<{ mcl_id: string }>();
  const [formData, setFormData] = useState<FormData>({
    mcl_category: '',
    description: '',
    weblink: '',
    image_file: null,
    removeImage: false,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // 2. Use the new FormErrors interface for the errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMclGroup = async () => {
      if (!mcl_id) {
        toast.error('MCL Group ID is missing.');
        navigate('/mcl-groups');
        return;
      }
      try {
        const response = await axiosInstance.get<MclGroupData>(`/api/mcl-groups/${mcl_id}`);
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
        navigate('/mcl-groups');
      }
    };
    fetchMclGroup();
  }, [mcl_id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image_file: file, removeImage: false }));
    if (errors.image_file) {
      setErrors((prev) => ({ ...prev, image_file: undefined }));
    }
  };

  const handleRemoveImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      removeImage: isChecked,
      image_file: isChecked ? null : prev.image_file,
    }));
  };

  // 3. Implement the validation logic with the correct types
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.mcl_category.trim()) {
      newErrors.mcl_category = 'Category is required';
    }

    if (formData.image_file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(formData.image_file.type)) {
        newErrors.image_file = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.image_file.size > 2 * 1024 * 1024) { // 2MB
        newErrors.image_file = 'Image size must not exceed 2MB';
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
    payload.append('mcl_category', formData.mcl_category);
    payload.append('description', formData.description || '');
    payload.append('weblink', formData.weblink || '');
    
    if (formData.image_file) {
      payload.append('image_file', formData.image_file);
    } else if (formData.removeImage) {
      payload.append('remove_image', 'true');
    }
    
    // Use POST for FormData updates, which Laravel handles correctly.
    try {
      const response = await axiosInstance.post(`/api/mcl-groups/${mcl_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'MCL Group updated successfully');
      setCurrentImage(response.data.mcl_group?.image_file || null);
      setFormData(prev => ({ ...prev, image_file: null, removeImage: false }));
      setTimeout(() => navigate('/mcl-group'), 2000); // Navigate to list page
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update MCL Group';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors); // This is now type-safe
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
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit MCL Group
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className={`mt-1 block w-full rounded-md shadow-sm p-2 ${errors.mcl_category ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
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
            <input
              type="file"
              id="image_file"
              name="image_file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={formData.removeImage}
              className="mt-1 block w-full text-sm disabled:opacity-50"
            />
            {/* 4. Removed the unsafe 'as string' cast. It's no longer needed. */}
            {errors.image_file && <p className="mt-1 text-sm text-red-500">{errors.image_file}</p>}
          </div>
          
          <div className="flex justify-end gap-4">
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