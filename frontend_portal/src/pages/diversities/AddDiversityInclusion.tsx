import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../axios'; // Adjust path as needed
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddDiversity() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const formData = new FormData();
    formData.append('diversity_category', category);
    formData.append('description', description);
    if (pdfFile) {
      formData.append('pdf_file', pdfFile);
    }

    try {
      // POST /api/diversity
      await axiosInstance.post('/api/diversity', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Record created successfully!', { position: 'top-right' });
      navigate('/diversityInclusion');
    } catch (err: any) {
      toast.error('Failed to create record. Please check the form.', { position: 'top-right' });
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Add Diversity & Inclusion</h2>
          <Link to="/diversityInclusion" className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">
            Back to List
          </Link>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${errors.diversity_category ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.diversity_category && <p className="text-red-500 text-xs mt-1">{errors.diversity_category}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mb-1">PDF File (Optional)</label>
            <input
              id="pdfFile"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${errors.pdf_file ? 'border border-red-500 rounded-lg p-1' : ''}`}
            />
             {errors.pdf_file && <p className="text-red-500 text-xs mt-1">{errors.pdf_file}</p>}
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}