import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  givingBack_category: string;
  description: string;
  weblink: string;
  image_slider: File[];
}

interface FormErrors {
  givingBack_category?: string;
  description?: string;
  weblink?: string;
  image_slider?: string;
}

const AddGivingBack: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    givingBack_category: '',
    description: '',
    weblink: '',
    image_slider: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, image_slider: files }));
    if (errors.image_slider) {
      setErrors((prev) => ({ ...prev, image_slider: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.givingBack_category.trim()) {
      newErrors.givingBack_category = 'Category is required';
    } else if (formData.givingBack_category.length > 255) {
      newErrors.givingBack_category = 'Category must not exceed 255 characters';
    }

    if (formData.weblink) {
      try {
        new URL(formData.weblink);
      } catch (_) {
        newErrors.weblink = 'Please enter a valid URL';
      }
    }

    if (formData.image_slider.length === 0) {
      newErrors.image_slider = 'At least one image is required';
    } else {
      for (const file of formData.image_slider) {
        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
          newErrors.image_slider = 'Only JPEG, PNG, JPG, or GIF files are allowed';
          break;
        }
        if (file.size > 2 * 1024 * 1024) {
          newErrors.image_slider = 'Each image must not exceed 2MB';
          break;
        }
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
    payload.append('givingBack_category', formData.givingBack_category);
    payload.append('description', formData.description || '');
    payload.append('weblink', formData.weblink || '');

    formData.image_slider.forEach((file) => {
      payload.append('image_slider[]', file);
    });

    try {
      const response = await axiosInstance.post('/api/giving-backs', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Giving Back entry created successfully!', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/giving/back'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create entry.';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Create New Giving Back Entry
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="givingBack_category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <input
              type="text"
              id="givingBack_category"
              name="givingBack_category"
              value={formData.givingBack_category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
              placeholder="Enter category"
              maxLength={255}
              required
            />
            {errors.givingBack_category && (
              <p className="mt-1 text-sm text-red-500">{errors.givingBack_category}</p>
            )}
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
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
              placeholder="Enter description (optional)"
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>
          <div>
            <label htmlFor="weblink" className="block text-sm font-medium text-gray-700">
              Web Link (optional)
            </label>
            <input
              type="url"
              id="weblink"
              name="weblink"
              value={formData.weblink}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
              placeholder="https://example.com"
            />
            {errors.weblink && <p className="mt-1 text-sm text-red-500">{errors.weblink}</p>}
          </div>
          <div>
            <label htmlFor="image_slider" className="block text-sm font-medium text-gray-700">
              Image Slider (select one or more files) *
            </label>
            <input
              type="file"
              id="image_slider"
              name="image_slider"
              multiple
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.image_slider && <p className="mt-1 text-sm text-red-500">{errors.image_slider}</p>}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/giving/back')}
              className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating...' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGivingBack;