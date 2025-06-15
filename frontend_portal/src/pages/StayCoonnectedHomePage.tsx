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
  RssIcon, // A fitting icon for "Stay Connected"
} from "@heroicons/react/24/outline";

// --- INTERFACES for STAY CONNECTED ---
interface StayConnectedHomeData {
  stay_connected_id: number;
  heading: string;
  description: string;
  home_img: string;
}

interface StayConnectedItem {
  stay_connected_id: number;
  category: string;
  img_file: string;
  description: string;
}

// --- REFINED: Stay Connected Home Slideshow ---
const StayConnectedHomeSlideshow: React.FC = () => {
  const [data, setData] = useState<StayConnectedHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStayConnectedHomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetching from the new stay connected slider endpoint
      const response = await axiosInstance.get<StayConnectedHomeData[]>("/api/stayconnected/sliders");
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      const message = "Failed to fetch sliders: " + (err.response?.data?.message || err.message);
      setError(message);
      toast.error("Error fetching home sliders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStayConnectedHomes(); }, [fetchStayConnectedHomes]);

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
        <p className="text-gray-200 mb-8 text-lg text-center">{error || "Content for the slider could not be loaded."}</p>
        {error && <button onClick={fetchStayConnectedHomes} className="inline-flex items-center px-8 py-3 text-white rounded-full transition-all duration-300 shadow-lg hover:brightness-90" style={{ backgroundColor: '#d12814' }}><ArrowPathIcon className="w-5 h-5 mr-2" />Try Again</button>}
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

// --- REFINED: Individual Stay Connected Card ---
const StayConnectedCard: React.FC<{ item: StayConnectedItem }> = ({ item }) => {
    const [hasImageError, setHasImageError] = useState(false);
    const imageUrl = `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.img_file.replace(/^\//, "")}`;

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
                        <img className="h-full w-full object-cover" src={imageUrl} alt={item.category} onError={() => setHasImageError(true)} />
                    )}
                </div>
                <span className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#d12814' }}>
                    {item.category}
                </span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold" style={{ color: '#d12814' }}>{item.category}</h3>
                {/* Using `pre-wrap` to respect line breaks from the API response */}
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm flex-grow font-semibold" style={{ whiteSpace: 'pre-wrap' }}>
                    {item.description}
                </p>
            </div>
        </motion.div>
    );
};

// --- REFINED: Stay Connected Section ---
const StayConnectedSection: React.FC = () => {
  const [items, setItems] = useState<StayConnectedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetching from the new stay connected list endpoint
      const response = await axiosInstance.get<{ stay_connected: StayConnectedItem[] }>("/api/stay-connected/all");
      if (response.data && Array.isArray(response.data.stay_connected)) {
        setItems(response.data.stay_connected);
      } else {
        toast.error("Failed to fetch content: Invalid data format.");
        setItems([]);
      }
    } catch (err) {
      toast.error("An error occurred while fetching content.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
            <h2 className="text-base font-semibold text-[#0069b4] dark:text-indigo-400 tracking-wide uppercase">Get Updates</h2>
            <p className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: '#d12814' }}>
              Join Our Talent Community
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-[#0069b4] dark:text-gray-400">
              Receive updates on job openings, exclusive insights, and networking opportunities.
            </p>
        </div>

        {isLoading ? (
          <div className="text-center mt-12"><ArrowPathIcon className="w-8 h-8 mx-auto animate-spin" style={{color: '#d12814'}}/></div>
        ) : items.length > 0 ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <StayConnectedCard key={item.stay_connected_id} item={item} />
            ))}
          </div>
        ) : (
             <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <RssIcon className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xl">No "Stay Connected" information found at this time.</p>
            </div>
        )}
      </div>
    </section>
  );
};


// --- Main StayConnectedPage Component ---
const StayConnectedPage: React.FC = () => {
  return (
    <div className="w-full font-sans bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <StayConnectedHomeSlideshow />
      <StayConnectedSection />
      <Footer />
    </div>
  );
};

export default StayConnectedPage;