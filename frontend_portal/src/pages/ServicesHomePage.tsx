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

// --- Interfaces ---
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

// --- Full-Page Landing Loader ---
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
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0d7680] to-gray-800 z-50"
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

// --- Services Home Slideshow ---
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
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err: unknown) {
      setError("Failed to fetch services sliders.");
      toast.error("Error fetching services sliders.", { position: "top-right" });
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

  const loaderVariants: Variants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <motion.div variants={loaderVariants} animate="animate" className="flex items-center gap-3 mb-6">
          <ArrowPathIcon className="w-10 h-10 text-[#0d7680] animate-spin" />
          <h2 className="text-3xl font-bold text-white">Loading...</h2>
        </motion.div>
        <motion.p
          variants={loaderVariants}
          animate="animate"
          className="text-lg text-gray-200"
        >
          Fetching slider content...
        </motion.p>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <InformationCircleIcon className="w-10 h-10 text-[#0d7680]" />
          <h2 className="text-3xl font-bold text-white">{error ? "Failed to Load Content" : "No Content Available"}</h2>
        </div>
        <p className="text-lg text-gray-200">{error || "No slides were found for this section."}</p>
        {error && (
          <button
            onClick={fetchServicesHome}
            className="mt-6 flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />Retry
          </button>
        )}
      </div>
    );
  }

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imagePath = data[currentSlide].home_img?.replace(/^\//, "");
  const imageSrc = imagePath ? `${baseURL}/${imagePath}` : "https://via.placeholder.com/1200x600?text=Image+Missing";

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
            src={imageSrc}
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

// --- Individual Service Card Component ---
const ServiceCard: React.FC<{ service: ServiceData }> = ({ service }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const imageUrl = service.service_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${service.service_img.replace(/^\//, "")}` : null;
  const showPlaceholder = hasImageError || !imageUrl;
  const isLongDescription = service.description.length > 200;

  const splitDescription = (desc: string) => {
    const paragraphs = desc.split("\n\n").filter((p) => p.trim());
    if (paragraphs.length <= 1) return { first: desc, rest: [] };
    const first = paragraphs[0];
    const rest = paragraphs.slice(1).map((p) => p.split(/[.!?]\s+/).filter((s) => s.trim()));
    return { first, rest: rest.flat() };
  };

  const { first, rest } = splitDescription(service.description);

  return (
    <motion.div
      className="bg-[white] shadow-lg flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -12 }}
    >
      <div className="relative px-4 -mt-8 md:px-8 md:-mt-10">
        {showPlaceholder ? (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center shadow-md">
            <WrenchScrewdriverIcon className="w-16 h-16 text-gray-300" />
          </div>
        ) : (
          <img
            className="w-full h-64 object-cover shadow-md"
            src={imageUrl!}
            alt={service.service_category}
            onError={() => setHasImageError(true)}
          />
        )}
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
          {service.service_category}
        </span>
      </div>
      <div className="p-8 flex flex-col flex-grow text-black">
        <h3 className="uppercase text-xl sm:text-2xl font-bold relative pb-4 mb-4 text-[#33302d]">
          {service.service_category}
          <span className="absolute bottom-0 left-0 h-1 w-1/4 bg-[#003459]"></span>
        </h3>
        <AnimatePresence>
          <motion.div
            key={`desc-${isExpanded}`}
            initial={{ height: isLongDescription && !isExpanded ? "6rem" : "auto", opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: "6rem", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`text-gray-700 text-base font-medium flex-grow ${isLongDescription && !isExpanded ? "line-clamp-4" : ""}`}
          >
            <p>{first}</p>
            {isExpanded && rest.length > 0 && (
              <ul className="mt-2 list-disc list-inside">
                {rest.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
        {isLongDescription && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-[#ed1c24] font-semibold hover:text-[#0a5a60]"
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        )}
        {service.url_link && (
          <div className="mt-6">
            <a
              href={service.url_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-lg font-bold text-[#ed1c24] hover:text-[#0a5a60]"
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

// --- Services Section ---
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
      toast.error("Could not fetch services data.", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const loaderVariants: Variants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
    },
  };

  if (loading) {
    return (
      <div className="w-full py-20 text-center">
        <motion.div variants={loaderVariants} animate="animate">
          <ArrowPathIcon className="w-8 h-8 mx-auto text-[#0d7680] animate-spin" />
        </motion.div>
      </div>
    );
  }

  if (error || services.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800">{error ? "Failed to Load Content" : "No Content Available"}</h3>
        <p className="mt-2 text-gray-600">{error || "There are no services to display at the moment."}</p>
        {error && (
          <button
            onClick={fetchServices}
            className="mt-6 flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#ed1c24] inline-flex items-center">
            <WrenchScrewdriverIcon className="w-9 h-9 mr-3" />
            Our Services
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the range of professional services we provide to meet your needs.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
          {services.map((service) => (
            <ServiceCard key={service.service_id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main ServicesHomePage Component ---
const ServicesHomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate combined loading state for slideshow and services
    const timer = setTimeout(() => setIsLoading(false), 1000); // Adjust based on actual fetch time
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <AnimatePresence>
        {isLoading && <LandingLoader />}
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