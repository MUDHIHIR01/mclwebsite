import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ContactData {
  contactus_id: number;
  category: string;
  img_file: string | null;
  url_link: string | null;
  description: string | null;
}

const EditContactUs: React.FC = () => {
  const { cont_us_id } = useParams<{ cont_us_id: string }>();
  const [category, setCategory] = useState('');
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [urlLink, setUrlLink] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchContact = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // **FIX: Changed the generic type to accurately describe the API response.**
      // This tells TypeScript the response data has all the properties of ContactData,
      // AND it might also have an optional 'contact' property that contains the ContactData.
      const response = await axiosInstance.get<{ contact?: ContactData } & ContactData>(
        `/api/contact-us/${cont_us_id}`
      );

      // This line is now type-safe and will no longer cause an error.
      const contact = response.data.contact || response.data;

      setCategory(contact.category);
      setUrlLink(contact.url_link || '');
      setDescription(contact.description || '');
    } catch (err: any) {
      const errorMessage = 'Failed to fetch contact record: ' + (err.response?.data?.error || err.message || 'Unknown error');
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, [cont_us_id]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

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
    
    // For Laravel updates with multipart/form-data, POST is often used with a _method field.
    // If your route is Route::put(...) or Route::patch(...), you might need this:
    // formData.append('_method', 'PUT');

    try {
      // Using POST for updates is common with FormData.
      await axiosInstance.post(`/api/contact-us/${cont_us_id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Contact record updated successfully!', { position: 'top-right' });
      navigate('/contact-us');
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ') 
        : 'Failed to update contact record.';
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-right' });
      console.error("Update error:", err);
    }
  }, [category, imgFile, urlLink, description, cont_us_id, navigate]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="text-lg font-semibold">Loading...</div></div>;

  if (error && !loading) { // Added !loading to prevent showing error and loader at the same time
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="text-red-500 text-xl font-semibold mb-4">Error</div>
        <p className="text-gray-700 mb-2">{error}</p>
        <button
          onClick={fetchContact}
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
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Edit Contact Record</h2>
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
              Update Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactUs;