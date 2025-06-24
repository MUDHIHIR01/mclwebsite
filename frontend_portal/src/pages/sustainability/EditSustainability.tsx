import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validateForm } from './AddSustainability';

interface FormData {
  sustain_category: string;
  description: string;
  weblink: string;
  sustain_pdf_file: File | null;
  sustain_image_file: File | null;
}

interface FormErrors {
  sustain_category?: string;
  description?: string;
  weblink?: string;
  sustain_pdf_file?: string;
  sustain_image_file?: string;
}

const EditSustainability: React.FC = () => {
  const navigate = useNavigate();
  const { sustainabilityId } = useParams<{ sustainabilityId: string }>();
  const [formData, setFormData] = useState<FormData>({
    sustain_category: '',
    description: '',
    weblink: '',
    sustain_pdf_file: null,
    sustain_image_file: null,
  });
  const [currentFiles, setCurrentFiles] = useState<{ pdf: string | null; image: string | null }>({
    pdf: null,
    image: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSustainability = async () => {
      if (!sustainabilityId) {
        toast.error('Sustainability ID is missing.');
        navigate('/sustainability');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/sustainability/${sustainabilityId}`);
        setFormData({
          sustain_category: response.data.data?.sustain_category || '',
          description: response.data.data?.description || '',
          weblink: response.data.data?.weblink || '',
          sustain_pdf_file: null,
          sustain_image_file: null,
        });
        setCurrentFiles({
          pdf: response.data.data?.sustain_pdf_file || null,
          image: response.data.data?.sustain_image_file || null,
        });
      } catch (error) {
        toast.error('Failed to fetch sustainability record');
        console.error('Fetch error:', error);
        navigate('/sustainability');
      }
    };

    fetchSustainability();
  }, [sustainabilityId, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'sustain_pdf_file' | 'sustain_image_file'
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [field]: file }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const payload = new FormData();
    payload.append('sustain_category', formData.sustain_category);
    payload.append('description', formData.description || '');
    payload.append('weblink', formData.weblink || '');
    if (formData.sustain_pdf_file) {
      payload.append('sustain_pdf_file', formData.sustain_pdf_file);
    }
    if (formData.sustain_image_file) {
      payload.append('sustain_image_file', formData.sustain_image_file);
    }

    try {
      const response = await axiosInstance.post(`/api/sustainability/${sustainabilityId}/update`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Sustainability record updated successfully');
      setCurrentFiles({
        pdf: response.data.sustainability?.sustain_pdf_file || currentFiles.pdf,
        image: response.data.sustainability?.sustain_image_file || currentFiles.image,
      });
      setFormData((prev) => ({ ...prev, sustain_pdf_file: null, sustain_image_file: null }));
      setTimeout(() => navigate('/sustainability'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update sustainability record';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (filePath: string | null): string | undefined => {
    if (!filePath) return undefined;
    const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
    return `${baseUrl}/${filePath.replace(/^\//, '')}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit Sustainability
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="sustain_category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              id="sustain_category"
              name="sustain_category"
              value={formData.sustain_category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter category"
            />
            {errors.sustain_category && (
              <p id="sustain_category-error" className="mt-1 text-sm text-red-500">
                {errors.sustain_category}
              </p>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter description"
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">
                {errors.description}
              </p>
            )}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter web link"
            />
            {errors.weblink && (
              <p id="weblink-error" className="mt-1 text-sm text-red-500">
                {errors.weblink}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="sustain_pdf_file" className="block text-sm font-medium text-gray-700">
              PDF File (optional)
            </label>
            {currentFiles.pdf && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current PDF:</p>
                <a
                  href={getFileUrl(currentFiles.pdf)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 underline text-sm"
                >
                  View Current PDF
                </a>
              </div>
            )}
            <input
              type="file"
              id="sustain_pdf_file"
              name="sustain_pdf_file"
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, 'sustain_pdf_file')}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.sustain_pdf_file && (
              <p className="mt-1 text-sm text-gray-600">Selected: {formData.sustain_pdf_file.name}</p>
            )}
            {errors.sustain_pdf_file && (
              <p id="sustain_pdf_file-error" className="mt-1 text-sm text-red-500">
                {errors.sustain_pdf_file}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed type: PDF.</p>
          </div>

          <div>
            <label htmlFor="sustain_image_file" className="block text-sm font-medium text-gray-700">
              Image File (optional)
            </label>
            {currentFiles.image && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <a
                  href={getFileUrl(currentFiles.image)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 underline text-sm"
                >
                  View Current Image
                </a>
              </div>
            )}
            <input
              type="file"
              id="sustain_image_file"
              name="sustain_image_file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => handleFileChange(e, 'sustain_image_file')}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.sustain_image_file && (
              <p className="mt-1 text-sm text-gray-600">Selected: {formData.sustain_image_file.name}</p>
            )}
            {errors.sustain_image_file && (
              <p id="sustain_image_file-error" className="mt-1 text-sm text-red-500">
                {errors.sustain_image_file}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: PNG, JPEG, JPG.</p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-md text-white font-semibold ${
                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
              } transition`}
            >
              {loading ? 'Updating...' : 'Update Sustainability'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSustainability;