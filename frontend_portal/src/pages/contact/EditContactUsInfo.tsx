import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ContactUsOption {
  id: number;
  category: string;
}

const EditContactUsInfo: React.FC = () => {
  const { cont_info_id } = useParams<{ cont_info_id: string }>();
  const navigate = useNavigate();

  const [contactus_id, setContactusId] = useState('');
  const [phone_one, setPhoneOne] = useState('');
  const [phone_two, setPhoneTwo] = useState('');
  const [email_address, setEmailAddress] = useState('');
  const [webmail_address, setWebmailAddress] = useState('');
  const [location, setLocation] = useState('');

  const [contactUsList, setContactUsList] = useState<ContactUsOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [infoResponse, optionsResponse] = await Promise.all([
        axiosInstance.get(`/api/contact-info/${cont_info_id}`),
        axiosInstance.get('/api/contact-us-dropdown'),
      ]);

      const infoData = infoResponse.data.contact_info;
      setContactusId(infoData.contactus_id.toString());
      setPhoneOne(infoData.phone_one);
      setPhoneTwo(infoData.phone_two || '');
      setEmailAddress(infoData.email_address);
      setWebmailAddress(infoData.webmail_address || '');
      setLocation(infoData.location);

      // Map contactus_id to id to match the ContactUsOption interface
      const dropdownOptions = optionsResponse.data.contactUsDropdown.map((item: any) => ({
        id: item.contactus_id,
        category: item.category,
      }));
      setContactUsList(dropdownOptions);
    } catch (err: any) {
      const errorMessage = 'Failed to fetch data: ' + (err.response?.data?.error || err.message || 'Unknown error');
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, [cont_info_id]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const formData = new FormData();
      formData.append('contactus_id', contactus_id);
      formData.append('phone_one', phone_one);
      formData.append('phone_two', phone_two);
      formData.append('email_address', email_address);
      formData.append('webmail_address', webmail_address);
      formData.append('location', location);
      formData.append('_method', 'PUT');

      try {
        await axiosInstance.post(`/api/contact-info/${cont_info_id}`, formData);
        toast.success('Contact Info updated successfully!', { position: 'top-right' });
        navigate('/contact-us/info');
      } catch (err: any) {
        const errorMessage = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : 'Failed to update contact info record.';
        setError(errorMessage);
        toast.error(errorMessage, { position: 'top-right' });
        console.error('Update error:', err);
      }
    },
    [contactus_id, phone_one, phone_two, email_address, webmail_address, location, cont_info_id, navigate]
  );

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="text-lg font-semibold">Loading...</div></div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Edit Contact Info Record</h2>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="contactus_id" className="block text-sm font-medium text-gray-700">Parent Category</label>
            <select
              id="contactus_id"
              value={contactus_id}
              onChange={(e) => setContactusId(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a Category</option>
              {contactUsList.map((option) => (
                <option key={option.id} value={option.id}>{option.category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="phone_one" className="block text-sm font-medium text-gray-700">Primary Phone</label>
            <input
              id="phone_one"
              type="text"
              value={phone_one}
              onChange={(e) => setPhoneOne(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="phone_two" className="block text-sm font-medium text-gray-700">Secondary Phone (Optional)</label>
            <input
              id="phone_two"
              type="text"
              value={phone_two}
              onChange={(e) => setPhoneTwo(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email_address" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email_address"
              type="email"
              value={email_address}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="webmail_address" className="block text-sm font-medium text-gray-700">Webmail Address (Optional)</label>
            <input
              id="webmail_address"
              type="email"
              value={webmail_address}
              onChange={(e) => setWebmailAddress(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/contact-us/info')}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Update Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContactUsInfo;