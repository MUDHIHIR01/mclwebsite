import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../axios';

interface FormDataState {
  givingBack_category: string;
  description: string;
  weblink: string;
  image_slider: File[] | null;
}

interface FormErrors {
  givingBack_category?: string;
  description?: string;
  weblink?: string;
  image_slider?: string;
}

interface GivingBackData {
  givingBack_category: string;
  description: string;
  weblink: string | null;
  image_slider: string | null;
}

interface ApiGetResponse {
  giving_back: GivingBackData;
}

const EditGivingBack: React.FC = () => {
  const navigate = useNavigate();
  const { givingId } = useParams<{ givingId: string }>();
  const [formData, setFormData] = useState<FormDataState>({
    givingBack_category: '',
    description: '',
    weblink: '',
    image_slider: null,
  });
  const [currentImages, setCurrentImages] = useState<string[] | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchGivingBack = useCallback(async () => {
    if (!givingId || isNaN(Number(givingId))) {
      setFetchError('Invalid ID.');
      toast.error('Invalid ID.');
      return;
    }
    setLoading(true);
    try {
      const { data: response } = await axiosInstance.get<ApiGetResponse>(`/api/giving-backs/${givingId}`);
      const { giving_back: data } = response;
      setFormData({
        givingBack_category: data.givingBack_category || '',
        description: data.description || '',
        weblink: data.weblink || '',
        image_slider: null,
      });
      setCurrentImages(data.image_slider ? JSON.parse(data.image_slider) : null);
    } catch {
      setFetchError('Failed to fetch record.');
      toast.error('Failed to fetch record.');
    } finally {
      setLoading(false);
    }
  }, [givingId]);

  useEffect(() => {
    fetchGivingBack();
  }, [fetchGivingBack]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : null;
    setFormData((prev) => ({ ...prev, image_slider: files }));
    setErrors((prev) => ({ ...prev, image_slider: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.givingBack_category.trim()) {
      newErrors.givingBack_category = 'Category is required';
    }

    if (formData.weblink && !/^(https?:\/\/)/i.test(formData.weblink)) {
      newErrors.weblink = 'Invalid URL';
    }

    if (formData.image_slider?.length) {
      for (const file of formData.image_slider) {
        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
          newErrors.image_slider = 'Only JPEG, PNG, JPG, or GIF allowed';
          break;
        }
        if (file.size > 2 * 1024 * 1024) {
          newErrors.image_slider = 'Image must not exceed 2MB';
          break;
        }
      }
    }

    setErrors(newErrors);
    return !Object.keys(newErrors).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const payload = new FormData();
    payload.append('givingBack_category', formData.givingBack_category);
    payload.append('description', formData.description);
    payload.append('weblink', formData.weblink);
    formData.image_slider?.forEach((file) => payload.append('image_slider[]', file));

    try {
      const { data: response } = await axiosInstance.post(`/api/giving-backs/${givingId}/update`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.message || 'Record updated successfully');
      if (response.giving_back?.image_slider) {
        setCurrentImages(JSON.parse(response.giving_back.image_slider));
        setFormData((prev) => ({ ...prev, image_slider: null }));
      }
      setTimeout(() => navigate('/giving/back'), 2000);
    } catch {
      setErrors((prev) => ({ ...prev, general: 'Failed to update record' }));
      toast.error('Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image: string): string => {
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    return `${baseUrl}/${image.startsWith('/') ? image.slice(1) : image}`;
  };

  if (fetchError) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <ToastContainer position="top-right" autoClose={3000} />
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
        <p className="mb-4 text-red-600">{fetchError}</p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/giving-backs')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit Giving Back</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="givingBack_category" className="block text-sm font-medium text-gray-700">
            Category <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="givingBack_category"
            name="givingBack_category"
            value={formData.givingBack_category}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 rounded-md border ${
              errors.givingBack_category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            } focus:outline-none focus:ring-2`}
          />
          {errors.givingBack_category && <p className="mt-1 text-sm text-red-500">{errors.givingBack_category}</p>}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`mt-1 block w-full p-3 rounded-md border ${
              errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            } focus:outline-none focus:ring-2`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>
        <div>
          <label htmlFor="weblink" className="block text-sm font-medium text-gray-700">
            Web Link
          </label>
          <input
            type="url"
            id="weblink"
            name="weblink"
            value={formData.weblink}
            onChange={handleChange}
            className={`mt-1 block w-full p-3 rounded-md border ${
              errors.weblink ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            } focus:outline-none focus:ring-2`}
          />
          {errors.weblink && <p className="mt-1 text-sm text-red-500">{errors.weblink}</p>}
        </div>
        <div>
          <label htmlFor="image_slider" className="block text-sm font-medium text-gray-700">
            Replace Images
          </label>
          {currentImages?.length ? (
            <div className="my-2">
              <p className="text-sm text-gray-600 mb-1">Current Images:</p>
              <div className="flex flex-wrap gap-2">
                {currentImages.map((image, index) => (
                  <img
                    key={index}
                    src={getImageUrl(image)}
                    alt={`Image ${index + 1}`}
                    className="h-32 w-auto object-contain rounded border-gray-200"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/128?text=Error';
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
          <input
            type="file"
            id="image_slider"
            name="image_slider"
            accept="image/jpeg,image/png,image/jpg,image/gif"
            multiple
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {errors.image_slider && <p className="mt-1 text-sm text-red-500">{errors.image_slider}</p>}
          <p className="mt-1 text-xs text-gray-500">Max: 2MB. Allowed: JPEG, PNG, JPG, GIF.</p>
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/giving/back')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(EditGivingBack);