import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Interfaces & Types ---
interface FormData {
  heading: string;
  description: string;
  home_img: File | null;
}

interface FormErrors {
  heading?: string;
  home_img?: string;
}

// --- Utility Functions ---
const getFileUrl = (filePath: string | null): string | null => {
    if (!filePath) return null;
    const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, '') || '';
    return `${baseUrl}/${filePath.replace(/^\//, '')}`;
};

const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};
  if (!formData.heading.trim()) errors.heading = 'A heading is required.';
  if (formData.home_img && formData.home_img.size > 2 * 1024 * 1024) {
    errors.home_img = 'Image size must not exceed 2MB.';
  }
  return errors;
};

const handleApiError = (error: any, defaultMessage: string): FormErrors => {
  const errorMessage = error.response?.data?.error || defaultMessage;
  toast.error(errorMessage, { position: 'top-right' });
  return error.response?.data?.errors || {};
};

// --- Main Component ---
const EditNewsHome: React.FC = () => {
  const navigate = useNavigate();
  const { news_home_id } = useParams<{ news_home_id: string }>();
  const [formData, setFormData] = useState<FormData>({ heading: '', description: '', home_img: null });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!news_home_id) {
        toast.error('Invalid Slider ID.', { position: 'top-right' });
        navigate('/news/home');
        return;
    }
    const fetchData = async () => {
      setFetching(true);
      try {
        const response = await axiosInstance.get(`/api/news-homes/${news_home_id}`);
        const { heading, description, home_img } = response.data;
        setFormData({ heading: heading || '', description: description || '', home_img: null });
        setCurrentImage(home_img);
      } catch (error) {
        toast.error('Failed to fetch slider data.', { position: 'top-right' });
        navigate('/news/home');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [news_home_id, navigate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }, [errors]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, home_img: file }));
    if (errors.home_img) setErrors(prev => ({ ...prev, home_img: undefined }));
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
    payload.append('heading', formData.heading);
    payload.append('description', formData.description);
    if (formData.home_img) payload.append('home_img', formData.home_img);
    
    try {
      const response = await axiosInstance.post(`/api/news-homes/${news_home_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Slider updated successfully!', { position: 'top-right' });
      setTimeout(() => navigate('/news/home'), 1500);
    } catch (error: any) {
      setErrors(handleApiError(error, 'Failed to update slider.'));
    } finally {
      setLoading(false);
    }
  }, [formData, news_home_id, navigate]);

  if (fetching) return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading...</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit News Home Slider</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="heading" className="block text-sm font-medium text-gray-700">Heading <span className="text-red-500">*</span></label>
            <input type="text" id="heading" name="heading" value={formData.heading} onChange={handleChange} className={`mt-1 block w-full rounded-md border p-2 ${errors.heading ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.heading && <p className="text-sm text-red-500 mt-1">{errors.heading}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Image</label>
            {currentImage ? <img src={getFileUrl(currentImage) as string} alt="Current Slider" className="h-32 w-auto rounded border my-2" /> : <p className="text-sm text-gray-500">No image uploaded.</p>}
            <label htmlFor="home_img" className="block text-sm font-medium text-gray-700 mt-2">Replace Image (optional)</label>
            <input type="file" id="home_img" name="home_img" onChange={handleFileChange} className="mt-1 block w-full text-sm"/>
            {errors.home_img && <p className="text-sm text-red-500 mt-1">{errors.home_img}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border p-2 border-gray-300" />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate('/news/home')} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center ${loading ? 'opacity-50' : 'hover:bg-blue-700'}`}>
              {loading && <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" /></svg>}
              {loading ? 'Updating...' : 'Update Slider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNewsHome;