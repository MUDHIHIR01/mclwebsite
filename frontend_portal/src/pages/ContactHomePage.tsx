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

// --- REFINED: Contact Home Slideshow ---
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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeInOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.8, ease: "easeInOut" } },
  };
  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="flex items-center space-x-3 text-2xl font-semibold text-white animate-pulse">
          <ArrowPathIcon className="w-8 h-8 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] bg-gradient-to-br from-indigo-600 to-purple-700 p-6">
        <div className="text-rose-300 text-3xl font-bold mb-6 flex items-center space-x-3">
          <InformationCircleIcon className="w-8 h-8" />
          <span>{error ? "An Error Occurred" : "No Content Found"}</span>
        </div>
        <p className="text-gray-200 mb-8 text-lg text-center">{error || "Content for this section could not be loaded."}</p>
        {error && <button onClick={fetchContactHomes} className="inline-flex items-center px-8 py-3 text-white rounded-full transition-all duration-300 shadow-lg hover:brightness-90" style={{ backgroundColor: '#d12814' }}><ArrowPathIcon className="w-5 h-5 mr-2" />Try Again</button>}
      </div>
    );
  }

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
      <AnimatePresence mode="wait">
        <motion.div key={currentSlide} variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
          <img src={data[currentSlide].home_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${data[currentSlide].home_img!.replace(/^\//, "")}`: "https://via.placeholder.com/1200x600?text=Image+Missing"} alt={data[currentSlide].heading} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error"; }} loading="lazy" />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col justify-center min-h-[80vh] px-4 sm:px-8">
        <div className="max-w-[50%] text-left ml-12">
          <motion.h2 key={`h2-${currentSlide}`} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight" style={{ color: "#d12814", textShadow: "0 4px 12px rgba(0, 0, 0, 0.4)" }} variants={contentVariants} initial="hidden" animate="visible">
            {data[currentSlide].heading}
          </motion.h2>
          <motion.p key={`p-${currentSlide}`} className="text-lg sm:text-xl text-gray-100 mb-8 leading-relaxed font-semibold" variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            {data[currentSlide].description || "No description available"}
          </motion.p>
          <motion.div variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            <button onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)} className="inline-flex items-center p-3 text-white rounded-full transition-all duration-300 shadow-lg hover:brightness-90" style={{ backgroundColor: '#d12814' }} aria-label="Previous slide"><ChevronLeftIcon className="w-6 h-6" /></button>
            <button onClick={() => setCurrentSlide((p) => (p + 1) % data.length)} className="ml-4 inline-flex items-center p-3 text-white rounded-full transition-all duration-300 shadow-lg hover:brightness-90" style={{ backgroundColor: '#d12814' }} aria-label="Next slide"><ChevronRightIcon className="w-6 h-6" /></button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- REFINED: Individual Contact Card with Badge ---
const ContactCard: React.FC<{ category: ContactCategory; onViewMore: (id: number) => void; }> = ({ category, onViewMore }) => {
    const [hasImageError, setHasImageError] = useState(false);
    const imageUrl = `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${category.img_file.replace(/^\//, "")}`;

    return (
        <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-shadow duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
            <div className="relative">
                <div className="h-48 w-full">
                    {hasImageError ? (
                        <div className="h-full w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <InformationCircleIcon className="w-16 h-16 text-gray-300 dark:text-gray-500" />
                        </div>
                    ) : (
                        <img className="h-full w-full object-cover" src={imageUrl} alt={category.category} onError={() => setHasImageError(true)} />
                    )}
                </div>
                <span className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#d12814' }}>
                    {category.category}
                </span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold" style={{ color: '#d12814' }}>{category.category}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm flex-grow font-semibold">{category.description}</p>
                <div className="mt-6">
                    <button onClick={() => onViewMore(category.contactus_id)} className="w-full inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg transition-all duration-300 hover:brightness-90" style={{ backgroundColor: '#d12814' }}>
                        <span>View More</span>
                        <ChevronRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// --- REFINED: Contact Section ---
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
    <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
            <h2 className="text-base font-semibold text-[#0069b4] dark:text-indigo-400 tracking-wide uppercase">Get in Touch</h2>
            <p className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: '#d12814' }}>
              How Can We Help You?
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-[#0069b4] dark:text-gray-400">
              Select a category below to find the contact information you need.
            </p>
        </div>

        {isLoading ? (
          <div className="text-center mt-12"><ArrowPathIcon className="w-8 h-8 mx-auto animate-spin" style={{color: '#d12814'}}/></div>
        ) : categories.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <ContactCard key={category.contactus_id} category={category} onViewMore={handleViewMore} />
            ))}
          </div>
        ) : (
             <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <InformationCircleIcon className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xl">No contact categories found.</p>
            </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Information</h2>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XMarkIcon className="w-7 h-7" /></button>
                </div>
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                  {selectedDetails && selectedDetails.length > 0 ? (
                    <div className="space-y-6">
                      {selectedDetails.map((info) => (
                        <div key={info.contact_info_id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <h3 className="font-semibold text-lg mb-3" style={{ color: '#d12814' }}>{info.contact_us.category}</h3>
                          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                            <li className="flex items-start"><PhoneIcon className="w-5 h-5 mr-3 text-gray-400 mt-1 flex-shrink-0"/> <span>{info.phone_one} {info.phone_two && `/ ${info.phone_two}`}</span></li>
                            <li className="flex items-start"><EnvelopeIcon className="w-5 h-5 mr-3 text-gray-400 mt-1 flex-shrink-0"/><a href={`mailto:${info.email_address}`} className="hover:underline break-all">{info.email_address}</a></li>
                            <li className="flex items-start"><MapPinIcon className="w-5 h-5 mr-3 text-gray-400 mt-1 flex-shrink-0"/><span>{info.location}</span></li>
                            {info.contact_us.url_link && <li className="flex items-start"><LinkIcon className="w-5 h-5 mr-3 text-gray-400 mt-1 flex-shrink-0"/><a href={info.contact_us.url_link} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#d12814' }}>Visit Website</a></li>}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="mt-4 text-gray-500 dark:text-gray-400">No detailed contact information available for this category.</p>
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
    <div className="w-full font-sans bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <ContactHomeSlideshow />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default ContactHomePage;