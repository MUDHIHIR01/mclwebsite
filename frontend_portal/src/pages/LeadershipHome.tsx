import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Footer from "../components/Footer";

// --- INTERFACES ---
interface LeadershipHomeData {
  leadership_home_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

interface LeadershipData {
  leadership_id: number;
  position: string;
  leader_name: string;
  leader_image: string | null;
  description: string;
}

// --- REFINED: Leadership Hero Section ---
const LeadershipHomeSlideshow: React.FC = () => {
  const [data, setData] = useState<LeadershipHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeadershipHomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/leadershipHomeSlider");
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError("Failed to fetch leadership data: " + (err.response?.data?.message || err.message));
      toast.error("Error fetching leadership data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeadershipHomes(); }, [fetchLeadershipHomes]);

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
        <p className="text-gray-200 mb-8 text-lg text-center">{error || "No leadership data was found."}</p>
        {error && <button onClick={fetchLeadershipHomes} className="inline-flex items-center px-8 py-3 text-white rounded-full hover:brightness-90 transition-all shadow-lg" style={{ backgroundColor: '#d12814' }}><ArrowPathIcon className="w-5 h-5 mr-2" /> Try Again</button>}
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
          <motion.h2 key={`h2-${currentSlide}`} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight" style={{ color: "#d12814", textShadow: "0 4px 12px rgba(0,0,0,0.4)" }} variants={contentVariants} initial="hidden" animate="visible">
            {data[currentSlide].heading}
          </motion.h2>
          <motion.p key={`p-${currentSlide}`} className="text-lg sm:text-xl text-gray-100 mb-8 leading-relaxed font-semibold" variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            {data[currentSlide].description || "No description available"}
          </motion.p>
          <motion.div variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            <button onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)} className="inline-flex items-center p-3 text-white rounded-full transition-all shadow-lg hover:brightness-90" style={{ backgroundColor: '#d12814' }} aria-label="Previous"><ChevronLeftIcon className="w-6 h-6" /></button>
            <button onClick={() => setCurrentSlide((p) => (p + 1) % data.length)} className="ml-4 inline-flex items-center p-3 text-white rounded-full transition-all shadow-lg hover:brightness-90" style={{ backgroundColor: '#d12814' }} aria-label="Next"><ChevronRightIcon className="w-6 h-6" /></button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- REFINED: Individual Leader Card Component ---
const LeadershipCard: React.FC<{ leader: LeadershipData; onImageClick: (imageUrl: string | null) => void }> = ({ leader, onImageClick }) => {
    const [hasImageError, setHasImageError] = useState(false);
    const imageUrl = leader.leader_image ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${leader.leader_image.replace(/^\//, "")}` : null;
    const showPlaceholder = hasImageError || !imageUrl;

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full transition-shadow duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
            <div className="relative">
                <div className="h-64 w-full cursor-pointer" onClick={() => onImageClick(leader.leader_image)}>
                    {showPlaceholder ? (
                        <div className="h-full w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <UserGroupIcon className="w-20 h-20 text-gray-300 dark:text-gray-500" />
                        </div>
                    ) : (
                        <img className="h-full w-full object-cover" src={imageUrl!} alt={leader.leader_name} onError={() => setHasImageError(true)} />
                    )}
                </div>
                <span className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#d12814' }}>
                    Leadership
                </span>
            </div>
            <div className="p-6 text-left flex-grow flex flex-col">
                <h3 className="text-xl font-bold" style={{ color: '#d12814' }}>{leader.leader_name}</h3>
                <p className="font-semibold mb-3" style={{ color: '#0069b4' }}>{leader.position}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm flex-grow font-semibold">{leader.description}</p>
            </div>
        </motion.div>
    );
};

// --- REFINED: Leadership Section Component ---
const LeadershipSection: React.FC = () => {
  const [leaders, setLeaders] = useState<LeadershipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string>("");

  const fetchLeaders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<{ leadership: LeadershipData[] }>("/api/allLeadership");
      setLeaders(response.data?.leadership && Array.isArray(response.data.leadership) ? response.data.leadership : []);
    } catch (err) {
      toast.error("Could not fetch leadership team.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaders(); }, [fetchLeaders]);

  const openModal = (image: string | null) => {
    if (image) {
      setModalImage(`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${image.replace(/^\//, "")}`);
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImage("");
  };

  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold sm:text-4xl inline-flex items-center" style={{ color: '#d12814' }}>
          <UserGroupIcon className="w-9 h-9 mr-3" />
          Our Leadership
        </h2>
        <p className="mt-4 text-lg text-[#0069b4] dark:text-gray-400">Meet the dedicated team guiding our company forward.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-3 text-xl font-semibold text-gray-600 dark:text-gray-300 animate-pulse">
            <ArrowPathIcon className="w-8 h-8 animate-spin" style={{ color: '#d12814' }} />
            <span>Loading Leadership...</span>
          </div>
        </div>
      ) : leaders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {leaders.map((leader) => (
            <LeadershipCard key={leader.leadership_id} leader={leader} onImageClick={openModal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <InformationCircleIcon className="w-12 h-12 mx-auto mb-4" />
          <p className="text-xl">No leadership team members found.</p>
        </div>
      )}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={closeModal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="relative" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()}>
              <button onClick={closeModal} className="absolute -top-3 -right-3 text-white rounded-full p-2 hover:brightness-90 z-10" style={{ backgroundColor: '#d12814' }}><XMarkIcon className="w-6 h-6" /></button>
              <img src={modalImage} alt="Full size view" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main LeadershipHomePage Component ---
const LeadershipHomePage: React.FC = () => {
  return (
    <div className="w-full font-sans bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <LeadershipHomeSlideshow />
      <main>
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LeadershipSection />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LeadershipHomePage;