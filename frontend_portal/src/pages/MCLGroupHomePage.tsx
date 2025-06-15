import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from '../components/Footer';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  BuildingOffice2Icon,
  XMarkIcon, // Kept for potential future use, though modal is removed
} from "@heroicons/react/24/outline";

// --- INTERFACES ---
interface MCLHomeData {
  mcl_home_id: number;
  heading: string;
  description: string | null;
  mcl_home_img: string | null;
}

interface MCLGroupData {
  mcl_id: number;
  mcl_category: string;
  image_file: string | null;
  description: string;
  weblink: string;
}

// --- REFINED: Hero Section (Slider) Component ---
const CompanySlideshow: React.FC = () => {
  const [data, setData] = useState<MCLHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/sliders");
      if (response.data && Array.isArray(response.data.data)) {
        setData(response.data.data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err: any) {
      setError("Failed to fetch slides: " + (err.response?.data?.message || err.message));
      toast.error("Failed to fetch slides.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((p) => (p + 1) % data.length), 5000);
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
        <p className="text-gray-200 mb-8 text-lg text-center">{error || "No slides were found for this section."}</p>
        {error && <button onClick={fetchSlides} className="inline-flex items-center px-8 py-3 text-white rounded-full hover:brightness-90 transition-all shadow-lg" style={{ backgroundColor: '#d12814' }}><ArrowPathIcon className="w-5 h-5 mr-2" /> Try Again</button>}
      </div>
    );
  }

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
        <AnimatePresence mode="wait">
            <motion.div key={currentSlide} variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
                <img src={data[currentSlide].mcl_home_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${data[currentSlide].mcl_home_img!.replace(/^\//, "")}` : "https://via.placeholder.com/1200x600?text=Image+Missing"} alt={data[currentSlide].heading} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error"; }} loading="lazy" />
            </motion.div>
        </AnimatePresence>
        <div className="relative z-20 flex flex-col justify-center min-h-[80vh] px-4 sm:px-8">
            <div className="max-w-[50%] text-left ml-12">
                <motion.h2 key={`h2-${currentSlide}`} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight" style={{ color: "#d12814", textShadow: "0 4px 12px rgba(0,0,0,0.4)" }} variants={contentVariants} initial="hidden" animate="visible">
                    {data[currentSlide].heading}
                </motion.h2>
                <motion.p key={`p-${currentSlide}`} className="text-lg sm:text-xl text-gray-100 mb-8 leading-relaxed font-semibold" variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
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

// --- REFINED: Individual Card Component (Matches Sustainability/About style) ---
const MCLGroupCard: React.FC<{ group: MCLGroupData }> = ({ group }) => {
    const [hasImageError, setHasImageError] = useState(false);
    const imageUrl = group.image_file ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${group.image_file.replace(/^\//, "")}` : null;
    const showPlaceholder = hasImageError || !imageUrl;

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
                    {showPlaceholder ? (
                        <div className="h-full w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <BuildingOffice2Icon className="w-16 h-16 text-gray-300 dark:text-gray-500" />
                        </div>
                    ) : (
                        <img className="h-full w-full object-cover" src={imageUrl!} alt={group.mcl_category} onError={() => setHasImageError(true)} />
                    )}
                </div>
                <span className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#d12814' }}>
                    Group
                </span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold" style={{ color: '#d12814' }}>{group.mcl_category}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm flex-grow font-semibold line-clamp-4">{group.description}</p>
                <div className="mt-6">
                    {group.weblink && (
                        <a
                            href={group.weblink} target="_blank" rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg transition-all duration-300 hover:brightness-90"
                            style={{ backgroundColor: '#d12814' }}
                        >
                            <BuildingOffice2Icon className="w-5 h-5 mr-2" />
                            <span>Learn More</span>
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// --- REFINED: MCL Groups Section Component ---
const MCLGroupsSection: React.FC = () => {
  const [groups, setGroups] = useState<MCLGroupData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<{ data: MCLGroupData[] }>("/api/allMclGroups");
      setGroups(response.data?.data && Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      toast.error("Could not fetch company groups.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold sm:text-4xl inline-flex items-center" style={{ color: '#d12814' }}>
          <BuildingOffice2Icon className="w-9 h-9 mr-3" />
          Our Groups
        </h2>
        <p className="mt-4 text-lg text-[#0069b4] dark:text-gray-400">Discover the diverse groups under our company umbrella.</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-3 text-xl font-semibold text-gray-600 dark:text-gray-300 animate-pulse">
            <ArrowPathIcon className="w-8 h-8 animate-spin" style={{ color: '#d12814' }} />
            <span>Loading Groups...</span>
          </div>
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {groups.map((group) => <MCLGroupCard key={group.mcl_id} group={group} />)}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <InformationCircleIcon className="w-12 h-12 mx-auto mb-4" />
          <p className="text-xl">No company groups found.</p>
        </div>
      )}
    </>
  );
};

// --- REFINED: Main Page Component ---
const MCLGroupPage: React.FC = () => {
  return (
    <div className="w-full font-sans bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <CompanySlideshow />
      <main>
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MCLGroupsSection />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MCLGroupPage;