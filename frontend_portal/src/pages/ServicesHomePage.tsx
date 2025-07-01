import { motion, AnimatePresence, Variants } from "framer-motion";
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
  WrenchScrewdriverIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

// --- UTILITY FUNCTION ---
const getFullImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${baseURL}/${imagePath.replace(/^\//, "")}`;
};

// --- INTERFACES ---
interface ServicesHomeData {
  services_home_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

interface ServiceData {
  service_id: number;
  service_category: string;
  service_img: string | null;
  description: string;
  url_link: string | null;
}

// --- FULL-PAGE LANDING LOADER ---
const LandingLoader: React.FC = () => {
  const loaderVariants: Variants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.05, 1],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      // [REFACTORED] Background color updated as requested
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A51A1] z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <motion.div variants={loaderVariants} animate="animate" className="mb-4">
        <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
      </motion.div>
      <motion.h2
        variants={loaderVariants}
        animate="animate"
        className="text-2xl font-bold text-white"
      >
        Loading Services...
      </motion.h2>
    </motion.div>
  );
};

// --- SERVICES HOME SLIDESHOW ---
const ServicesHomeSlideshow: React.FC = () => {
  const [data, setData] = useState<ServicesHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServicesHome = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ServicesHomeData[]>("/api/servicesHomeSlider");
      if (Array.isArray(response.data) && response.data.length > 0) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (err: unknown) {
      setError("Failed to fetch services sliders.");
      toast.error("Error fetching services sliders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServicesHome();
  }, [fetchServicesHome]);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % data.length), 5000);
    return () => clearInterval(interval);
  }, [data.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-800">
        <ArrowPathIcon className="w-10 h-10 text-white animate-spin mr-4" />
        <span className="text-2xl font-semibold text-white">Loading Slideshow...</span>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <InformationCircleIcon className="w-10 h-10 text-red-400" />
          <h2 className="text-3xl font-bold text-white">{error ? "Failed to Load Content" : "No Content Available"}</h2>
        </div>
        <p className="text-lg text-gray-300 mb-6">{error || "No slides were found for this section."}</p>
        {error && (
          <button
            onClick={fetchServicesHome}
            className="flex items-center px-6 py-3 bg-[#0A51A1] text-white font-semibold rounded-full hover:bg-opacity-80 transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />Retry
          </button>
        )}
      </div>
    );
  }
  
  const imageSrc = getFullImageUrl(data[currentSlide].home_img);

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gray-900">
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
            src={imageSrc || "https://via.placeholder.com/1200x600?text=Image+Missing"}
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
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            {data[currentSlide].heading}
          </motion.h2>
          <motion.p
            key={`p-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="text-xl md:text-2xl font-medium text-gray-200 mb-8"
          >
            {data[currentSlide].description || "Comprehensive solutions tailored for you."}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)}
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % data.length)}
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition"
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

// --- INDIVIDUAL SERVICE CARD COMPONENT ---
const ServiceCard: React.FC<{ service: ServiceData }> = ({ service }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const imageUrl = getFullImageUrl(service.service_img);
  const isLongDescription = service.description.length > 200;
  
  // [REFACTORED] Simplified description handling for better consistency
  const paragraphs = service.description.split(/\n\s*\n/).filter(p => p.trim());

  return (
    <motion.div
      className="bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="relative h-64 w-full">
        {imageUrl ? (
          <img
            className="w-full h-full object-cover"
            src={imageUrl}
            alt={service.service_category}
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <WrenchScrewdriverIcon className="w-16 h-16 text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-[#003459] mb-3">
          {service.service_category}
        </h3>
        <div className="text-gray-600 text-base flex-grow overflow-hidden">
          <motion.div
            animate={{ height: isLongDescription && !isExpanded ? '6rem' : 'auto' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {paragraphs.map((p, i) => <p key={i} className={i > 0 ? 'mt-4' : ''}>{p}</p>)}
          </motion.div>
        </div>
        {isLongDescription && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 text-sm font-semibold text-[#ed1c24] hover:text-[#0a5a60] self-start"
          >
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        )}
        {service.url_link && (
          <div className="mt-auto pt-4">
            <a
              href={service.url_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-bold text-[#ed1c24] hover:text-[#0a5a60] transition-colors"
            >
              Learn More
              <LinkIcon className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- SERVICES SECTION ---
const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ services: ServiceData[] }>("/api/allService");
      setServices(Array.isArray(response.data.services) ? response.data.services : []);
    } catch (err: unknown) {
      setError("Could not fetch services data.");
      toast.error("Could not fetch services data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  if (loading) {
    return (
      <section className="py-20 text-center">
        <ArrowPathIcon className="w-10 h-10 mx-auto text-[#0A51A1] animate-spin" />
      </section>
    );
  }

  if (error || services.length === 0) {
    return (
      <section className="py-20 flex flex-col items-center justify-center text-center px-4">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800">{error ? "Error Loading Services" : "No Services Found"}</h3>
        <p className="mt-2 text-gray-600 max-w-md">{error || "There are no services to display at the moment. Please check back later."}</p>
        {error && (
          <button
            onClick={fetchServices}
            className="mt-6 flex items-center px-6 py-3 bg-[#0A51A1] text-white font-semibold rounded-full hover:bg-opacity-80 transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />Retry
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003459] tracking-tight">
            Our Professional Services
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the range of expert solutions we provide to help your business thrive.
          </p>
        </div>
        {/* [REFACTORED] Improved responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {services.map((service) => (
            <ServiceCard key={service.service_id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- MAIN SERVICESHOMEPAGE COMPONENT ---
const ServicesHomePage: React.FC = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick draggable pauseOnHover theme="colored" />
      <AnimatePresence>
        {isPageLoading && <LandingLoader />}
      </AnimatePresence>
      <header>
        <ServicesHomeSlideshow />
      </header>
      <main className="flex-grow">
        <ServicesSection />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default ServicesHomePage;