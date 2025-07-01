import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowPathIcon,
  InformationCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../axios"; // Assuming axiosInstance is defined in ../axios
import Footer from "../components/Footer"; // Assuming Footer component exists

// --- Interfaces ---
interface NewsHomeData {
  news_home_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsData {
  news_id: number;
  category: string;
  description: string | null;
  news_img: string | null;
  pdf_file: string | null;
  created_at: string;
  updated_at: string;
}

interface NewsApiResponse {
  news: NewsData[];
}

// --- Utility Functions ---
const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const getFullMediaUrl = (path: string | null): string | null => {
  if (!path) return null;
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const cleanPath = path.replace(/^\//, "");
  return `${baseURL}/${cleanPath}`;
};

// --- Full-page loader component ---
const Loader: React.FC = () => {
  const loaderVariants: Variants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.05, 1],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#003459] z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div variants={loaderVariants} animate="animate" className="mb-4">
        <ArrowPathIcon className="w-16 h-16 text-[#0d7680] animate-spin" />
      </motion.div>
      <motion.h2
        variants={loaderVariants}
        animate="animate"
        className="text-2xl font-bold text-white"
      >
        Loading News...
      </motion.h2>
    </motion.div>
  );
};

// --- Modal for viewing media ---
const NewsMediaModal: React.FC<{
  media: { url: string; isImage: boolean }[];
  onClose: () => void;
}> = ({ media, onClose }) => {
  const [current, setCurrent] = useState(0);

  if (media.length === 0) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-[#003459] rounded-lg p-2 max-w-5xl w-full mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-black/30 rounded-full hover:bg-[#ed1c24] transition z-20"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
        <div className="relative w-full h-auto max-h-[80vh]">
          {media[current].isImage ? (
            <img
              src={media[current].url}
              alt="News Media"
              className="w-full h-full max-h-[80vh] object-contain"
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Error")}
            />
          ) : (
            <iframe
              src={media[current].url}
              className="w-full h-full max-h-[80vh] object-contain"
              title="News PDF"
              allow="fullscreen"
            />
          )}
        </div>
        {media.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrent((p) => (p - 1 + media.length) % media.length)}
              className="p-3 bg-black/50 text-white rounded-full hover:bg-[#0d7680] transition"
              aria-label="Previous media"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <span className="text-white font-mono text-sm bg-black/50 px-3 py-1 rounded-full">
              {current + 1} / {media.length}
            </span>
            <button
              onClick={() => setCurrent((p) => (p + 1) % media.length)}
              className="p-3 bg-black/50 text-white rounded-full hover:bg-[#0d7680] transition"
              aria-label="Next media"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// --- News Home Slideshow ---
const NewsHomeSlideshow: React.FC = () => {
  const [data, setData] = useState<NewsHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewsHome = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<NewsHomeData[]>("/api/news-home-slider");
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      const message = "Failed to fetch news sliders: " + (err.response?.data?.message || err.message);
      setError(message);
      toast.error("Error fetching news sliders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsHome();
  }, [fetchNewsHome]);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % data.length), 5000);
    return () => clearInterval(interval);
  }, [data.length]);

  if (loading) return null; // Simplified loader, main loader handles this
  if (error || data.length === 0) return null; // Hide section on error/no data

  const imagePath = getFullMediaUrl(data[currentSlide].home_img) || "https://via.placeholder.com/1200x600?text=Image+Missing";

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
            src={imagePath}
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
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-[#0d7680] transition"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % data.length)}
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-[#0d7680] transition"
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

// --- Individual news card component (for the grid) ---
const NewsCard: React.FC<{
  news: NewsData;
  isFeatured: boolean;
  onMediaClick: (news: NewsData) => void;
  onReadMoreClick: (news: NewsData) => void;
}> = ({ news, isFeatured, onMediaClick, onReadMoreClick }) => {
  const maxLength = 100;
  const mediaUrl = getFullMediaUrl(news.news_img);
  const description = news.description || "No description available.";
  const isLongDescription = description.length > maxLength;
  const truncatedDescription = isLongDescription
    ? `${description.slice(0, maxLength)}...`
    : description;

  return (
    <motion.div
      layoutId={`news-card-${news.news_id}`} // Key for the animation
      className="bg-white shadow-xl flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -8 }}
    >
      <div className="relative h-56">
        <img
          className="w-full h-full object-cover"
          src={mediaUrl || "https://via.placeholder.com/400x225/003459/ffffff?text=News"}
          alt={news.category}
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x225?text=Image+Error")}
        />
        {isFeatured && (
          <span className="absolute top-0 left-4 bg-[#ed1c24] text-white text-xs font-bold px-3 py-1 rounded-b-md z-10">
            LATEST
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow text-gray-800">
        <p className="text-sm font-semibold text-[#0d7680] mb-2">{formatDate(news.created_at)}</p>
        <h3 className="text-xl font-bold text-[#003459] mb-3">{news.category}</h3>
        <p className="text-gray-600 text-base flex-grow mb-4">{truncatedDescription}</p>
        
        <div className="mt-auto flex items-center justify-between">
            {isLongDescription && (
              <button
                onClick={() => onReadMoreClick(news)}
                className="text-[#ed1c24] font-semibold hover:text-[#003459] transition-colors"
              >
                Read More
              </button>
            )}
            {(news.news_img || news.pdf_file) && (
              <button
                onClick={() => onMediaClick(news)}
                className="flex items-center text-[#ed1c24] font-semibold hover:text-[#003459] transition-colors ml-auto"
                aria-label="View media"
              >
                View Media
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </button>
            )}
        </div>
      </div>
    </motion.div>
  );
};

// --- Expanded card component (for the overlay) ---
const ExpandedNewsCard: React.FC<{
  news: NewsData;
  onClose: () => void;
}> = ({ news, onClose }) => {
    const mediaUrl = getFullMediaUrl(news.news_img);
    const fullDescription = (news.description || "No description available.")
        .split(/\r?\n\r?\n/)
        .filter(p => p.trim())
        .map((p, index) => <p key={index} className="mb-4">{p}</p>);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div
                layoutId={`news-card-${news.news_id}`} // Must match the small card's layoutId
                className="relative bg-white shadow-2xl rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-64 md:h-80 w-full">
                    <img
                        className="w-full h-full object-cover rounded-t-xl"
                        src={mediaUrl || "https://via.placeholder.com/800x400/003459/ffffff?text=News"}
                        alt={news.category}
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Error")}
                    />
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <p className="text-sm font-semibold text-[#0d7680] mb-2">{formatDate(news.created_at)}</p>
                    <h3 className="text-2xl font-bold text-[#003459] mb-4">{news.category}</h3>
                    <div className="text-gray-700 text-base">{fullDescription}</div>
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 bg-black/40 text-white rounded-full hover:bg-[#ed1c24] transition"
                    aria-label="Close"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </motion.div>
        </div>
    )
}

// --- News section with filters (NOW MANAGES THE EXPANDED STATE) ---
const NewsSection: React.FC<{
  setLoading: (loading: boolean) => void;
  onMediaClick: (news: NewsData) => void;
}> = ({ setLoading, onMediaClick }) => {
  const [news, setNews] = useState<NewsData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [selectedNews, setSelectedNews] = useState<NewsData | null>(null); // State for the expanded card

  const fetchNews = useCallback(async () => {
    // ... (fetchNews logic is unchanged)
    try {
        const response = await axiosInstance.get<NewsApiResponse>("/api/allNews");
        const newsData = response.data.news;
        const sortedNews = (Array.isArray(newsData) ? newsData : []).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setNews(sortedNews);
      } catch (err: any) {
        setError("Failed to fetch news data.");
        toast.error("Error fetching news data.");
      } finally {
        setLoading(true);
      }
  }, [setLoading]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);
  
  // Close expanded view on escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedNews(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const filteredNews = news.filter((item) => {
    // ... (filtering logic is unchanged)
    if (year && new Date(item.created_at).getFullYear().toString() !== year) return false;
    if (month && (new Date(item.created_at).getMonth() + 1).toString() !== month) return false;
    return true;
  });

  const latestNewsId = filteredNews.length > 0 ? filteredNews[0].news_id : null;

  if (error) { /* ... (error display is unchanged) */ }

  const months = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(0, i).toLocaleString("en-US", { month: "long" }) }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2002 + 1 }, (_, i) => (currentYear - i).toString());

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* ... (Header and filters are unchanged) */}
        <div className="text-center mb-12">
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-extrabold text-[#003459]">
            Our News
          </motion.h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest stories and achievements from Mwananchi Communications Limited.
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filters */}
        </div>
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item) => (
              <NewsCard
                key={item.news_id}
                news={item}
                isFeatured={item.news_id === latestNewsId}
                onMediaClick={onMediaClick}
                onReadMoreClick={setSelectedNews} // Pass the setter function
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <CalendarDaysIcon className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-xl font-bold text-[#003459]">No News Found</h3>
            <p className="text-gray-500 mt-2">There are no news articles matching your current filters.</p>
          </div>
        )}
      </div>

      {/* RENDER THE EXPANDED CARD HERE */}
      <AnimatePresence>
        {selectedNews && (
            <ExpandedNewsCard news={selectedNews} onClose={() => setSelectedNews(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};

// --- Main news page component ---
const NewsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sectionLoaded, setSectionLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState<{ url: string; isImage: boolean }[]>([]);

  useEffect(() => {
    if (sectionLoaded) {
      const timer = setTimeout(() => setIsLoading(false), 500); // Small delay for animations
      return () => clearTimeout(timer);
    }
  }, [sectionLoaded]);

  const handleMediaClick = (news: NewsData) => {
    const mediaToDisplay: { url: string; isImage: boolean }[] = [];
    if (news.news_img) mediaToDisplay.push({ url: getFullMediaUrl(news.news_img)!, isImage: true });
    if (news.pdf_file) mediaToDisplay.push({ url: getFullMediaUrl(news.pdf_file)!, isImage: false });

    if (mediaToDisplay.length > 0) {
      setModalMedia(mediaToDisplay);
      setIsModalOpen(true);
    } else {
      toast.info("No media available for this news article.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>
      <header>
        <NewsHomeSlideshow />
      </header>
      <main className="flex-grow">
        <NewsSection setLoading={setSectionLoaded} onMediaClick={handleMediaClick} />
      </main>
      <footer>
        <Footer />
      </footer>
      <AnimatePresence>
        {isModalOpen && <NewsMediaModal media={modalMedia} onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default NewsPage;