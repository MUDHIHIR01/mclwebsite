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
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

// --- Interfaces for Early Careers ---
interface EarlyCareerHomeData {
  earycare_id: number;
  heading: string;
  description: string;
  home_img: string;
}

interface EarlyCareer {
  early_career_id: number;
  category: string;
  img_file: string;
  video_file: string | null;
  description: string;
}

// --- Early Careers Home Slideshow ---
const EarlyCareersHomeSlideshow: React.FC = () => {
  const [data, setData] = useState<EarlyCareerHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEarlyCareerHomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<EarlyCareerHomeData[]>("/api/earlycareer/sliders");
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError("Failed to fetch early careers sliders.");
      toast.error("Error fetching early careers sliders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEarlyCareerHomes(); }, [fetchEarlyCareerHomes]);

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
          <h2 className="text-3xl font-bold text-white">{error ? "Failed to Load Content" : "No Content Available"}</h2>
        </div>
        <p className="text-lg text-gray-200">{error || "No slides were found for this section."}</p>
        {error && (
          <button
            onClick={fetchEarlyCareerHomes}
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

// --- Individual Early Career Card ---
const EarlyCareerCard: React.FC<{ career: EarlyCareer }> = ({ career }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = career.img_file ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${career.img_file.replace(/^\//, "")}` : null;
  const videoUrl = career.video_file ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${career.video_file.replace(/^\//, "")}` : null;
  const showPlaceholder = hasImageError || (!imageUrl && !videoUrl);

  return (
    <motion.div
      className="bg-[#fff1e5] shadow-lg flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -12 }}
    >
      <div className="relative px-4 -mt-8 md:px-8 md:-mt-10">
        {showPlaceholder ? (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center shadow-md">
            <AcademicCapIcon className="w-16 h-16 text-gray-300" />
          </div>
        ) : videoUrl && !imageUrl ? (
          <video
            src={videoUrl}
            controls
            className="w-full h-64 object-contain shadow-md bg-black"
            onError={() => setHasImageError(true)}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            className="w-full h-64 object-cover shadow-md"
            src={imageUrl!}
            alt={career.category}
            onError={() => setHasImageError(true)}
          />
        )}
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
          {career.category}
        </span>
      </div>
      <div className="p-8 flex flex-col flex-grow text-black">
        <h3 className="uppercase text-xl sm:text-2xl font-bold relative pb-4 mb-4 text-[#33302d]">
          {career.category}
          <span className="absolute bottom-0 left-0 h-1 w-1/4 bg-[#33302d]"></span>
        </h3>
        <p className="text-gray-700 text-base font-medium flex-grow line-clamp-4">{career.description}</p>
      </div>
    </motion.div>
  );
};

// --- Early Careers Section ---
const EarlyCareersSection: React.FC = () => {
  const [careers, setCareers] = useState<EarlyCareer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ early_careers: EarlyCareer[] }>("/api/early-careers/all");
      setCareers(Array.isArray(response.data.early_careers) ? response.data.early_careers : []);
    } catch (err) {
      setError("Could not fetch early career opportunities data.");
      toast.error("Could not fetch early career opportunities data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="w-full py-20 text-center">
        <ArrowPathIcon className="w-8 h-8 mx-auto text-[#0d7680] animate-spin" />
      </div>
    );
  }

  if (error || careers.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800">{error ? "Failed to Load Content" : "No Content Available"}</h3>
        <p className="mt-2 text-gray-600">{error || "There are no early career opportunities to display at the moment."}</p>
        {error && (
          <button
            onClick={fetchData}
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
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 inline-flex items-center">
            <AcademicCapIcon className="w-9 h-9 mr-3" />
            Early Career Opportunities
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our programmes designed for the next generation of talent.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
          {careers.map((career) => (
            <EarlyCareerCard key={career.early_career_id} career={career} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main EarlyCareersPage Component ---
const EarlyCareersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <header>
        <EarlyCareersHomeSlideshow />
      </header>
      <main className="flex-grow">
        <EarlyCareersSection />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default EarlyCareersPage;
