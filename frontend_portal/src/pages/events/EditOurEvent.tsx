import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  event_category: string;
  description: string;
  img_file: File | null;
  video_link: string;
}

interface FormErrors {
  event_category?: string;
  description?: string;
  img_file?: string;
  video_link?: string;
}

const EditOurEvent: React.FC = () => {
  const navigate = useNavigate();
  const { event_id } = useParams<{ event_id: string }>();

  const [formData, setFormData] = useState<FormData>({
    event_category: '',
    description: '',
    img_file: null,
    video_link: '',
  });
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentVideoLink, setCurrentVideoLink] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!event_id) {
        toast.error('Event ID is missing from the URL.');
        navigate('/our-events');
        return;
      }
      try {
        const response = await axiosInstance.get(`/api/events/${event_id}`);
        const eventData = response.data.event;
        setFormData({
          event_category: eventData?.event_category || '',
          description: eventData?.description || '',
          img_file: null,
          video_link: eventData?.video_link || '',
        });
        setCurrentImage(eventData?.img_file || null);
        setCurrentVideoLink(eventData?.video_link || null);
      } catch (error) {
        toast.error('Failed to fetch the event record.');
        console.error("Fetch error:", error);
        navigate('/our-events');
      }
    };
    fetchEvent();
  }, [event_id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [name]: file }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.event_category.trim()) {
      newErrors.event_category = 'Category is required';
    } else if (formData.event_category.length > 255) {
      newErrors.event_category = 'Category must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 100000) {
      newErrors.description = 'Description must not exceed 100000 characters';
    }

    if (formData.img_file) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.img_file.type)) {
        newErrors.img_file = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.img_file.size > 2 * 1024 * 1024) {
        newErrors.img_file = 'Image size must not exceed 2MB';
      }
    }

    if (formData.video_link) {
      try {
        new URL(formData.video_link);
      } catch {
        newErrors.video_link = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warn('Please fix the validation errors.');
      return;
    }

    setLoading(true);
    const payload = new FormData();
    payload.append('event_category', formData.event_category);
    payload.append('description', formData.description || '');
    if (formData.img_file) {
      payload.append('img_file', formData.img_file);
    }
    if (formData.video_link) {
      payload.append('video_link', formData.video_link);
    }

    try {
      const response = await axiosInstance.post(`/api/events/${event_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message || 'Event record updated successfully!');
      setTimeout(() => navigate('/our-events'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update event record.';
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setErrors(backendErrors);
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (filePath: string | null): string | null => {
    if (!filePath) return null;
    const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
    return `${baseUrl}/${filePath.replace(/^\//, "")}`;
  };

  const displayImageUrl = getFileUrl(currentImage);

  const inputBaseClasses = 'mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base';
  const inputBorderClasses = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  const inputErrorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500';

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit Event
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="event_category" className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
            <input type="text" id="event_category" name="event_category" value={formData.event_category} onChange={handleChange} className={`${inputBaseClasses} ${errors.event_category ? inputErrorClasses : inputBorderClasses}`} placeholder="Enter category" maxLength={255} />
            {errors.event_category && <p className="mt-1 text-sm text-red-500">{errors.event_category}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description <span className="text-gray-500">(optional)</span></label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className={`${inputBaseClasses} ${errors.description ? inputErrorClasses : inputBorderClasses}`} placeholder="Enter description" maxLength={100000} />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>
          <div>
            <label htmlFor="img_file" className="block text-sm font-medium text-gray-700">Event Image <span className="text-gray-500">(optional, replace current)</span></label>
            {displayImageUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img src={displayImageUrl} alt="Current Event" className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
            )}
            <input type="file" id="img_file" name="img_file" accept="image/jpeg,image/png,image/jpg,image/gif" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {errors.img_file && <p className="mt-1 text-sm text-red-500">{errors.img_file}</p>}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          <div>
            <label htmlFor="video_link" className="block text-sm font-medium text-gray-700">Video Link <span className="text-gray-500">(optional)</span></label>
            <input type="url" id="video_link" name="video_link" value={formData.video_link} onChange={handleChange} className={`${inputBaseClasses} ${errors.video_link ? inputErrorClasses : inputBorderClasses}`} placeholder="Enter video URL" />
            {errors.video_link && <p className="mt-1 text-sm text-red-500">{errors.video_link}</p>}
            {currentVideoLink && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Video Link:</p>
                <a href={currentVideoLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 hover:underline text-sm font-medium">View Current Video</a>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button type="button" onClick={() => navigate('/our-events')} className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition shadow-sm font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={loading} className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-semibold flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOurEvent;