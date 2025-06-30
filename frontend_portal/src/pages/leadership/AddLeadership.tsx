import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  leader_name: string;
  position: string;
  level: string; // Add level
  leader_image: File | null;
  description: string;
}

type FormErrors = {
  [K in keyof FormData]?: string;
};

const AddLeadership: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    leader_name: '',
    position: '',
    level: '', // Initialize level
    leader_image: null,
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, leader_image: file }));
    if (errors.leader_image) {
      setErrors((prev) => ({ ...prev, leader_image: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.leader_name.trim()) newErrors.leader_name = 'Leader name is required';
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.level) newErrors.level = 'Level is required'; // Validate level

    if (formData.leader_image) {
        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.leader_image.type)) {
            newErrors.leader_image = 'Only JPEG, PNG, JPG, or GIF files are allowed';
        } else if (formData.leader_image.size > 2 * 1024 * 1024) {
            newErrors.leader_image = 'Image size must not exceed 2MB';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('leader_name', formData.leader_name);
      payload.append('position', formData.position);
      payload.append('level', formData.level); // Append level
      payload.append('description', formData.description || '');
      if (formData.leader_image) {
        payload.append('leader_image', formData.leader_image);
      }

      const response = await axiosInstance.post('/api/leadership', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Leadership record created successfully');
      setTimeout(() => navigate('/leadership'), 2000);
    } catch (error: unknown) {
      let errorMessage = 'Failed to create leadership record';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        const backendErrors = error.response.data?.errors;
        if (backendErrors) setErrors(backendErrors);
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Create New Leadership
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="leader_name" className="block text-sm font-medium text-gray-700">Leader Name *</label>
            <input
              type="text" id="leader_name" name="leader_name"
              value={formData.leader_name} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.leader_name && <p className="mt-1 text-sm text-red-500">{errors.leader_name}</p>}
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position *</label>
            <input
              type="text" id="position" name="position"
              value={formData.position} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.position && <p className="mt-1 text-sm text-red-500">{errors.position}</p>}
          </div>
          
          {/* Level Dropdown */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700">Level *</label>
            <select
              id="level" name="level" value={formData.level} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            >
              <option value="" disabled>Select a level</option>
              <option value="Board of Directors">Board of Directors</option>
              <option value="Management">Management</option>
            </select>
            {errors.level && <p className="mt-1 text-sm text-red-500">{errors.level}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              id="description" name="description"
              value={formData.description} onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="leader_image" className="block text-sm font-medium text-gray-700">Leader Image (optional)</label>
            <input
              type="file" id="leader_image" name="leader_image"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.leader_image && <p className="mt-1 text-sm text-red-500">{errors.leader_image}</p>}
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/leadership')} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${loading ? 'opacity-50' : ''}`}>
              {loading ? 'Creating...' : 'Create Leadership'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadership;