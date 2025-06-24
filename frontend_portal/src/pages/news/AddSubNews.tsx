import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the form's data structure
interface FormData {
  news_id: string;
  img_url: File | null;
  heading: string;
  description: string;
  twitter_link: string;
  facebook_link: string;
  instagram_link: string;
  email_url: string;
}

// Interface for the form's validation error messages
interface FormErrors {
  news_id?: string;
  img_url?: string;
  heading?: string;
  description?: string;
  twitter_link?: string;
  facebook_link?: string;
  instagram_link?: string;
  email_url?: string;
}

// Interface for the news category options from the API
interface NewsOption {
  news_id: number;
  category: string;
}

/**
 * A form component for adding a new "sub-news" item.
 * It includes fields for associating with a parent news category, a heading, description,
 * an optional image upload, and social media links.
 */
const AddSubNews: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    news_id: '',
    img_url: null,
    heading: '',
    description: '',
    twitter_link: '',
    facebook_link: '',
    instagram_link: '',
    email_url: '',
  });
  const [newsOptions, setNewsOptions] = useState<NewsOption[]>([]);
  // Use the dedicated FormErrors interface for the errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axiosInstance.get('/api/news');
        // Handle potentially different API response structures defensively
        setNewsOptions(response.data.news || response.data);
      } catch (error) {
        toast.error('Failed to fetch news categories.');
        console.error("Fetch news error:", error);
      }
    };
    fetchNews();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for the field being changed
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, img_url: file }));
    // Clear the image-related error
    if (errors.img_url) {
      setErrors((prev) => ({ ...prev, img_url: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;

    if (!formData.news_id) {
      newErrors.news_id = 'News category is required';
    }

    if (!formData.heading.trim()) {
      newErrors.heading = 'Heading is required';
    } else if (formData.heading.length > 255) {
      newErrors.heading = 'Heading must not exceed 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.img_url) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.img_url.type)) {
        newErrors.img_url = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.img_url.size > 2 * 1024 * 1024) { // 2MB
        newErrors.img_url = 'Image size must not exceed 2MB';
      }
    }

    // Validate optional URL fields only if they have a value
    if (formData.twitter_link && !urlRegex.test(formData.twitter_link)) {
      newErrors.twitter_link = 'Please enter a valid URL';
    }
    if (formData.facebook_link && !urlRegex.test(formData.facebook_link)) {
      newErrors.facebook_link = 'Please enter a valid URL';
    }
    if (formData.instagram_link && !urlRegex.test(formData.instagram_link)) {
      newErrors.instagram_link = 'Please enter a valid URL';
    }
    if (formData.email_url && !urlRegex.test(formData.email_url)) {
      newErrors.email_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warn('Please fix the errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('news_id', formData.news_id);
      payload.append('heading', formData.heading);
      payload.append('description', formData.description || '');
      if (formData.img_url) {
        payload.append('img_url', formData.img_url);
      }
      payload.append('twitter_link', formData.twitter_link || '');
      payload.append('facebook_link', formData.facebook_link || '');
      payload.append('instagram_link', formData.instagram_link || '');
      payload.append('email_url', formData.email_url || '');

      const response = await axiosInstance.post('/api/sub-news', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message || 'Sub-news record created successfully!');
      setTimeout(() => navigate('/sub-news'), 2000);

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create sub-news record.';
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        setErrors(backendErrors);
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Create New Sub-News
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* News Category */}
          <div>
            <label htmlFor="news_id" className="block text-sm font-medium text-gray-700">
              News Category *
            </label>
            <select
              id="news_id"
              name="news_id"
              value={formData.news_id}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.news_id ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-blue-500`}
              aria-invalid={!!errors.news_id}
              aria-describedby={errors.news_id ? 'news_id-error' : undefined}
            >
              <option value="">Select a news category</option>
              {newsOptions.map((news) => (
                <option key={news.news_id} value={news.news_id}>
                  {news.category}
                </option>
              ))}
            </select>
            {errors.news_id && <p id="news_id-error" className="mt-1 text-sm text-red-500">{errors.news_id}</p>}
          </div>

          {/* Heading */}
          <div>
            <label htmlFor="heading" className="block text-sm font-medium text-gray-700">
              Heading *
            </label>
            <input
              type="text"
              id="heading"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.heading ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-blue-500`}
              placeholder="Enter heading"
              maxLength={255}
              aria-invalid={!!errors.heading}
            />
            {errors.heading && <p className="mt-1 text-sm text-red-500">{errors.heading}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-blue-500`}
              placeholder="Enter description"
              maxLength={1000}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="img_url" className="block text-sm font-medium text-gray-700">
              Image <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="file"
              id="img_url"
              name="img_url"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.img_url && <p className="mt-1 text-sm text-red-500">{errors.img_url}</p>}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="twitter_link" className="block text-sm font-medium text-gray-700">Twitter Link <span className="text-gray-500">(optional)</span></label>
              <input type="url" id="twitter_link" name="twitter_link" value={formData.twitter_link} onChange={handleChange} className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 ${errors.twitter_link ? 'border-red-500' : 'border-gray-300'}`} placeholder="https://twitter.com/example" />
              {errors.twitter_link && <p className="mt-1 text-sm text-red-500">{errors.twitter_link}</p>}
            </div>
            <div>
              <label htmlFor="facebook_link" className="block text-sm font-medium text-gray-700">Facebook Link <span className="text-gray-500">(optional)</span></label>
              <input type="url" id="facebook_link" name="facebook_link" value={formData.facebook_link} onChange={handleChange} className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 ${errors.facebook_link ? 'border-red-500' : 'border-gray-300'}`} placeholder="https://facebook.com/example" />
              {errors.facebook_link && <p className="mt-1 text-sm text-red-500">{errors.facebook_link}</p>}
            </div>
            <div>
              <label htmlFor="instagram_link" className="block text-sm font-medium text-gray-700">Instagram Link <span className="text-gray-500">(optional)</span></label>
              <input type="url" id="instagram_link" name="instagram_link" value={formData.instagram_link} onChange={handleChange} className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 ${errors.instagram_link ? 'border-red-500' : 'border-gray-300'}`} placeholder="https://instagram.com/example" />
              {errors.instagram_link && <p className="mt-1 text-sm text-red-500">{errors.instagram_link}</p>}
            </div>
            <div>
              <label htmlFor="email_url" className="block text-sm font-medium text-gray-700">Email Link <span className="text-gray-500">(optional)</span></label>
              <input type="url" id="email_url" name="email_url" value={formData.email_url} onChange={handleChange} className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 ${errors.email_url ? 'border-red-500' : 'border-gray-300'}`} placeholder="mailto:example@example.com" />
              {errors.email_url && <p className="mt-1 text-sm text-red-500">{errors.email_url}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <button type="button" onClick={() => navigate('/sub-news')} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm font-semibold">
              Cancel
            </button>
            <button type="submit" disabled={loading} className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold flex items-center justify-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Sub-News'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubNews;