import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  heading: string;
  description: string;
  home_img: File | null;
}

type FormErrors = { [K in keyof FormData]?: string; };

const AddOurStandardHome: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({ heading: '', description: '', home_img: null });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, home_img: file }));
    setErrors((prev) => ({ ...prev, home_img: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.heading.trim()) newErrors.heading = 'Heading is required';
    if (formData.heading.length > 255) newErrors.heading = 'Heading must not exceed 255 characters';
    if (formData.home_img && !['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.home_img.type)) {
      newErrors.home_img = 'Only JPG, PNG, GIF files are allowed';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const payload = new FormData();
    payload.append('heading', formData.heading);
    payload.append('description', formData.description);
    if (formData.home_img) payload.append('home_img', formData.home_img);

    try {
      await axiosInstance.post('/api/our-standard-home', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Record created successfully!', { position: 'top-right' });
      setTimeout(() => navigate('/our-standards/home'), 1500);
    } catch (err: any) {
      const errorData = err.response?.data || {};
      toast.error(errorData.error || 'Failed to create record.', { position: 'top-right' });
      if (errorData.errors) {
        setErrors(Object.fromEntries(Object.entries(errorData.errors).map(([key, value]) => [key, (value as string[])[0]])));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100">
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Our Standard Home Entry</h2>
        <div className="space-y-6">
          {/* Form fields are identical to Edit, which is good for consistency */}
          <div>
            <label htmlFor="heading" className="block text-sm font-medium text-gray-700">Heading <span className="text-red-500">*</span></label>
            <input type="text" id="heading" name="heading" value={formData.heading} onChange={handleChange} className={`mt-1 w-full rounded-md border p-3 ${errors.heading ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.heading && <p className="mt-1 text-sm text-red-500">{errors.heading}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className={`mt-1 w-full rounded-md border p-3 ${errors.description ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>
          <div>
            <label htmlFor="home_img" className="block text-sm font-medium text-gray-700">Image</label>
            <input type="file" id="home_img" name="home_img" accept="image/*" onChange={handleFileChange} className="mt-1 w-full text-sm" />
            {errors.home_img && <p className="mt-1 text-sm text-red-500">{errors.home_img}</p>}
            <p className="mt-1 text-xs text-gray-500">Max 2MB. JPG, PNG, GIF.</p>
          </div>
          <div className="flex justify-end gap-4">
            <button onClick={() => navigate('/our-standards/home')} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${loading ? 'opacity-50' : ''}`}>
              {loading ? 'Creating...' : 'Create Entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOurStandardHome;