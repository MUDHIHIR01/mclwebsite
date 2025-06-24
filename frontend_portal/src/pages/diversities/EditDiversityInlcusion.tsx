import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Data interface
interface DiversityData {
  diversity_id: number;
  diversity_category: string;
  description: string;
  pdf_file: string | null;
}

export default function EditDiversity() {
  const { dinc_Id } = useParams<{ dinc_Id: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdf, setExistingPdf] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<{ diversity: DiversityData }>(`/api/diversity/${dinc_Id}`);
        const data = response.data.diversity;
        setCategory(data.diversity_category);
        setDescription(data.description);
        setExistingPdf(data.pdf_file);
      } catch (err) {
        toast.error('Failed to load record data.', { position: 'top-right' });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [dinc_Id]);

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
      await axiosInstance.post(`/api/diversity/${dinc_Id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Record updated successfully!', { position: 'top-right' });
      navigate('/diversityInclusion');
    } catch (err: any) {
      toast.error('Failed to update record.', { position: 'top-right' });
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-10">Loading form...</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Edit Diversity & Inclusion</h2>
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
            <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mb-1">Upload New PDF (optional)</label>
            <input
              id="pdfFile"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {existingPdf && (
              <p className="text-xs text-gray-600 mt-2">
                Current file:{' '}
                <a
                  href={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${existingPdf}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View PDF
                </a>
                . Uploading a new file will replace it.
              </p>
            )}
            {pdfFile && <p className="text-xs text-green-600 mt-2">New file selected: {pdfFile.name}</p>}
            {errors.pdf_file && <p className="text-red-500 text-xs mt-1">{errors.pdf_file}</p>}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}