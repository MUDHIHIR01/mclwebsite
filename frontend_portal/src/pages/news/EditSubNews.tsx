import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  news_id: string;
  img_url: File | null;
  heading: string | null;
  description: string | null;
  twitter_link: string | null;
  facebook_link: string | null;
  instagram_link: string | null;
  email_url: string | null;
}

interface NewsOption {
  news_id: number;
  category: string;
}

const EditSubNews: React.FC = () => {
  const navigate = useNavigate();
  const { subnews_id } = useParams<{ subnews_id: string }>();
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
  const [currentImage, setCurrentImage] = useState(null);
  const [newsOptions, setNewsOptions] = useState<NewsOption[]>([]);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!subnews_id) {
        toast.error('Subnews ID is missing.');
        navigate('/sub-news');
        return;
      }
      try {
        const subnewsResponse = await axiosInstance.get(`/api/sub-news/${subnews_id}`);
        setFormData({
          news_id: subnewsResponse.data.sub_news?.news_id?.toString() || '',
          img_url: null,
          heading: subnewsResponse.data.sub_news?.heading || '',
          description: subnewsResponse.data.sub_news?.description || '',
          twitter_link: subnewsResponse.data.sub_news?.twitter_link || '',
          facebook_link: subnewsResponse.data.sub_news?.facebook_link || '',
          instagram_link: subnewsResponse.data.sub_news?.instagram_link || '',
          email_url: subnewsResponse.data.sub_news?.email_url || '',
        });
        setCurrentImage(subnewsResponse.data.sub_news?.img_url || null);
      } catch (error) {
        toast.error('Failed to fetch sub-news record');
        console.error("Fetch error:", error);
        navigate('/sub-news');
      }

      try {
        const newsResponse = await axiosInstance.get('/api/news');
        setNewsOptions(newsResponse.data || newsResponse.data);
      } catch (error) {
        toast.error('Failed to fetch news categories.');
        console.error("Fetch news error:", error);
      }
    };
    fetchData();
  }, [subnews_id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setFormData((prev) => ({ ...prev, img_url: file }));
      setErrors((prev) => ({ ...prev, img_url: '' }));
    };

    const validateForm = (): boolean => {
      const newErrors: Partial<FormData> = {};
      const urlRegex = /^(https?:\/\/)?(([\w-]+\.)+[\w-]+)(\/[\w-./?%&=]*)?$/;

      if (!formData.news_id) {
        newErrors.news_id = 'News category is required';
      }

      if (!formData.heading || !formData.heading.trim()) {
        newErrors.heading = 'Heading is required';
      } else if (formData.heading.length > 255) {
        newErrors.heading = 'Heading must not exceed 255 characters';
      }

      if (formData.description && formData.description.length > 1000) {
        newErrors.description = 'Description must not exceed 1000 characters';
      }

      if (formData.img_url && !['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.img_url.type)) {
        newErrors.img_url = 'Only JPEG, PNG, JPG, or GIF files are allowed';
      } else if (formData.img_url && formData.img_url.size > 2 * 1024 * 1024) {
        newErrors.img_url = 'Image size must not exceed 2MB';
      }

      if (formData.twitter_link && (!urlRegex.test(formData.twitter_link) || formData.twitter_link.length > 255)) {
        newErrors.twitter_link = 'Enter a valid URL (max 255 characters)';
      }

      if (formData.facebook_link && (!urlRegex.test(formData.facebook_link) || formData.facebook_link.length > 255)) {
        newErrors.facebook_link = 'Enter a valid URL (max 255 characters)';
      }

      if (formData.instagram_link && (!urlRegex.test(formData.instagram_link) || formData.instagram_link.length > 255)) {
        newErrors.instagram_link = 'Enter a valid URL (max 255 characters)';
      }

      if (formData.email_url && (!urlRegex.test(formData.email_url) || formData.email_url.length > 255)) {
        newErrors.email_url = 'Enter a valid URL (max 255 characters)';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setLoading(true);
      const payload = new FormData();
      payload.append('news_id', formData.news_id);
      if (formData.heading) {
        payload.append('heading', formData.heading);
      }
      payload.append('description', formData.description || '');
      if (formData.img_url) {
        payload.append('img_url', formData.img_url);
      }
      payload.append('twitter_link', formData.twitter_link || '');
      payload.append('facebook_link', formData.facebook_link || '');
      payload.append('instagram_link', formData.instagram_link || '');
      payload.append('email_url', formData.email_url || '');

      try {
        const response = await axiosInstance.post(`/api/sub-news/${subnews_id}/update`, payload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success(response.data.message || 'Sub-news record updated successfully');
        if (response.data.sub_news?.img_url) {
          setCurrentImage(response.data.sub_news.img_url);
          setFormData((prev) => ({ ...prev, img_url: null }));
        }
        setTimeout(() => navigate('/sub-news'), 2000);
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to update sub-news record';
        const backendErrors = error.response?.data?.errors || {};
        const formattedErrors: Partial<FormData> = {};
        for (const key in backendErrors) {
          if (key in formData) {
            formattedErrors[key as keyof FormData] = backendErrors[key][0];
          }
        }
        setErrors((prev) => ({ ...prev, ...formattedErrors }));
        toast.error(errorMessage);
        console.error("Submit error:", error);
      } finally {
        setLoading(false);
      }
    };

    const getFileUrl = (filePath: string | null): string | undefined => {
      if (!filePath) return undefined;
      const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
      const path = filePath.replace(/^\//, '');
      return `${baseUrl}/${path}`;
    };

    const displayImageUrl = getFileUrl(currentImage);

    return (
      <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px', zIndex: 9999 }} />
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
            Edit Sub-news
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="news_id" className="block text-sm font-medium text-gray-700">
                News Category <span className="text-red-500">*</span>
              </label>
              <select
                id="news_id"
                name="news_id"
                value={formData.news_id}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                  errors.news_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                } focus:ring-blue-500`}
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
              {errors.news_id && (
                <p id="news_id-error" className="mt-1 text-sm text-red-500">
                  {errors.news_id}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="heading" className="block text-sm font-medium text-gray-700">
                Heading <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="heading"
                name="heading"
                value={formData.heading || ''}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                  errors.heading ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                } focus:ring-blue-500`}
                placeholder="Enter heading"
                maxLength={255}
                aria-invalid={!!errors.heading}
                aria-describedby={errors.heading ? 'heading-error' : undefined}
              />
              {errors.heading && (
                <p id="heading-error" className="mt-1 text-sm text-red-500">
                {errors.heading}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 sm:text-base ${
                errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              } focus:ring-blue-500`}
              placeholder="Enter description"
              maxLength={1000}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="img_url" className="block text-sm font-medium text-gray-700">
              Image (optional)
            </label>
            {displayImageUrl && (
              <div className="my-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img
                  src={displayImageUrl}
                  alt="Current Sub-news"
                  className="h-32 w-auto max-w-xs object-contain rounded border border-gray-200"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=LoadError';
                    (e.currentTarget as HTMLImageElement).alt = 'Error loading current image';
                    console.warn("Error loading current image from URL:", displayImageUrl);
                  }}
                />
              </div>
            )}
            <input
              type="file"
              id="img_url"
              name="img_url"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.img_url && (
              <p id="img_url-error" className="mt-1 text-sm text-red-500">
                {errors.img_url}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Max file size: 2MB. Allowed types: JPG, PNG, GIF.</p>
          </div>
          <div>
            <label htmlFor="twitter_link" className="block text-sm font-medium text-gray-700">
              Twitter Link (optional)
            </label>
            <input
              type="url"
              id="twitter_link"
              name="twitter_link"
              value={formData.twitter_link || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.twitter_link ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              } focus:ring-blue-500`}
              placeholder="Enter Twitter URL"
              maxLength={255}
            />
            {errors.twitter_link && (
              <p id="twitter_link-error" className="mt-1 text-sm text-red-500">
                {errors.twitter_link}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="facebook_link" className="block text-sm font-medium text-gray-700">
              Facebook Link (optional)
            </label>
            <input
              type="url"
              id="facebook_link"
              name="facebook_link"
              value={formData.facebook_link || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.facebook_link ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              } focus:ring-blue-500`}
              placeholder="Enter Facebook URL"
              maxLength={255}
            />
            {errors.facebook_link && (
              <p id="facebook_link-error" className="mt-1 text-sm text-red-500">
                {errors.facebook_link}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="instagram_link" className="block text-sm font-medium text-gray-700">
              Instagram Link (optional)
            </label>
            <input
              type="instagram_link"
              id="instagram_link"
              name="instagram_link"
              value={formData.instagram_link || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.instagram_link ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              } focus:ring-blue-500`}
              placeholder="Enter Instagram URL"
              maxLength={255}
            />
            {errors.instagram_link && (
              <p id="instagram_link-error" className="mt-1 text-sm text-red-500">
                {errors.instagram_link}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email_url" className="block text-sm font-medium text-gray-700">
              Email URL (optional)
            </label>
            <input
              type="text"
              id="email_url"
              name="email_url"
              value={formData.email_url || ''}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border shadow-sm p-2 sm:p-3 text-sm sm:text-base ${
                errors.email_url ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              } focus:ring-blue-500`}
              placeholder="Enter email URL"
              maxLength={255}
            />
            {errors.email_url && (
              <p id="email_url-error" className="mt-1 text-sm text-red-500">
                {errors.email_url}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/sub-news')}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition shadow-sm text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm sm:text-base ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                    </svg>
                    Updating...
                  </div>
                ) : (
                  'Update Sub-news'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

export default EditSubNews;