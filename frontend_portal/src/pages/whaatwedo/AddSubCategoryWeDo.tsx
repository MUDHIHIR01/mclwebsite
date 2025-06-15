import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Category {
  what_we_do_id: number;
  category: string;
}

const AddSubCategoryWeDo: React.FC = () => {
  const [whatWeDoId, setWhatWeDoId] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imgUrl, setImgUrl] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [webUrl, setWebUrl] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const response = await axiosInstance.get<{ categories: Category[] }>('/api/whatwedo/categories');
      setCategories(response.data.categories);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch categories.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 2048 * 1024) {
        toast.error('Image size must be less than 2MB.');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
        toast.error('Invalid image format. Use JPEG, PNG, JPG, or GIF.');
        return;
      }
      setImgUrl(file);
      setImgPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('what_we_do_id', whatWeDoId);
      formData.append('subcategory', subcategory);
      if (description) formData.append('description', description);
      if (imgUrl) formData.append('img_url', imgUrl);
      if (webUrl) formData.append('web_url', webUrl);

      try {
        await axiosInstance.post('/api/subcategories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Subcategory created successfully!');
        navigate('/subcategories/we-do');
      } catch (err: any) {
        const errorMessage = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : err.response?.data?.error || 'Failed to create subcategory.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [whatWeDoId, subcategory, description, imgUrl, webUrl, navigate]
  );

  if (loadingCategories) {
    return <div className="flex justify-center items-center min-h-screen"><div className="text-lg font-semibold">Loading categories...</div></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Create Subcategory</h2>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              value={whatWeDoId}
              onChange={(e) => setWhatWeDoId(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.what_we_do_id} value={category.what_we_do_id}>
                  {category.category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">Subcategory Name</label>
            <input
              id="subcategory"
              type="text"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={255}
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
              maxLength={1000}
            />
          </div>
          <div>
            <label htmlFor="img_url" className="block text-sm font-medium text-gray-700">Image</label>
            {imgPreview && (
              <img
                src={imgPreview}
                alt="Image preview"
                className="mt-2 h-32 w-32 object-cover rounded"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=Error';
                  (e.currentTarget as HTMLImageElement).alt = 'Image load error';
                }}
              />
            )}
            <input
              id="img_url"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleImageChange}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Max size: 2MB. Formats: JPEG, PNG, JPG, GIF.</p>
          </div>
          <div>
            <label htmlFor="web_url" className="block text-sm font-medium text-gray-700">Web URL</label>
            <input
              id="web_url"
              type="url"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={255}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/subcategories/we-do')}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>}
              Create Subcategory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubCategoryWeDo;