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
  ShieldCheckIcon,
  DocumentTextIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

// --- Interfaces ---
interface OurStandardHomeData {
  id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

interface OurStandardData {
  our_id: number;
  standard_category: string;
  standard_file: string | null;
  weblink: string | null;
  description: string;
}

// --- Full-page Loader ---
const Loader: React.FC = () => (
  <motion.div
    className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A51A1] z-50"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.1 }} // Minimized fade-out duration
  >
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="mb-4"
    >
      <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
    </motion.div>
    <motion.h2
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="text-2xl font-bold text-white"
    >
      Loading Our Standards...
    </motion.h2>
  </motion.div>
);

// --- Our Standards Home Slideshow ---
const OurStandardsHomeSlideshow: React.FC<{ setLoaded: (isLoaded: boolean) => void }> = ({ setLoaded }) => {
  const [data, setData] = useState<OurStandardHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchOurStandardHomeslideshow = useCallback(async () => {
    setError(null);
    try {
      const response = await axiosInstance.get("/api/ourStandardHomeSlider");
      setData(Array.isArray(response.data?.data?.our_standard_homes) ? response.data.data.our_standard_homes : []);
    } catch (err: any) {
      setError("Failed to fetch Our Standards sliders.");
      toast.error("Error fetching Our Standards sliders.");
    } finally {
      setLoaded(true);
    }
  }, [setLoaded]);

  useEffect(() => { fetchOurStandardHomeslideshow(); }, [fetchOurStandardHomeslideshow]);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % data.length), 5000);
    return () => clearInterval(interval);
  }, [data.length]);

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
            onClick={fetchOurStandardHomeslideshow}
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

// --- Individual Card Component ---
const OurStandardCard: React.FC<{ item: OurStandardData }> = ({ item }) => {
  return (
    <motion.div
      className="bg-[white] shadow-lg flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -12 }}
    >
      <div className="relative px-4 -mt-8 md:px-8 md:-mt-10">
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center shadow-md">
          <ShieldCheckIcon className="w-16 h-16 text-gray-300" />
        </div>
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
          {item.standard_category}
        </span>
      </div>
      <div className="p-8 flex flex-col flex-grow text-black">
        <h3 className="uppercase text-xl sm:text-2xl font-bold relative pb-4 mb-4 text-[#33302d]">
          {item.standard_category}
          <span className="absolute bottom-0 left-0 h-1 w-1/4 bg-[#33302d]"></span>
        </h3>
        <p className="text-gray-700 text-base font-medium flex-grow line-clamp-4">{item.description}</p>
        <div className="mt-6">
          {item.standard_file ? (
            <a
              href={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.standard_file.replace(/^\//, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-lg font-bold text-[#ed1c24] hover:text-[#0a5a60]"
            >
              View Document
              <DocumentTextIcon className="w-5 h-5" />
            </a>
          ) : item.weblink && (
            <a
              href={item.weblink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-lg font-bold text-[#0d7680] hover:text-[#0a5a60]"
            >
              Learn More
              <LinkIcon className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- Our Standards Section ---
const OurStandardsSection: React.FC<{ setLoaded: (isLoaded: boolean) => void }> = ({ setLoaded }) => {
  const [standardsData, setStandardsData] = useState<OurStandardData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchOurStandards = useCallback(async () => {
    setError(null);
    try {
      const response = await axiosInstance.get("/api/allOurStandards");
      setStandardsData(Array.isArray(response.data.our_standard) ? response.data.our_standard : []);
    } catch (err) {
      setError("Could not fetch Our Standards data.");
      toast.error("Could not fetch Our Standards data.");
    } finally {
      setLoaded(true);
    }
  }, [setLoaded]);

  useEffect(() => { fetchOurStandards(); }, [fetchOurStandards]);

  if (error || standardsData.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800">{error ? "Failed to Load Content" : "No Content Available"}</h3>
        <p className="mt-2 text-gray-600">{error || "There are no Our Standards initiatives to display at the moment."}</p>
        {error && (
          <button
            onClick={fetchOurStandards}
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
            <ShieldCheckIcon className="w-9 h-9 mr-3" />
            Our Standards
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the documents and policies that guide our commitment to excellence.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
          {standardsData.map((item) => (
            <OurStandardCard key={item.our_id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main Page Component ---
const OurStandardsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [slideshowLoaded, setSlideshowLoaded] = useState(false);
  const [sectionLoaded, setSectionLoaded] = useState(false);

  useEffect(() => {
    if (slideshowLoaded && sectionLoaded) {
      setIsLoading(false);
    }
  }, [slideshowLoaded, sectionLoaded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("Loader timed out. Forcing content display.");
        setIsLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      
      <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }} // Minimized fade-in duration
        >
          <header>
            <OurStandardsHomeSlideshow setLoaded={setSlideshowLoaded} />
          </header>
          <main className="flex-grow">
            <OurStandardsSection setLoaded={setSectionLoaded} />
          </main>
          <footer>
            <Footer />
          </footer>
        </motion.div>
      )}
    </div>
  );
};

export default OurStandardsPage;