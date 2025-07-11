import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState, useEffect } from "react";
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
  img_file: string | null;
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

// --- COMPONENTS ---

// Full-Page Landing Loader
const LandingLoader: React.FC = () => (
  <motion.div
    className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A51A1] z-50"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.5 } }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    >
      <ArrowPathIcon className="w-16 h-16 text-white" />
    </motion.div>
    <motion.h2
      className="text-2xl font-bold text-white mt-4"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
    >
      Loading Contact Page...
    </motion.h2>
  </motion.div>
);

// Simplified Contact Home Slideshow (receives data as props)
const ContactHomeSlideshow: React.FC<{ data: ContactHomeData[] }> = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % data.length), 5000);
    return () => clearInterval(interval);
  }, [data.length]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <InformationCircleIcon className="w-10 h-10 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-white">Content Not Available</h2>
      </div>
    );
  }

  const activeSlide = data[currentSlide];
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imagePath = activeSlide.home_img ? `${baseURL}/${activeSlide.home_img.replace(/^\//, "")}` : "https://via.placeholder.com/1200x600?text=Image+Missing";

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gray-800">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10" />
          <img src={imagePath} alt={activeSlide.heading} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error")} loading="eager" />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col justify-center min-h-[80vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <motion.h2 key={`h2-${currentSlide}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            {activeSlide.heading}
          </motion.h2>
          <motion.p key={`p-${currentSlide}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }} className="text-lg md:text-xl text-gray-200 mb-8">
            {activeSlide.description || "We're here to help. Reach out to us through any of the channels below."}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }} className="flex gap-4">
            <button onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm" aria-label="Previous slide">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button onClick={() => setCurrentSlide((p) => (p + 1) % data.length)} className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm" aria-label="Next slide">
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Simplified Contact Card (receives data as props, with requested change)
const ContactCard: React.FC<{ category: ContactCategory; contactInfos: ContactInfo[] }> = ({ category, contactInfos }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 120;
  // Safely check if the description exists and its length
  const isLongDescription = category.description && category.description.length > maxLength;
  
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imageUrl = category.img_file ? `${baseURL}/${category.img_file.replace(/^\//, "")}` : "";

  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
        {imageUrl && (
            <div className="h-56 w-full">
                <img className="w-full h-full object-cover" src={imageUrl} alt={category.category} />
            </div>
        )}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="uppercase text-xl font-bold text-[#003459] mb-3 tracking-wide">{category.category}</h3>
        
        {/* --- CHANGE IS HERE: Conditionally render description block --- */}
        {category.description && (
          <div className="mb-4">
            <p className={`text-gray-600 text-base leading-relaxed ${!isExpanded && isLongDescription ? 'line-clamp-4' : ''}`}>
              {category.description}
            </p>
            {isLongDescription && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#ed1c24] font-semibold hover:text-[#003459] transition-colors self-start mt-2">
                {isExpanded ? "Read Less" : "Read More"}
              </button>
            )}
          </div>
        )}
        
        {contactInfos.length > 0 ? (
          <div className="mt-auto pt-4 border-t border-gray-200 space-y-4">
            {contactInfos.map((info) => (
              <ul key={info.contact_info_id} className="space-y-3 text-gray-700">
                <li className="flex items-center"><PhoneIcon className="w-5 h-5 mr-3 text-[#ed1c24]" /><span>{info.phone_one}{info.phone_two && ` / ${info.phone_two}`}</span></li>
                <li className="flex items-center"><EnvelopeIcon className="w-5 h-5 mr-3 text-[#ed1c24]" /><a href={`mailto:${info.email_address}`} className="hover:text-[#003459] break-all">{info.email_address}</a></li>
                {info.webmail_address && <li className="flex items-center"><EnvelopeIcon className="w-5 h-5 mr-3 text-[#ed1c24]" /><a href={`mailto:${info.webmail_address}`} className="hover:text-[#003459] break-all">{info.webmail_address}</a></li>}
                <li className="flex items-start"><MapPinIcon className="w-5 h-5 mr-3 text-[#ed1c24] mt-1 flex-shrink-0" /><span>{info.location}</span></li>
                {info.contact_us.url_link && <li className="flex items-center"><LinkIcon className="w-5 h-5 mr-3 text-[#ed1c24]" /><a href={info.contact_us.url_link} target="_blank" rel="noopener noreferrer" className="hover:text-[#003459]">Visit Website</a></li>}
              </ul>
            ))}
          </div>
        ) : <p className="text-gray-500 mt-auto pt-4 border-t border-gray-200">No contact details available.</p>}
      </div>
    </motion.div>
  );
};

// Simplified Contact Section (receives data as props)
const ContactSection: React.FC<{ categories: ContactCategory[]; allContactInfos: ContactInfo[] }> = ({ categories, allContactInfos }) => {
  return (
    <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y:20 }} whileInView={{ opacity: 1, y:0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-3xl sm:text-4xl font-extrabold text-[#003459] inline-flex items-center">
            <ChatBubbleLeftRightIcon className="w-9 h-9 mr-3 text-[#ed1c24]" />
            How Can We Help You?
          </motion.h2>
          <motion.p initial={{ opacity: 0, y:20 }} whileInView={{ opacity: 1, y:0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Select a category below to find the contact information you need.
          </motion.p>
        </div>
        
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {categories.map((category) => (
              <ContactCard
                key={category.contactus_id}
                category={category}
                contactInfos={allContactInfos.filter((info) => info.contactus_id === category.contactus_id)}
              />
            ))}
          </div>
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
            <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-2xl font-bold text-gray-800">No Content Available</h3>
            <p className="mt-2 text-gray-600">No contact categories were found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// Main ContactHomePage Component (with refined loading logic)
const ContactHomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sliderData, setSliderData] = useState<ContactHomeData[]>([]);
  const [categories, setCategories] = useState<ContactCategory[]>([]);
  const [contactInfos, setContactInfos] = useState<ContactInfo[]>([]);

  useEffect(() => {
    const loadPageData = async () => {
      const fetchDataPromise = Promise.allSettled([
        axiosInstance.get<ContactHomeData[]>("/api/contactHomeSlider"),
        axiosInstance.get<{ contacts: ContactCategory[] }>("/api/allContactUs"),
        axiosInstance.get<{ contact_infos: ContactInfo[] }>("/api/contactInfo"),
      ]);

      const minimumTimePromise = new Promise((resolve) => setTimeout(resolve, 800));
      const [results] = await Promise.all([fetchDataPromise, minimumTimePromise]);
      const [sliderResult, categoriesResult, infosResult] = results;

      if (sliderResult.status === "fulfilled" && Array.isArray(sliderResult.value.data)) {
        setSliderData(sliderResult.value.data);
      } else {
        toast.error("Failed to load hero content.");
      }

      if (categoriesResult.status === "fulfilled" && categoriesResult.value.data?.contacts) {
        setCategories(categoriesResult.value.data.contacts);
      } else {
        toast.error("Failed to load contact categories.");
      }

      if (infosResult.status === "fulfilled" && infosResult.value.data?.contact_infos) {
        setContactInfos(infosResult.value.data.contact_infos);
      } else {
        toast.warn("Could not load all contact details.");
      }

      setIsLoading(false);
    };
    
    loadPageData();
  }, []);

  const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      
      <AnimatePresence>
        {isLoading && <LandingLoader />}
      </AnimatePresence>

      <motion.div
        className="flex-grow flex flex-col"
        initial="hidden"
        animate={isLoading ? "hidden" : "visible"}
        variants={contentVariants}
      >
        <header>
          <ContactHomeSlideshow data={sliderData} />
        </header>
        <main className="flex-grow">
          <ContactSection categories={categories} allContactInfos={contactInfos} />
        </main>
        <Footer />
      </motion.div>
    </div>
  );
};

export default ContactHomePage;