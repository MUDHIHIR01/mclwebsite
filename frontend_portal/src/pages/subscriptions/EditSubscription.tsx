import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  category: string;
  total_viewers: string;
  logo_img_file: File | null;
}

type FormErrors = {
  [K in keyof FormData]?: string;
};

const EditSubscription: React.FC = () => {
  const navigate = useNavigate();
  const { subscription_id } = useParams<{ subscription_id: string }>();

  const [formData, setFormData] = useState<FormData>({
    category: '',
    total_viewers: '',
    logo_img_file: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!subscription_id) {
        toast.error('Subscription ID is missing.');
        navigate('/subscriptions');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/subscriptions/${subscription_id}`);
        const data = response.data.data;
        setFormData({
          category: data?.category || '',
          total_viewers: data?.total_viewers?.toString() || '0',
          logo_img_file: null,
        });
        setCurrentImage(data?.logo_img_file || null);
      } catch (error) {
        toast.error('Failed to fetch subscription');
        navigate('/subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [subscription_id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, logo_img_file: file }));
    if (errors.logo_img_file) {
      setErrors((prev) => ({ ...prev, logo_img_file: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.total_viewers.trim()) {
        newErrors.total_viewers = 'Total viewers is required';
    } else if (isNaN(Number(formData.total_viewers)) || Number(formData.total_viewers) < 0) {
        newErrors.total_viewers = 'Total viewers must be a non-negative number';
    }

    if (formData.logo_img_file) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.logo_img_file.type)) {
        newErrors.logo_img_file = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.logo_img_file.size > 2 * 1024 * 1024) { // 2MB
        newErrors.logo_img_file = 'Image size must not exceed 2MB';
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
    payload.append('category', formData.category);
    payload.append('total_viewers', formData.total_viewers);
    if (formData.logo_img_file) {
      payload.append('logo_img_file', formData.logo_img_file);
    }
    // For compatibility with Laravel's route for updates via POST
    // payload.append('_method', 'PUT'); 

    try {
      const response = await axiosInstance.post(`/api/subscriptions/${subscription_id}/update`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Subscription updated successfully');
      if (response.data.data?.logo_img_file) {
        setCurrentImage(response.data.data.logo_img_file);
      }
      setTimeout(() => navigate('/subscriptions'), 2000);
    } catch (error: unknown) {
      let errorMessage = 'Failed to update subscription';
      if (axios.isAxiosError(error) && error.response) {
          errorMessage = error.response.data?.message || errorMessage;
          if (error.response.data?.errors) setErrors(error.response.data.errors);
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string | null): string | undefined => {
    if (!imagePath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
  };

  if (loading && !formData.category) {
    return <div className="flex justify-center items-center min-h-screen"><div className="text-lg font-semibold">Loading...</div></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Edit Subscription</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category *</label>
            <input type="text" id="category" name="category" value={formData.category} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"/>
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="total_viewers" className="block text-sm font-medium text-gray-700">Total Viewers *</label>
            <input type="number" id="total_viewers" name="total_viewers" value={formData.total_viewers} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2" min="0"/>
            {errors.total_viewers && <p className="mt-1 text-sm text-red-500">{errors.total_viewers}</p>}
          </div>

          <div>
            <label htmlFor="logo_img_file" className="block text-sm font-medium text-gray-700">Change Logo (optional)</label>
            {currentImage && (
              <div className="my-2"><p className="text-sm text-gray-600 mb-1">Current Logo:</p>
                <img src={getImageUrl(currentImage)} alt="Current Logo" className="h-32 w-auto object-contain rounded border"/>
              </div>
            )}
            <input type="file" id="logo_img_file" name="logo_img_file" accept="image/jpeg,image/png,image/jpg,image/gif" onChange={handleFileChange}
              className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {errors.logo_img_file && <p className="mt-1 text-sm text-red-500">{errors.logo_img_file}</p>}
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate('/subscriptions')} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${loading ? 'opacity-50' : ''}`}>
              {loading ? 'Updating...' : 'Update Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubscription;