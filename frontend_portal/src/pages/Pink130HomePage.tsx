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
  StarIcon, // Icon for Pink 130
  DocumentTextIcon, // Icon for PDF reports
  PlayCircleIcon, // Icon for videos
} from "@heroicons/react/24/outline";

// --- Interfaces ---
interface FTPinkHomeData {
  ft_pink_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

interface Pink130Data {
  pink_id: number;
  category: string;
  description: string;
  video: string | null;
  pdf_file: string | null;
}

// --- REFINED: Pink 130 Home Slideshow ---
const Pink130HomeSlideshow: React.FC = () => {
  const [data, setData] = useState<FTPinkHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFTPinkHomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/pink130Sliders");
      setData(Array.isArray(response.data.ft_pink_130_homes) ? response.data.ft_pink_130_homes : []);
    } catch (err: any) {
      const message = "Failed to fetch sliders: " + (err.response?.data?.message || err.message);
      setError(message);
      toast.error("Error fetching FT Pink 130 sliders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFTPinkHomes(); }, [fetchFTPinkHomes]);

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
        {error && <button onClick={fetchFTPinkHomes} className="inline-flex items-center px-8 py-3 text-white rounded-full hover:brightness-90 transition-all shadow-lg" style={{ backgroundColor: '#d12814' }}><ArrowPathIcon className="w-5 h-5 mr-2" /> Try Again</button>}
      </div>
    );
  }

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
      <AnimatePresence mode="wait">
        <motion.div key={currentSlide} variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
          <img src={data[currentSlide].home_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${data[currentSlide].home_img!.replace(/^\//, "")}` : "https://via.placeholder.com/1200x600?text=Image+Missing"} alt={data[currentSlide].heading} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error"; }} loading="lazy" />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col justify-center min-h-[80vh] px-4 sm:px-8">
        <div className="max-w-[50%] text-left ml-12">
          <motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight" style={{ color: "#d12814", textShadow: "0 4px 12px rgba(0,0,0,0.4)" }} variants={contentVariants} initial="hidden" animate="visible">
            {data[currentSlide].heading}
          </motion.h2>
          <motion.p className="text-lg sm:text-xl text-gray-100 mb-8 leading-relaxed font-semibold" variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            {data[currentSlide].description || "No description available"}
          </motion.p>
          <motion.div variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            <button onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)} className="inline-flex items-center p-3 text-white rounded-full transition-all shadow-lg hover:brightness-90" style={{ backgroundColor: '#d12814' }} aria-label="Previous slide"><ChevronLeftIcon className="w-6 h-6" /></button>
            <button onClick={() => setCurrentSlide((p) => (p + 1) % data.length)} className="ml-4 inline-flex items-center p-3 text-white rounded-full transition-all shadow-lg hover:brightness-90" style={{ backgroundColor: '#d12814' }} aria-label="Next slide"><ChevronRightIcon className="w-6 h-6" /></button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- REFINED: Individual Card Component (Matches Standard Design) ---
const Pink130Card: React.FC<{ item: Pink130Data }> = ({ item }) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-shadow duration-300 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
    >
      <div className="relative">
        <div className="h-48 w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <StarIcon className="w-16 h-16 text-gray-300 dark:text-gray-500" />
        </div>
        <span className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#d12814' }}>
            Pink 130
        </span>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold" style={{ color: '#d12814' }}>{item.category}</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm flex-grow font-semibold">{item.description}</p>
        <div className="mt-6">
          {/* Intelligent button: Prioritizes PDF, falls back to video */}
          {item.pdf_file ? (
            <a
              href={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.pdf_file.replace(/^\//, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg transition-all duration-300 hover:brightness-90"
              style={{ backgroundColor: '#d12814' }}
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              <span>View Report</span>
            </a>
          ) : item.video && (
            <a
              href={item.video}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg transition-all duration-300 hover:brightness-90"
              style={{ backgroundColor: '#d12814' }}
            >
              <PlayCircleIcon className="w-5 h-5 mr-2" />
              <span>Watch Video</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- REFINED: Pink 130 Section ---
const Pink130Section: React.FC = () => {
  const [pink130Data, setPink130Data] = useState<Pink130Data[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPink130Data = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/allMCLpink");
      setPink130Data(Array.isArray(response.data.pink130s) ? response.data.pink130s : []);
    } catch (err) {
      toast.error("Error fetching Pink 130 data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPink130Data(); }, [fetchPink130Data]);

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-[#0069b4] dark:text-indigo-400 tracking-wide uppercase">A Celebration</h2>
          <p className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: '#d12814' }}>
            130 Years of Pink
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-[#0069b4] dark:text-gray-400">
            Explore our initiatives celebrating this historic milestone.
          </p>
        </div>

        {loading ? (
          <div className="text-center mt-12"><ArrowPathIcon className="w-8 h-8 mx-auto animate-spin" style={{ color: '#d12814' }} /></div>
        ) : pink130Data.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pink130Data.map((item) => <Pink130Card key={item.pink_id} item={item} /> )}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <InformationCircleIcon className="w-12 h-12 mx-auto mb-4" />
            <p className="text-xl">No "Pink 130" data found.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// --- REFINED: Main Page Component ---
const Pink130Page: React.FC = () => {
  return (
    <div className="w-full font-sans bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <Pink130HomeSlideshow />
      <main>
        <Pink130Section />
      </main>
      <Footer />
    </div>
  );
};

export default Pink130Page;