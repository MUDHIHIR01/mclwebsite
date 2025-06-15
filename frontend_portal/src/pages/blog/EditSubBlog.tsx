import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FormData {
  blog_id: string;
  heading: string;
  description: string;
  video_file: File | null;
  image_file: File | null;
  url_link: string;
}

interface Blog {
  blog_id: number;
  heading: string;
}

const EditSubBlog = () => {
  const { subblog_id } = useParams<{ subblog_id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    blog_id: '',
    heading: '',
    description: '',
    video_file: null,
    image_file: null,
    url_link: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({
    blog_id: '',
    heading: '',
    description: '',
    video_file: '',
    image_file: '',
    url_link: '',
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchSubBlog = async () => {
      if (!subblog_id) {
        toast.error('Invalid sub-blog ID', { position: 'top-right' });
        setTimeout(() => navigate('/sub-blogs'), 2000);
        return;
      }
      setFetching(true);
      try {
        const response = await axiosInstance.get(`/api/sub-blogs/${subblog_id}`);
        const { blog_id, heading, description, video_file, image_file, url_link } = response.data.sub_blog;
        setFormData({
          blog_id: blog_id ? String(blog_id) : '',
          heading,
          description: description || '',
          video_file: null,
          image_file: null,
          url_link: url_link || '',
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to fetch sub-blog entry';
        toast.error(errorMessage, { position: 'top-right' });
        setTimeout(() => navigate('/sub-blogs'), 2000);
      } finally {
        setFetching(false);
      }
    };

    const fetchBlogs = async () => {
      try {
        const response = await axiosInstance.get('/api/blogs-dropdown');
        setBlogs(response.data);
      } catch (error: any) {
        toast.error('Failed to fetch blog options', { position: 'top-right' });
      }
    };

    fetchSubBlog();
    fetchBlogs();
  }, [subblog_id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'video_file' | 'image_file') => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [field]: file }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.blog_id) {
      newErrors.blog_id = 'Please select a blog';
    }

    if (!formData.heading.trim()) {
      newErrors.heading = 'Heading is required';
    } else if (formData.heading.length > 255) {
      newErrors.heading = 'Heading must not exceed 255 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    if (formData.video_file && !formData.video_file.type.startsWith('video/')) {
      newErrors.video_file = 'Only video files are allowed';
    } else if (formData.video_file && formData.video_file.size > 20 * 1024 * 1024) {
      newErrors.video_file = 'Video size must not exceed 20MB';
    }

    if (formData.image_file && !['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(formData.image_file.type)) {
      newErrors.image_file = 'Only JPEG, PNG, JPG, or GIF files are allowed';
    } else if (formData.image_file && formData.image_file.size > 2 * 1024 * 1024) {
      newErrors.image_file = 'Image size must not exceed 2MB';
    }

    if (formData.url_link && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/.test(formData.url_link)) {
      newErrors.url_link = 'Please enter a valid URL';
    } else if (formData.url_link.length > 255) {
      newErrors.url_link = 'URL must not exceed 255 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('blog_id', formData.blog_id);
      payload.append('heading', formData.heading);
      payload.append('description', formData.description || '');
      if (formData.video_file) {
        payload.append('video_file', formData.video_file);
      }
      if (formData.image_file) {
        payload.append('image_file', formData.image_file);
      }
      if (formData.url_link) {
        payload.append('url_link', formData.url_link);
      }
      payload.append('_method', 'PUT'); // Laravel API resource expects PUT for updates

      const response = await axiosInstance.post(`/api/sub-blogs/${subblog_id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Sub-blog entry updated successfully', {
        position: 'top-right',
      });
      setTimeout(() => navigate('/sub-blogs'), 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update sub-blog entry';
      const backendErrors = error.response?.data?.errors || {};
      setErrors(backendErrors);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center items-center min-h-screen"><div className="text-lg font-semibold">Loading...</div></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full mx-auto">
      <ToastContainer position="top-right" autoClose={3000} style={{ top: '70px' }} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 w-full">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6">
          Edit Sub-Blog
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="blog_id" className="block text-sm font-medium text-gray-700">
              Blog *
            </label>
            <select
              id="blog_id"
              name="blog_id"
              value={formData.blog_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              aria-invalid={!!errors.blog_id}
              aria-describedby={errors.blog_id ? 'blog_id-error' : undefined}
            >
              <option value="">Select a Blog</option>
              {blogs.map((blog) => (
                <option key={blog.blog_id} value={blog.blog_id}>
                  {blog.heading}
                </option>
              ))}
            </select>
            {errors.blog_id && (
              <p id="blog_id-error" className="mt-1 text-sm text-red-500">
                {errors.blog_id}
              </p>
            )}
          </div>
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
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
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
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter description (optional)"
              maxLength={1000}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-500">
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="video_file" className="block text-sm font-medium text-gray-700">
              Video File (optional)
            </label>
            <input
              type="file"
              id="video_file"
              name="video_file"
              accept="video/*"
              onChange={(e) => handleFileChange(e, 'video_file')}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.video_file && (
              <p id="video_file-error" className="mt-1 text-sm text-red-500">
                {errors.video_file}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="image_file" className="block text-sm font-medium text-gray-700">
              Image File (optional)
            </label>
            <input
              type="file"
              id="image_file"
              name="image_file"
              accept="image/jpeg,image/png,image/jpg,image/gif"
              onChange={(e) => handleFileChange(e, 'image_file')}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errors.image_file && (
              <p id="image_file-error" className="mt-1 text-sm text-red-500">
                {errors.image_file}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="url_link" className="block text-sm font-medium text-gray-700">
              URL Link (optional)
            </label>
            <input
              type="url"
              id="url_link"
              name="url_link"
              value={formData.url_link}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 lg:p-4 text-sm sm:text-base"
              placeholder="Enter URL (e.g., https://example.com)"
              maxLength={255}
            />
            {errors.url_link && (
              <p id="url_link-error" className="mt-1 text-sm text-red-500">
                {errors.url_link}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/sub-blogs')}
              className={`w-full sm:w-40 px-4 ${isSubmitting ? 'py-0.5' : 'py-1'} bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition shadow-md text-sm sm:text-base`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-40 px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md text-sm sm:text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
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
                'Update Sub-Blog'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubBlog;