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
  DocumentTextIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

// --- INTERFACES ---
interface SustainabilityHomeData {
  sustainability_home_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

interface SustainabilityData {
  sustain_id: number;
  sustain_category: string;
  description: string;
  weblink: string | null;
  sustain_pdf_file: string | null;
}

// --- COMPONENTS ---

// Full-page Loader
const Loader: React.FC = () => (
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
      Loading Sustainability...
    </motion.h2>
  </motion.div>
);

// Sustainability Home Slideshow (Original data-fetching logic preserved)
const SustainabilityHomeSlideshow: React.FC<{ setLoaded: (isLoaded: boolean) => void }> = ({ setLoaded }) => {
  const [data, setData] = useState<SustainabilityHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchSustainabilityHomes = useCallback(async () => {
    setError(null);
    try {
      const response = await axiosInstance.get<SustainabilityHomeData[]>("/api/sust/homeSlider");
      if (Array.isArray(response.data) && response.data.length > 0) {
        setData(response.data);
      } else {
        setError("No slider content available.");
      }
    } catch (err: any) {
      setError("Failed to fetch sustainability sliders.");
      toast.error("Error fetching sustainability sliders.");
    } finally {
      setLoaded(true);
    }
  }, [setLoaded]);

  useEffect(() => { fetchSustainabilityHomes(); }, [fetchSustainabilityHomes]);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % data.length), 5000);
    return () => clearInterval(interval);
  }, [data.length]);

  if (error || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <InformationCircleIcon className="w-10 h-10 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-white">{error || "Content Not Available"}</h2>
      </div>
    );
  }

  const activeSlide = data[currentSlide];
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imagePath = activeSlide.home_img?.replace(/^\//, "");
  const imageSrc = activeSlide.home_img ? `${baseURL}/${imagePath}` : "https://via.placeholder.com/1200x600?text=Image+Missing";

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
          <img src={imageSrc} alt={activeSlide.heading} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error")} loading="eager" />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col justify-center min-h-[80vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <motion.h2 key={`h2-${currentSlide}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            {activeSlide.heading}
          </motion.h2>
          <motion.p key={`p-${currentSlide}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }} className="text-lg md:text-xl font-normal text-gray-200 mb-8">
            {activeSlide.description || "Driving positive change for our community and planet."}
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

// Sustainability Card Component (with "Read More" fix)
const SustainabilityCard: React.FC<{ item: SustainabilityData; index: number }> = ({ item, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsReadMore = item.description.length > 150;

  return (
    <motion.div
      layout
      className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="uppercase text-lg font-bold text-[#003459] mb-3 tracking-wide">{item.sustain_category}</h3>
        <motion.p layout className={`text-gray-600 text-base leading-relaxed flex-grow ${!isExpanded && needsReadMore ? "line-clamp-5" : ""}`} >
          {item.description}
        </motion.p>
        
        {needsReadMore && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#ed1c24] font-semibold text-sm mt-4 self-start hover:underline focus:outline-none" >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          {item.sustain_pdf_file ? (
            <a href={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.sustain_pdf_file.replace(/^\//, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold text-[#003459] hover:text-[#ed1c24] transition-colors" >
              View Report <DocumentTextIcon className="w-5 h-5" />
            </a>
          ) : item.weblink && (
            <a href={item.weblink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold text-[#003459] hover:text-[#ed1c24] transition-colors" >
              Learn More <LinkIcon className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Sustainability Section (Original data-fetching logic preserved)
const SustainabilitySection: React.FC<{ setLoaded: (isLoaded: boolean) => void }> = ({ setLoaded }) => {
  const [sustainabilityData, setSustainabilityData] = useState<SustainabilityData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSustainabilityData = useCallback(async () => {
    setError(null);
    try {
      const response = await axiosInstance.get("/api/allSustainability");
      if(response.data?.data && Array.isArray(response.data.data)) {
        setSustainabilityData(response.data.data);
      } else {
        setError("No sustainability data found.");
      }
    } catch (err) {
      setError("Could not fetch sustainability data.");
      toast.error("Could not fetch sustainability data.");
    } finally {
      setLoaded(true);
    }
  }, [setLoaded]);

  useEffect(() => { fetchSustainabilityData(); }, [fetchSustainabilityData]);

  if (error && sustainabilityData.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
          <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
            <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-2xl font-bold text-gray-800">{error}</h3>
          </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003459]">Our Commitment to Sustainability</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We are dedicated to making a positive impact through responsible practices and community engagement. Explore our key initiatives below.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sustainabilityData.map((item, index) => (
            <SustainabilityCard key={item.sustain_id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Main SustainabilityHomePage Component (with refined loading)
const SustainabilityHomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [slideshowLoaded, setSlideshowLoaded] = useState(false);
  const [sectionLoaded, setSectionLoaded] = useState(false);
  const [minimumTimePassed, setMinimumTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumTimePassed(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (slideshowLoaded && sectionLoaded && minimumTimePassed) {
      setIsLoading(false);
    }
  }, [slideshowLoaded, sectionLoaded, minimumTimePassed]);

  const contentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      
      <AnimatePresence>
        {isLoading && <Loader />}
      </AnimatePresence>

      <motion.div
        className="flex-grow flex flex-col"
        initial="hidden"
        animate={isLoading ? "hidden" : "visible"}
        variants={contentVariants}
      >
        <header>
          <SustainabilityHomeSlideshow setLoaded={setSlideshowLoaded} />
        </header>
        <main className="flex-grow">
          <SustainabilitySection setLoaded={setSectionLoaded} />
        </main>
        <Footer />
      </motion.div>
    </div>
  );
};

export default SustainabilityHomePage;