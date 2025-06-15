import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ServiceData {
  service_id: number;
  service_category: string;
  service_image: string | null;
  url_link: string | null;
  description: string | null;
}

const EditServices: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [serviceCategory, setServiceCategory] = useState('');
  const [serviceImg, setServiceImg] = useState<File | null>(null);
  const [urlLink, setUrlLink] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchService = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ServiceData>(`/api/services/${serviceId}`);
      const service = response.data.service || response.data;
      setServiceCategory(service.service_category);
      setUrlLink(service.url_link || '');
      setDescription(service.description || '');
    } catch (err: any) {
      const errorMessage = 'Failed to fetch service record: ' + (err.response?.data?.error || err.message || 'Unknown error');
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('service_category', serviceCategory);
    if (serviceImg) {
      formData.append('service_image', serviceImg);
    }
    if (urlLink) {
      formData.append('url_link', urlLink);
    }
    if (description) {
      formData.append('description', description);
    }

    try {
      await axiosInstance.post(`/api/services/${serviceId}/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Service record updated successfully!', { position: 'top-right' });
      navigate('/services');
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).join(', ') 
        : 'Failed to update service record.';
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-right' });
      console.error("Update error:", err);
    }
  }, [serviceCategory, serviceImg, urlLink, description, serviceId, navigate]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="text-lg font-semibold">Loading...</div></div>;

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="text-red-500 text-xl font-semibold mb-4">Error</div>
        <p className="text-gray-700 mb-2">{error}</p>
        <button
          onClick={fetchService}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Edit Service Record</h2>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="service_category" className="block text-sm font-medium text-gray-700">Service Category</label>
            <input
              id="service_category"
              type="text"
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          <div>
            <label htmlFor="service_image" className="block text-sm font-medium text-gray-700">Service Image</label>
            <input
              id="service_image"
              type="file"
              accept="image/*"
              onChange={(e) => setServiceImg(e.target.files ? e.target.files[0] : null)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="url_link" className="block text-sm font-medium text-gray-700">URL Link</label>
            <input
              id="url_link"
              type="url"
              value={urlLink}
              onChange={(e) => setUrlLink(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Update Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServices;
