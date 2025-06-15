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
  SparklesIcon, // Icon for Sustainability placeholder and heading
  DocumentTextIcon, // Icon for PDF reports
  LinkIcon, // Icon for weblinks
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
  weblink: string | null; // Can be null
  sustain_pdf_file: string | null; // Can be null
}

// --- REFINED: Sustainability Home Slideshow (Matches AboutPage Hero) ---
const SustainabilityHomeSlideshow: React.FC = () => {
  const [data, setData] = useState<SustainabilityHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSustainabilityHomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<SustainabilityHomeData[]>("/api/sust/homeSlider");
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      const message = "Failed to fetch sustainability sliders: " + (err.response?.data?.message || err.message);
      setError(message);
      toast.error("Error fetching sustainability sliders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSustainabilityHomes(); }, [fetchSustainabilityHomes]);

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
          <span>{data.length === 0 ? "No Content Found" : "An Error Occurred"}</span>
        </div>
        <p className="text-gray-200 mb-8 text-lg text-center">{error || "Sustainability content could not be loaded."}</p>
        {error && <button onClick={fetchSustainabilityHomes} className="inline-flex items-center px-8 py-3 text-white rounded-full hover:brightness-90 transition-all shadow-lg" style={{ backgroundColor: '#d12814' }}><ArrowPathIcon className="w-5 h-5 mr-2" /> Try Again</button>}
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
            <button onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)} className="inline-flex items-center p-3 text-white rounded-full transition-all duration-300 shadow-lg hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d12814]" style={{ backgroundColor: '#d12814' }} aria-label="Previous slide"><ChevronLeftIcon className="w-6 h-6" /></button>
            <button onClick={() => setCurrentSlide((p) => (p + 1) % data.length)} className="ml-4 inline-flex items-center p-3 text-white rounded-full transition-all duration-300 shadow-lg hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d12814]" style={{ backgroundColor: '#d12814' }} aria-label="Next slide"><ChevronRightIcon className="w-6 h-6" /></button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- REFINED: Sustainability Section (Matches AboutPage Section) ---
const SustainabilitySection: React.FC = () => {
  const [sustainabilityData, setSustainabilityData] = useState<SustainabilityData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSustainabilityData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/allSustainability");
      setSustainabilityData(response.data?.data && Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      toast.error("Error fetching sustainability data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSustainabilityData(); }, [fetchSustainabilityData]);

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
            <h2 className="text-base font-semibold text-[#0069b4] dark:text-indigo-400 tracking-wide uppercase">Our Initiatives</h2>
            <p className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: '#d12814' }}>
              Sustainability
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-[#0069b4] dark:text-gray-400">
              Explore our commitment to a sustainable future through our projects and reports.
            </p>
        </div>

        {loading ? (
          <div className="text-center mt-12"><ArrowPathIcon className="w-8 h-8 mx-auto animate-spin" style={{ color: '#d12814' }} /></div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sustainabilityData.map((item) => (
              <motion.div 
                  key={item.sustain_id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-shadow duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              >
                  <div className="relative">
                      <div className="h-48 w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <SparklesIcon className="w-16 h-16 text-gray-300 dark:text-gray-500"/>
                      </div>
                      <span className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#d12814' }}>
                          Sustainability
                      </span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold" style={{ color: '#d12814' }}>{item.sustain_category}</h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm flex-grow font-semibold">{item.description}</p>
                      <div className="mt-6">
                          {/* Intelligent button: Prioritizes PDF link, falls back to weblink */}
                          {item.sustain_pdf_file ? (
                             <a
                                href={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.sustain_pdf_file.replace(/^\//, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg transition-all duration-300 hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d12814]"
                                style={{ backgroundColor: '#d12814' }}
                              >
                                <DocumentTextIcon className="w-5 h-5 mr-2" />
                                <span>View Report</span>
                              </a>
                          ) : item.weblink && (
                            <a
                                href={item.weblink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg transition-all duration-300 hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d12814]"
                                style={{ backgroundColor: '#d12814' }}
                              >
                                <LinkIcon className="w-5 h-5 mr-2" />
                                <span>Learn More</span>
                            </a>
                          )}
                      </div>
                  </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// --- Main SustainabilityHomePage Component ---
const SustainabilityHomePage: React.FC = () => {
  return (
    <div className="w-full font-sans bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <SustainabilityHomeSlideshow />
      <SustainabilitySection />
      <Footer />
    </div>
  );
};

export default SustainabilityHomePage;