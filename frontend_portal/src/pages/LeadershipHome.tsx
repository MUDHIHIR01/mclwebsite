import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

// --- INTERFACES ---
interface LeadershipHomeData {
  leadership_home_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadershipData {
  leadership_id: number;
  position: string;
  leader_name: string;
  leader_image: string | null;
  description: string;
  created_at: string;
}

// --- Slider Section ---
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
      setError("Failed to fetch leadership data.");
      toast.error("Error fetching leadership data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeadershipHomes();
  }, [fetchLeadershipHomes]);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % data.length), 5000);
    return () => clearInterval(interval);
  }, [data.length]);

  if (loading) {
    return (
      <div className="w-full py-20 text-center bg-gray-800">
        <ArrowPathIcon className="w-8 h-8 mx-auto text-[#0d7680] animate-spin" />
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <InformationCircleIcon className="w-10 h-10 text-[#0d7680]" />
          <h2 className="text-3xl font-bold text-white">{error ? "Failed to Load Content" : "No Sliders Found"}</h2>
        </div>
        <p className="text-lg text-gray-200">{error || "Content could not be loaded."}</p>
        {error && (
          <button
            onClick={fetchLeadershipHomes}
            className="mt-6 flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Retry
          </button>
        )}
      </div>
    );
  }

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
            src={
              data[currentSlide].home_img
                ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${data[currentSlide].home_img!.replace(/^\//, "")}`
                : "https://via.placeholder.com/1200x600?text=Image+Missing"
            }
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
              aria-label="Previous"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % data.length)}
              className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              aria-label="Next"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Individual Leader Card Component ---
const LeadershipCard: React.FC<{ leader: LeadershipData }> = ({ leader }) => {
  const imageUrl = leader.leader_image
    ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${leader.leader_image.replace(/^\//, "")}`
    : null;

  return (
    <motion.div
      key={leader.leadership_id}
      className="bg-[#fff1e5] shadow-lg flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -12 }}
    >
      <div className="relative px-4 -mt-8 md:px-8 md:-mt-10">
        {imageUrl ? (
          <img
            className="w-full h-64 object-cover shadow-md"
            src={imageUrl}
            alt={leader.leader_name}
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x200?text=Image+Error")}
          />
        ) : (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center shadow-md">
            <UserGroupIcon className="w-20 h-20 text-gray-300" />
          </div>
        )}
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
          {leader.position}
        </span>
      </div>
      <div className="p-8 flex flex-col flex-grow text-black">
        <h3 className="uppercase text-xl sm:text-2xl font-bold relative pb-4 mb-4 text-[#33302d]">
          {leader.leader_name}
          <span className="absolute bottom-0 left-0 h-1 w-1/4 bg-[#33302d]"></span>
        </h3>
        <p className="text-gray-700 text-base font-medium flex-grow line-clamp-4">{leader.description}</p>
        <div className="mt-6">
          <Link
            to={`/leadership/${leader.leadership_id}`}
            className="flex items-center gap-2 text-lg font-bold text-[#0d7680] hover:text-[#0a5a60]"
          >
            Find more
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// --- Leadership Card Section Component ---
const LeadershipCardSection: React.FC = () => {
  const [leaders, setLeaders] = useState<LeadershipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all leaders from the backend without any limit
      const response = await axiosInstance.get<{ leadership: LeadershipData[] }>("/api/allLeadership");
      setLeaders(
        response.data?.leadership && Array.isArray(response.data.leadership) ? response.data.leadership : []
      );
    } catch (err) {
      setError("Could not fetch leadership team.");
      toast.error("Could not fetch leadership team.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  if (loading) {
    return (
      <div className="w-full py-20 text-center">
        <ArrowPathIcon className="w-8 h-8 mx-auto text-[#0d7680] animate-spin" />
      </div>
    );
  }

  if (error || leaders.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800">{error ? "Failed to Load Content" : "No Content Available"}</h3>
        <p className="mt-2 text-gray-600">{error || "There is no leadership team to display at the moment."}</p>
        {error && (
          <button
            onClick={fetchLeaders}
            className="mt-6 flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Leadership</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Meet the dedicated team guiding our company forward.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
          {leaders.map((leader) => (
            <LeadershipCard key={leader.leadership_id} leader={leader} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main LeadershipHomePage Component ---
const LeadershipHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer
        position="top-left"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <header>
        <LeadershipHomeSlideshow />
      </header>
      <main className="flex-grow">
        <LeadershipCardSection />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default LeadershipHomePage;