import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Transition, Variants } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowPathIcon, InformationCircleIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

// Interface for slider data
interface LeadershipHomeData {
  leadership_home_id: number;
  heading: string;
  home_img: string | null;
  created_at: string;
  updated_at: string;
}

// Interface for leadership data
interface LeadershipData {
  leadership_id: number;
  position: string;
  leader_name: string;
  leader_image: string | null;
  level: "Board of Directors" | "Management";
  created_at: string;
  updated_at: string;
}

// Interface for leadership API response
interface LeadershipResponse {
  leadership: LeadershipData[];
}

// Constants (using direct hex codes for Tailwind compatibility)
const LOADER_ICON_ANIMATION = {
  animate: { opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] },
  transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" as const },
};
const LOADER_TEXT_ANIMATION = {
  animate: { opacity: [0.5, 1, 0.5] },
  transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" as const },
};
const MODAL_TRANSITION: Transition = { duration: 0.3, ease: "easeOut" };
const SLIDE_TRANSITION: Transition = { duration: 0.8, ease: "easeInOut" };
const TEXT_FADE_IN_TRANSITION: Transition = { duration: 0.6, ease: "easeOut" };
const CARD_TRANSITION: Transition = { duration: 0.6, ease: "easeOut" };
const CARD_HOVER_TRANSITION = { y: -8, transition: { duration: 0.2 } };
const FILTER_SECTION_TRANSITION: Transition = { duration: 0.5 };

// Full-page loader component
const Loader: React.FC = () => (
  <motion.div
    className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A51A1] z-50"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.5 } }}
  >
    <motion.div
      {...LOADER_ICON_ANIMATION}
      className="mb-4"
    >
      <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
    </motion.div>
    <motion.h2
      {...LOADER_TEXT_ANIMATION}
      className="text-2xl font-bold text-white"
    >
      Loading Leadership...
    </motion.h2>
  </motion.div>
);

// Modal for viewing images
const LeaderImageModal: React.FC<{ imageUrl: string; altText: string; onClose: () => void }> = ({
  imageUrl,
  altText,
  onClose,
}) => (
  <motion.div
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="relative bg-white rounded-lg p-4 max-w-3xl w-full"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={MODAL_TRANSITION}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
        aria-label="Close modal"
      >
        <XMarkIcon className="w-6 h-6 text-gray-800" />
      </button>
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-auto max-h-[80vh] object-contain object-center"
        onError={(e) => {
          e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Error";
        }}
      />
    </motion.div>
  </motion.div>
);

// Slider section component (Unchanged Logic)
const LeadershipHomeSlideshow: React.FC<{ setLoading: (isLoaded: boolean) => void }> = ({ setLoading }) => {
  const [slides, setSlides] = useState<LeadershipHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = useCallback(async () => {
    try {
      const response = await axiosInstance.get<LeadershipHomeData[]>("/api/leadershipHomeSlider");
      setSlides(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError("Failed to fetch leadership slider data.");
      toast.error("Error fetching leadership slider data.");
    } finally {
      setLoading(true);
    }
  }, [setLoading]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (error || slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <InformationCircleIcon className="w-10 h-10 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-white">{error ? "Content Unavailable" : "No Sliders Found"}</h2>
      </div>
    );
  }

  const imageUrl = slides[currentSlide]?.home_img
    ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${slides[currentSlide].home_img.replace(/^\//, "")}`
    : "https://via.placeholder.com/1200x600?text=Image+Missing";

  return (
    <>
      <section className="relative min-h-[80vh] w-full overflow-hidden bg-gray-800">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={SLIDE_TRANSITION}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
            <img
              src={imageUrl}
              alt={slides[currentSlide].heading}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error"; }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="relative z-20 flex flex-col justify-center min-h-[80vh] max-w-6xl mx-auto px-4 md:px-8">
          <div className="max-w-xl">
            <motion.h2
              key={`h2-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={TEXT_FADE_IN_TRANSITION}
              className="text-3xl md:text-5xl font-bold text-white mb-8"
            >
              {slides[currentSlide].heading}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="flex gap-4"
            >
              <button onClick={() => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length)} className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition" aria-label="Previous slide" >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button onClick={() => setCurrentSlide((p) => (p + 1) % slides.length)} className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition" aria-label="Next slide" >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>
      <AnimatePresence>
        {isModalOpen && (
          <LeaderImageModal imageUrl={imageUrl} altText={slides[currentSlide].heading} onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

// Individual leader card component
const LeadershipCard: React.FC<{ leader: LeadershipData; index: number }> = ({ leader, index }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const defaultImage = "https://via.placeholder.com/400x300?text=Leader+Image";
  const imageUrl = leader.leader_image
    ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${leader.leader_image.replace(/^\//, "")}`
    : defaultImage;

  return (
    <>
      <motion.div className="bg-white shadow-lg flex flex-col rounded-lg overflow-hidden h-full" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={CARD_TRANSITION} whileHover={CARD_HOVER_TRANSITION} >
        <div className="relative aspect-w-4 aspect-h-3 bg-gray-100 flex items-center justify-center">
          <img className="w-full h-full object-contain object-center cursor-pointer" src={imageUrl} alt={leader.leader_name} onClick={() => setIsModalOpen(true)} onError={(e) => { e.currentTarget.src = defaultImage; }} loading="lazy" />
        </div>
        <div className="p-6 flex flex-col flex-grow text-center">
          <p className="text-md font-semibold text-[#ed1c24] mb-2">{index + 1}. {leader.position}</p>
          <h3 className="text-xl font-bold text-[#003459]">{leader.leader_name}</h3>
        </div>
      </motion.div>
      <AnimatePresence>
        {isModalOpen && (
          <LeaderImageModal imageUrl={imageUrl} altText={leader.leader_name} onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

// Leadership section with filter buttons (Unchanged Logic)
const LeadershipSection: React.FC<{ setLoading: (isLoaded: boolean) => void }> = ({ setLoading }) => {
  const [leaders, setLeaders] = useState<LeadershipData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"Board of Directors" | "Management" | "All">("All");
  
  const fetchLeaders = useCallback(async () => {
    try {
      const response = await axiosInstance.get<LeadershipResponse>("/api/allLeadership");
      if (response.data && Array.isArray(response.data.leadership)) {
        const sortedLeaders = response.data.leadership.sort((a, b) => a.leadership_id - b.leadership_id);
        setLeaders(sortedLeaders);
        if (sortedLeaders.length === 0) {
          setError("No leadership team data available.");
        }
      } else {
        throw new Error("Invalid leadership data format.");
      }
    } catch (err: any) {
      setError("Could not fetch leadership team.");
      toast.error("Could not fetch leadership team.");
    } finally {
      setLoading(true);
    }
  }, [setLoading]);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  const filteredLeaders = filter === "All" ? leaders : leaders.filter((leader) => leader.level === filter);
  const boardLeaders = leaders.filter((leader) => leader.level === "Board of Directors");
  const managementLeaders = leaders.filter((leader) => leader.level === "Management");

  if (error && leaders.length === 0) {
    return (
        <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
            <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-2xl font-bold text-[#003459]">Failed to Load Content</h3>
        </div>
    );
  }

  return (
    <section className="py-16 bg-[#fafaf1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={TEXT_FADE_IN_TRANSITION} className="text-3xl sm:text-4xl font-bold text-[#ed1c24]" >
            Our Leadership
          </motion.h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Meet the dedicated team guiding our company forward.
          </p>
        </div>
        <div className="flex justify-center flex-wrap gap-4 mb-12">
          <button onClick={() => setFilter("Board of Directors")} className={`px-6 py-2 rounded-full font-semibold transition ${ filter === "Board of Directors" ? "bg-[#ed1c24] text-white shadow-lg" : "bg-[#003459] text-white hover:bg-[#0a5a60]" }`} >
            Board of Directors
          </button>
          <button onClick={() => setFilter("Management")} className={`px-6 py-2 rounded-full font-semibold transition ${ filter === "Management" ? "bg-[#ed1c24] text-white shadow-lg" : "bg-[#003459] text-white hover:bg-[#0a5a60]" }`} >
            Management
          </button>
          <button onClick={() => setFilter("All")} className={`px-6 py-2 rounded-full font-semibold transition ${ filter === "All" ? "bg-[#ed1c24] text-white shadow-lg" : "bg-[#003459] text-white hover:bg-[#0a5a60]" }`} >
            All
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={filter} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={FILTER_SECTION_TRANSITION} >
            {filter === "All" ? (
              <div className="space-y-16">
                {boardLeaders.length > 0 && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#003459] mb-8 text-center">Board of Directors</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {boardLeaders.map((leader, index) => (
                        <LeadershipCard key={leader.leadership_id} leader={leader} index={index} />
                      ))}
                    </div>
                  </div>
                )}
                {managementLeaders.length > 0 && (
                  <div>
                    <h3 className="text-3xl font-bold text-[#003459] mt-16 mb-8 text-center">Management</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {managementLeaders.map((leader, index) => (
                        <LeadershipCard key={leader.leadership_id} leader={leader} index={index} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredLeaders.map((leader, index) => (
                  <LeadershipCard key={leader.leadership_id} leader={leader} index={index} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

// Main leadership page component (Corrected Loading Logic)
const LeadershipHomePage: React.FC = () => {
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
      <ToastContainer position="top-right" autoClose={4000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      
      <AnimatePresence>
        {isLoading && <Loader />}
      </AnimatePresence>

      {/* This wrapper is always rendered, but its visibility is animated. 
          This ensures the child components mount and their useEffects run. */}
      <motion.div
        className="flex-grow flex flex-col"
        initial="hidden"
        animate={isLoading ? "hidden" : "visible"}
        variants={contentVariants}
      >
        <header>
          <LeadershipHomeSlideshow setLoading={setSlideshowLoaded} />
        </header>
        <main className="flex-grow">
          <LeadershipSection setLoading={setSectionLoaded} />
        </main>
        <Footer />
      </motion.div>
    </div>
  );
};

export default LeadershipHomePage;