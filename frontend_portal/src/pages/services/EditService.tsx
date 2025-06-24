import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// =================================================================================
// TYPES
// =================================================================================
interface ServiceData {
  service_category: string;
  service_img: string | null;
  url_link: string | null;
  description: string | null;
}
interface FormData {
  service_category: string;
  service_image: File | null;
  url_link: string;
  description: string;
}
interface FormErrors {
  service_category?: string;
  service_image?: string;
  url_link?: string;
}

// =================================================================================
// UTILITY FUNCTIONS
// =================================================================================
const getFileUrl = (filePath: string | null): string => {
  if (!filePath) return '';
  const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
  return `${baseUrl}/${filePath.replace(/^\//, '')}`;
};

const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};
  if (!formData.service_category.trim()) {
    errors.service_category = 'Service category is required';
  }
  if (formData.url_link && !/^https?:\/\//.test(formData.url_link)) {
    errors.url_link = 'Please enter a valid URL (e.g., https://example.com)';
  }
  if (formData.service_image && formData.service_image.size > 2 * 1024 * 1024) { // 2MB
    errors.service_image = 'Image size must not exceed 2MB';
  }
  return errors;
};

const handleApiError = (error: any, defaultMessage: string): FormErrors => {
  const errorMessage = error.response?.data?.error || defaultMessage;
  toast.error(errorMessage, { position: 'top-right' });
  return error.response?.data?.errors || {};
};

// =================================================================================
// MAIN COMPONENT
// =================================================================================
const EditService: React.FC = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  const [formData, setFormData] = useState<FormData>({ service_category: '', service_image: null, url_link: '', description: '' });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!serviceId) {
        toast.error('Invalid Service ID.', { position: 'top-right' });
        navigate('/services');
        return;
    }
    const fetchData = async () => {
      setFetching(true);
      try {
        const response = await axiosInstance.get<{ service: ServiceData }>(`/api/services/${serviceId}`);
        const { service_category, service_img, url_link, description } = response.data.service;
        setFormData({ service_category, url_link: url_link || '', description: description || '', service_image: null });
        setCurrentImage(service_img);
      } catch (error) {
        toast.error('Failed to fetch service data.', { position: 'top-right' });
        navigate('/services');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [serviceId, navigate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, [errors]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, service_image: file }));
    if (errors.service_image) setErrors((prev) => ({ ...prev, service_image: undefined }));
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
    payload.append('service_category', formData.service_category);
    if (formData.service_image) payload.append('service_image', formData.service_image);
    payload.append('url_link', formData.url_link || '');
    payload.append('description', formData.description || '');

    try {
      // *** THIS IS THE CORRECTED LINE TO MATCH YOUR NEW ROUTE ***
      const response = await axiosInstance.post(`/api/services/${serviceId}/update`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Service updated successfully!', { position: 'top-right' });
      setTimeout(() => navigate('/services'), 1500);
    } catch (error: any) {
      setErrors(handleApiError(error, 'Failed to update service.'));
    } finally {
      setLoading(false);
    }
  }, [formData, serviceId, navigate]);

  if (fetching) return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading Service...</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Service</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="service_category" className="block text-sm font-medium text-gray-700">Service Category <span className="text-red-500">*</span></label>
            <input type="text" id="service_category" name="service_category" value={formData.service_category} onChange={handleChange}
                   className={`mt-1 block w-full rounded-md border p-2 ${errors.service_category ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.service_category && <p className="mt-1 text-sm text-red-500">{errors.service_category}</p>}
          </div>

          <div>
            <label htmlFor="service_image" className="block text-sm font-medium text-gray-700">Replace Image (optional)</label>
            {currentImage && <img src={getFileUrl(currentImage)} alt="Current Service" className="h-32 w-auto rounded border my-2" />}
            <input type="file" id="service_image" name="service_image" onChange={handleFileChange} accept="image/jpeg,image/png,image/jpg,image/gif"
                   className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 hover:file:bg-blue-100" />
            {errors.service_image && <p className="mt-1 text-sm text-red-500">{errors.service_image}</p>}
          </div>
          
          <div>
            <label htmlFor="url_link" className="block text-sm font-medium text-gray-700">URL Link (optional)</label>
            <input type="url" id="url_link" name="url_link" value={formData.url_link} onChange={handleChange} placeholder="https://example.com"
                   className={`mt-1 block w-full rounded-md border p-2 ${errors.url_link ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.url_link && <p className="mt-1 text-sm text-red-500">{errors.url_link}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4}
                      className="mt-1 block w-full rounded-md border p-2 border-gray-300" />
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate('/services')} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}>
               {loading && <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" /></svg>}
               {loading ? 'Updating...' : 'Update Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditService;