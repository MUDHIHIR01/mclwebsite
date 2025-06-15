import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddContactUs: React.FC = () => {
  const [category, setCategory] = useState('');
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [urlLink, setUrlLink] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('category', category);
    if (imgFile) {
      formData.append('img_file', imgFile);
    }
    if (urlLink) {
      formData.append('url_link', urlLink);
    }
    if (description) {
      formData.append('description', description);
    }

    try {
      await axiosInstance.post('/api/contact-us', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Contact record created successfully!', { position: 'top-right' });
      navigate('/contact-us');
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ') 
        : 'Failed to create contact record.';
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-right' });
      console.error("Create error:", err);
    }
  }, [category, imgFile, urlLink, description, navigate]);

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Create Contact Record</h2>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <label htmlFor="img_file" className="block text-sm font-medium text-gray-700">Image</label>
            <input
              id="img_file"
              type="file"
              accept="image/*"
              onChange={(e) => setImgFile(e.target.files ? e.target.files[0] : null)}
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
              onClick={() => navigate('/contact-us')}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Create Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactUs;