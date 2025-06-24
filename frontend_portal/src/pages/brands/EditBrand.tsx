import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  category: string;
  description: string;
  brand_img: File | null;
}

const EditBrand = () => {
  const navigate = useNavigate();
  const { brand_id } = useParams<{ brand_id: string }>();
  const [formData, setFormData] = useState<FormData>({
    category: '',
    description: '',
    brand_img: null,
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBrand = async () => {
      if (!brand_id) {
        toast.error('Brand ID is missing.');
        navigate('/brands');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/brands/${brand_id}`);
        const brand = response.data;
        setFormData({
          category: brand.category || '',
          description: brand.description || '',
          brand_img: null,
        });
        setCurrentImage(brand.brand_img);
      } catch (error: any) {
        toast.error('Failed to fetch brand data.');
        navigate('/brands');
      }
    };
    fetchBrand();
  }, [brand_id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (formData.brand_img && !['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.brand_img.type)) {
      newErrors.brand_img = 'Only JPEG, PNG, JPG, or GIF files are allowed';
    } else if (formData.brand_img && formData.brand_img.size > 2 * 1024 * 1024) {
      newErrors.brand_img = 'Image size must not exceed 2MB';
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
    payload.append('description', formData.description || '');
    if (formData.brand_img) {
      payload.append('brand_img', formData.brand_img);
    }

    try {
      const response = await axiosInstance.post(`/api/edit/brand/${brand_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Brand updated successfully!');
      if (response.data.brand?.brand_img) {
        setCurrentImage(response.data.brand.brand_img);
      }
      setFormData((prev) => ({ ...prev, brand_img: null }));
      setTimeout(() => navigate('/brands'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update brand.';
      const backendErrors = error.response?.data?.errors || {};
      setErrors({
        category: backendErrors.category?.[0] || '',
        description: backendErrors.description?.[0] || '',
        brand_img: backendErrors.brand_img?.[0] || '',
      });
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

  const displayImageUrl = getImageUrl(currentImage);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Edit Brand</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              placeholder="Enter category (optional)"
              maxLength={255}
            />
            {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              placeholder="Enter description (optional)"
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>
          <div>
            <label htmlFor="brand_img" className="block text-sm font-medium text-gray-700">Change Brand Image (optional)</label>
            {displayImageUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img
                  src={displayImageUrl}
                  alt="Current Brand"
                  className="h-32 w-auto object-contain rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <input
              type="file"
              id="brand_img"
              name="brand_img"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.brand_img && <p className="mt-1 text-sm text-red-500">{errors.brand_img}</p>}
            <p className="mt-1 text-xs text-gray-500">Max size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/brands')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? 'Updating...' : 'Update Brand'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBrand;