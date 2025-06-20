import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  XMarkIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

// --- INTERFACES ---
interface ContactHomeData {
  cont_home_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

interface ContactCategory {
  contactus_id: number;
  category: string;
  description: string;
  img_file: string;
  url_link: string | null;
}

interface ContactInfo {
  contact_info_id: number;
  phone_one: string;
  phone_two: string | null;
  contactus_id: number;
  email_address: string;
  webmail_address: string | null;
  location: string;
  contact_us: {
    category: string;
    url_link: string | null;
  };
}

// --- Contact Home Slideshow ---
const ContactHomeSlideshow: React.FC = () => {
  const [data, setData] = useState<ContactHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContactHomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ContactHomeData[]>("/api/contactHomeSlider");
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      const message = "Failed to fetch sliders: " + (err.response?.data?.message || err.message);
      setError(message);
      toast.error("Error fetching home sliders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContactHomes(); }, [fetchContactHomes]);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % data.length), 5000);
    return () => clearInterval(interval);
  }, [data.length]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <ArrowPathIcon className="w-10 h-10 text-[#0d7680] animate-spin" />
          <h2 className="text-3xl font-bold text-white">Loading...</h2>
        </div>
        <p className="text-lg text-gray-200">Fetching slider content...</p>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <InformationCircleIcon className="w-10 h-10 text-[#0d7680]" />
          <h2 className="text-3xl font-bold text-white">{error ? "An Error Occurred" : "No Content Found"}</h2>
        </div>
        <p className="text-lg text-gray-200">{error || "Content for this section could not be loaded."}</p>
        {error && (
          <button
            onClick={fetchContactHomes}
            className="mt-6 flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />Try Again
          </button>
        )}
      </div>
    );
  }

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imagePath = data[currentSlide].home_img ? `${baseURL}/${data[currentSlide].home_img.replace(/^\//, "")}` : "https://via.placeholder.com/1200x600?text=Image+Missing";

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gray-800">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          <img
            src={imagePath}
            alt={data[currentSlide].heading}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error")}
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col justify-center min-h-[80vh] max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-xl">
          <motion.h2
            key={`h2-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-bold text-[#fff1e5] mb-4"
          >
            {data[currentSlide].heading}
          </motion.h2>
          <motion.p
            key={`p-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="text-xl md:text-2xl font-medium text-gray-100 mb-8"
          >
            {data[currentSlide].description || "No description available"}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)}
              className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % data.length)}
              className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Contact Card ---
const ContactCard: React.FC<{ category: ContactCategory; onViewMore: (id: number) => void; }> = ({ category, onViewMore }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${category.img_file.replace(/^\//, "")}`;

  return (
    <motion.div
      className="bg-[#fff1e5] shadow-lg flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -12 }}
    >
      <div className="relative px-4 -mt-8 md:px-8 md:-mt-10">
        {hasImageError ? (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center shadow-md">
            <InformationCircleIcon className="w-16 h-16 text-gray-300" />
          </div>
        ) : (
          <img
            className="w-full h-64 object-cover shadow-md"
            src={imageUrl}
            alt={category.category}
            onError={() => setHasImageError(true)}
          />
        )}
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
          {category.category}
        </span>
      </div>
      <div className="p-8 flex flex-col flex-grow text-black">
        <h3 className="uppercase text-xl sm:text-2xl font-bold relative pb-4 mb-4 text-[#33302d]">
          {category.category}
          <span className="absolute bottom-0 left-0 h-1 w-1/4 bg-[#33302d]"></span>
        </h3>
        <p className="text-gray-700 text-base font-medium flex-grow line-clamp-4">{category.description}</p>
        <button
          onClick={() => onViewMore(category.contactus_id)}
          className="mt-6 inline-flex items-center justify-center px-4 py-2 text-[#0d7680] font-semibold rounded-full border border-[#0d7680] hover:bg-[#0d7680] hover:text-white transition"
        >
          View More
          <ChevronRightIcon className="w-5 h-5 ml-2" />
        </button>
      </div>
    </motion.div>
  );
};

// --- Contact Section ---
const ContactSection: React.FC = () => {
  const [categories, setCategories] = useState<ContactCategory[]>([]);
  const [allContactInfos, setAllContactInfos] = useState<ContactInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDetails, setSelectedDetails] = useState<ContactInfo[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [categoriesRes, contactInfosRes] = await Promise.allSettled([
        axiosInstance.get<{ contacts: ContactCategory[] }>("/api/allContactUs"),
        axiosInstance.get<{ contact_infos: ContactInfo[] }>("/api/contactInfo"),
      ]);

      if (categoriesRes.status === 'fulfilled' && categoriesRes.value.data.contacts) {
        setCategories(categoriesRes.value.data.contacts);
      } else {
        toast.error("Failed to fetch contact categories.");
      }

      if (contactInfosRes.status === 'fulfilled' && contactInfosRes.value.data.contact_infos) {
        setAllContactInfos(contactInfosRes.value.data.contact_infos);
      } else {
        console.warn("Could not pre-fetch contact details.");
      }
    } catch (err) {
      toast.error("An error occurred while fetching contact data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleViewMore = (categoryId: number) => {
    const details = allContactInfos.filter(info => info.contactus_id === categoryId);
    setSelectedDetails(details);
    setIsModalOpen(true);
    if (details.length === 0) {
      toast.info("No specific contact information found for this category.");
    }
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <section className="bg-gray-100 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 inline-flex items-center">
            <ChatBubbleLeftRightIcon className="w-9 h-9 mr-3" />
            How Can We Help You?
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Select a category below to find the contact information you need.
          </p>
        </div>
        {isLoading ? (
          <div className="w-full py-20 text-center">
            <ArrowPathIcon className="w-8 h-8 mx-auto text-[#0d7680] animate-spin" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
            {categories.map((category) => (
              <ContactCard key={category.contactus_id} category={category} onViewMore={handleViewMore} />
            ))}
          </div>
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
            <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-2xl font-bold text-gray-800">No Content Available</h3>
            <p className="mt-2 text-gray-600">No contact categories found.</p>
          </div>
        )}
      </div>
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-[#33302d]">Contact Information</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                <div className="mt-6 border-t border-gray-200 pt-6">
                  {selectedDetails && selectedDetails.length > 0 ? (
                    <div className="space-y-6">
                      {selectedDetails.map((info) => (
                        <div key={info.contact_info_id} className="p-4 border border-gray-200 rounded-lg">
                          <h3 className="font-semibold text-lg mb-3 text-[#33302d]">{info.contact_us.category}</h3>
                          <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start">
                              <PhoneIcon className="w-5 h-5 mr-3 text-gray-400 mt-1 flex-shrink-0" />
                              <span>{info.phone_one}{info.phone_two && ` / ${info.phone_two}`}</span>
                            </li>
                            <li className="flex items-start">
                              <EnvelopeIcon className="w-5 h-5 mr-3 text-gray-400 mt-1 flex-shrink-0" />
                              <a
                                href={`mailto:${info.email_address}`}
                                className="hover:text-[#0d7680] break-all"
                              >
                                {info.email_address}
                              </a>
                            </li>
                            {info.webmail_address && (
                              <li className="flex items-start">
                                <EnvelopeIcon className="w-5 h-5 mr-3 text-gray-400 mt-1 flex-shrink-0" />
                                <a
                                  href={`mailto:${info.webmail_address}`}
                                  className="hover:text-[#0d7680] break-all"
                                >
                                  {info.webmail_address}
                                </a>
                              </li>
                            )}
                            <li className="flex items-start">
                              <MapPinIcon className="w-5 h-5 mr-3 text-gray-400 mt-1 flex-shrink-0" />
                              <span>{info.location}</span>
                            </li>
                            {info.contact_us.url_link && (
                              <li className="flex items-start">
                                <LinkIcon className="w-5 h-5 mr-3 text-gray-400 mt-1 flex-shrink-0" />
                                <a
                                  href={info.contact_us.url_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-[#0d7680]"
                                >
                                  Visit Website
                                </a>
                              </li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="mt-4 text-gray-500">No detailed contact information available for this category.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// --- Main ContactHomePage Component ---
const ContactHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <header>
        <ContactHomeSlideshow />
      </header>
      <main className="flex-grow">
        <ContactSection />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default ContactHomePage;
