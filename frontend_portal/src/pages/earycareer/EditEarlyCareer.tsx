import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// =================================================================================
// TYPES
// =================================================================================
interface EarlyCareerData {
  early_career_id: number;
  category: string;
  description: string | null;
  img_file: string | null;
  video_file: string | null;
}

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

// =================================================================================
// UTILITY FUNCTIONS
// =================================================================================
const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.category.trim()) {
    errors.category = 'Category is required';
  } else if (formData.category.length > 255) {
    errors.category = 'Category must not exceed 255 characters';
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

const getFileUrl = (filePath: string | null): string => {
  if (!filePath) return '';
  const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
  return `${baseUrl}/${filePath.replace(/^\//, '')}`;
};

const handleApiError = (error: any, defaultMessage: string): FormErrors => {
    const errorMessage = error.response?.data?.error || defaultMessage;
    toast.error(errorMessage, { position: 'top-right' });
    return error.response?.data?.errors || {};
};

// =================================================================================
// MAIN COMPONENT
// =================================================================================
const EditEarlyCareer: React.FC = () => {
  const navigate = useNavigate();
  const { early_career_id } = useParams<{ early_career_id: string }>();
  const [formData, setFormData] = useState<FormData>({ category: '', description: '', img_file: null, video_file: null });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!early_career_id) {
        toast.error('Invalid record ID.', { position: 'top-right' });
        navigate('/early-careers');
        return;
    }
    const fetchData = async () => {
      setFetching(true);
      try {
        const response = await axiosInstance.get<{ early_career: EarlyCareerData }>(`/api/early-careers/${early_career_id}`);
        const { category, description, img_file, video_file } = response.data.early_career;
        setFormData({ category: category || '', description: description || '', img_file: null, video_file: null });
        setCurrentImage(img_file);
        setCurrentVideo(video_file);
      } catch (error) {
        toast.error('Failed to fetch record data.', { position: 'top-right' });
        navigate('/early-careers');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [early_career_id, navigate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the specific error when the user starts typing
    if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
     // Clear the specific error when a new file is selected
    if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
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
      // NOTE: Using POST for update, as specified in the Laravel Controller/routes for handling multipart/form-data.
      const response = await axiosInstance.post(`/api/early-careers/${early_career_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Record updated successfully!', { position: 'top-right' });
      setTimeout(() => navigate('/early-careers'), 1500);
    } catch (error: any) {
      setErrors(handleApiError(error, 'Failed to update record.'));
    } finally {
      setLoading(false);
    }
  }, [formData, early_career_id, navigate]);

  if (fetching) return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading Record...</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Early Career Record</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
            <input
              type="text" id="category" name="category" value={formData.category} onChange={handleChange}
              className={`mt-1 block w-full rounded-md border p-2 sm:p-3 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
            />
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description" name="description" value={formData.description} onChange={handleChange} rows={4}
              className={`mt-1 block w-full rounded-md border p-2 sm:p-3 ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
            />
             {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="img_file" className="block text-sm font-medium text-gray-700">Replace Image (optional)</label>
            {currentImage && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img src={getFileUrl(currentImage)} alt="Current" className="h-32 w-auto rounded border" />
              </div>
            )}
            <input
              type="file" id="img_file" name="img_file" onChange={handleFileChange} accept="image/jpeg,image/png,image/jpg,image/gif"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 hover:file:bg-blue-100"
            />
            {errors.img_file && <p className="mt-1 text-sm text-red-500">{errors.img_file}</p>}
            <p className="mt-1 text-xs text-gray-500">Max 2MB. JPG, PNG, GIF. Uploading a new file will replace the current one.</p>
          </div>
          
          <div>
            <label htmlFor="video_file" className="block text-sm font-medium text-gray-700">Replace Video (optional)</label>
            {currentVideo && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Video:</p>
                <a href={getFileUrl(currentVideo)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">View Current Video</a>
              </div>
            )}
            <input
              type="file" id="video_file" name="video_file" onChange={handleFileChange} accept="video/mp4,video/x-msvideo,video/quicktime,video/x-ms-wmv"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 hover:file:bg-blue-100"
            />
             {errors.video_file && <p className="mt-1 text-sm text-red-500">{errors.video_file}</p>}
            <p className="mt-1 text-xs text-gray-500">Max 10MB. MP4, AVI, MOV. Uploading a new file will replace the current one.</p>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate('/early-careers')} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Updating...
                </>
              ) : 'Update Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEarlyCareer;