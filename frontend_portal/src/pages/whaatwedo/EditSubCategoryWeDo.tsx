import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  what_we_do_id: string;
  subcategory: string;
  description: string;
  web_url: string;
}

interface Category {
  what_we_do_id: number;
  category: string;
}

const EditSubCategoryWeDo: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Use 'id' to match the route
  const [formData, setFormData] = useState<FormData>({
    what_we_do_id: '',
    subcategory: '',
    description: '',
    web_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get<{ categories: Category[] }>('/api/whatwedo/categories');
        setCategories(response.data.categories || []);
      } catch (error) {
        toast.error('Failed to fetch categories.');
      }
    };
    
    const fetchSubcategory = async () => {
      if (!id) return;
      try {
        const response = await axiosInstance.get(`/api/subcategories/${id}`);
        const { subcategory: data } = response.data;
        setFormData({
          what_we_do_id: data.what_we_do_id?.toString() || '',
          subcategory: data.subcategory || '',
          description: data.description || '',
          web_url: data.web_url || '',
        });
        setCurrentImageUrl(data.img_url || null);
      } catch (error) {
        toast.error('Failed to fetch subcategory data.');
        navigate('/subcategories/we-do');
      }
    };

    fetchCategories();
    fetchSubcategory();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must not exceed 2MB.');
        return;
      }
      setImageFile(file);
      if (errors.img_url) setErrors((prev) => ({ ...prev, img_url: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const payload = new FormData();
    payload.append('what_we_do_id', formData.what_we_do_id);
    payload.append('subcategory', formData.subcategory);
    payload.append('description', formData.description || '');
    payload.append('web_url', formData.web_url || '');
    if (imageFile) {
      payload.append('img_url', imageFile);
    }
    payload.append('_method', 'PUT'); // For Laravel to handle PUT with FormData

    try {
      const response = await axiosInstance.post(`/api/subcategories/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Subcategory updated successfully!');
      setTimeout(() => navigate('/subcategories/we-do'), 1500);
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error('Please correct the validation errors.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to update subcategory.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fullImageUrl = currentImageUrl ? `${axiosInstance.defaults.baseURL}/${currentImageUrl}` : '';

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Edit Subcategory</h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="what_we_do_id" className="block text-sm font-medium text-gray-700">Category *</label>
            <select id="what_we_do_id" name="what_we_do_id" value={formData.what_we_do_id} onChange={handleChange} className={`mt-1 w-full p-2 border rounded-lg ${errors.what_we_do_id ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select Category</option>
              {categories.map((cat) => (<option key={cat.what_we_do_id} value={cat.what_we_do_id}>{cat.category}</option>))}
            </select>
            {errors.what_we_do_id && <p className="mt-1 text-sm text-red-500">{errors.what_we_do_id}</p>}
          </div>
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">Subcategory *</label>
            <input type="text" id="subcategory" name="subcategory" value={formData.subcategory} onChange={handleChange} className={`mt-1 w-full p-2 border rounded-lg ${errors.subcategory ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.subcategory && <p className="mt-1 text-sm text-red-500">{errors.subcategory}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className={`mt-1 w-full p-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>
           <div>
            <label htmlFor="web_url" className="block text-sm font-medium text-gray-700">Web URL</label>
            <input type="url" id="web_url" name="web_url" value={formData.web_url} onChange={handleChange} className={`mt-1 w-full p-2 border rounded-lg ${errors.web_url ? 'border-red-500' : 'border-gray-300'}`} placeholder="https://example.com" />
            {errors.web_url && <p className="mt-1 text-sm text-red-500">{errors.web_url}</p>}
          </div>
          <div>
            <label htmlFor="img_url" className="block text-sm font-medium text-gray-700">Change Image</label>
            {fullImageUrl && <div className="my-2"><p className="text-sm text-gray-600 mb-1">Current:</p><img src={fullImageUrl} alt="Current" className="h-32 w-auto max-w-xs object-contain rounded border" onError={(e) => { e.currentTarget.style.display='none'; }} /></div>}
            <input type="file" id="img_url" name="img_url" accept="image/jpeg,image/png,image/jpg,image/gif" onChange={handleFileChange} className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${errors.img_url ? 'ring-2 ring-red-500' : ''}`} />
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Leave empty to keep the current image.</p>
            {errors.img_url && <p className="mt-1 text-sm text-red-500">{errors.img_url}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => navigate('/subcategories/we-do')} className="px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50" disabled={loading}>Cancel</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
               {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
              {loading ? 'Updating...' : 'Update Subcategory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubCategoryWeDo;