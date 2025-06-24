import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Types
interface FormData {
  category: string;
  description: string;
  img_file: File | null;
  video_file: File | null;
}

interface FormErrors {
  category?: string;
  description?: string;
  img_file?: string;
  video_file?: string;
}

// Utility Functions
const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.category.trim()) {
    errors.category = 'Category is required';
  } else if (formData.category.length > 255) {
    errors.category = 'Category must not exceed 255 characters';
  }

  if (formData.description.length > 5000) { // Assuming a larger limit for description
    errors.description = 'Description is too long';
  }

  if (formData.img_file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(formData.img_file.type)) {
      errors.img_file = 'Only JPEG, PNG, JPG, or GIF files are allowed';
    } else if (formData.img_file.size > 2 * 1024 * 1024) { // 2MB
      errors.img_file = 'Image size must not exceed 2MB';
    }
  }

  if (formData.video_file) {
    const allowedTypes = ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-ms-wmv'];
    if (!allowedTypes.includes(formData.video_file.type)) {
      errors.video_file = 'Only MP4, AVI, MOV, or WMV files are allowed';
    } else if (formData.video_file.size > 10 * 1024 * 1024) { // 10MB
      errors.video_file = 'Video size must not exceed 10MB';
    }
  }

  return errors;
};

const handleApiError = (error: any, defaultMessage: string): FormErrors => {
  const errorMessage = error.response?.data?.error || defaultMessage;
  toast.error(errorMessage, { position: 'top-right' });
  return error.response?.data?.errors || {};
};

const AddEarlyCareer: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    img_file: null,
    video_file: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length) {
        setErrors(validationErrors);
        return;
      }

      setLoading(true);
      const payload = new FormData();
      payload.append('category', formData.category);
      payload.append('description', formData.description || '');
      if (formData.img_file) payload.append('img_file', formData.img_file);
      if (formData.video_file) payload.append('video_file', formData.video_file);

      try {
        const response = await axiosInstance.post('/api/early-careers', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success(response.data.message || 'Record created successfully', { position: 'top-right' });
        setTimeout(() => navigate('/early-careers'), 1500);
      } catch (error: any) {
        setErrors(handleApiError(error, 'Failed to create record'));
      } finally {
        setLoading(false);
      }
    },
    [formData, navigate]
  );

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Early Career Record</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text" id="category" name="category" value={formData.category} onChange={handleChange}
              className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter category" maxLength={255}
            />
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description" name="description" value={formData.description} onChange={handleChange} rows={4}
              className={`mt-1 block w-full rounded-md border p-2 sm:p-3 text-sm sm:text-base ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter description (optional)"
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="img_file" className="block text-sm font-medium text-gray-700">Image (optional)</label>
            <input
              type="file" id="img_file" name="img_file" accept="image/jpeg,image/png,image/jpg,image/gif" onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 hover:file:bg-blue-100"
            />
            {errors.img_file && <p className="mt-1 text-sm text-red-500">{errors.img_file}</p>}
            <p className="mt-1 text-xs text-gray-500">Max 2MB. JPG, PNG, GIF.</p>
          </div>

          <div>
            <label htmlFor="video_file" className="block text-sm font-medium text-gray-700">Video (optional)</label>
            <input
              type="file" id="video_file" name="video_file" accept="video/mp4,video/x-msvideo,video/quicktime,video/x-ms-wmv" onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 hover:file:bg-blue-100"
            />
            {errors.video_file && <p className="mt-1 text-sm text-red-500">{errors.video_file}</p>}
            <p className="mt-1 text-xs text-gray-500">Max 10MB. MP4, AVI, MOV, WMV.</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button type="button" onClick={() => navigate('/early-careers')} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50' : ''}`}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEarlyCareer;