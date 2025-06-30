import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState, useEffect, useCallback, memo } from "react";
import axiosInstance from "../axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";
import { FaTwitter, FaFacebookF, FaInstagram } from "react-icons/fa";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  NewspaperIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

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
  description: string;
  news_img: string | null;
  pdf_file: string | null;
  created_at: string;
}

interface SubNewsData {
  subnew_id: number;
  news_id: number;
  img_url: string | null;
  heading: string;
  description: string;
  twitter_link: string | null;
  facebook_link: string | null;
  instagram_link: string | null;
  email_url: string | null;
}

// --- Utility Functions ---
/** Formats a date string to 'MMM DD, YYYY' format */
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

/** Splits description into words, handling null/undefined safely */
const splitDescriptionToWords = (desc: string): string[] => {
  if (!desc || typeof desc !== "string") return [];
  return desc.split(/\s+/).filter((word) => word.trim());
};

/** Joins words up to a limit or all if expanded */
const limitWords = (words: string[], limit: number, isExpanded: boolean): string => {
  if (isExpanded) return words.join(" ");
  return words.slice(0, limit).join(" ") + (words.length > limit ? "..." : "");
};

// --- Landing Loader ---
/** Displays a full-screen loading animation during initial page load */
const LandingLoader = memo(() => {
  const loaderVariants: Variants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0d7680] to-gray-800 z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <motion.div variants={loaderVariants} animate="animate" className="mb-4">
        <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
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
});

// --- Slider Styles ---
/** CSS for horizontal scrolling animation in the featured news slider */
const SliderStyles = memo(() => (
  <style>{`
    .scroller-container:hover .scroller-inner {
      animation-play-state: paused;
    }
    .scroller-inner {
      animation: scroll 120s linear infinite;
    }
    @keyframes scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
  `}</style>
));

// --- News Home Slideshow ---
/** Displays a full-width slideshow for news homepage banners */
const NewsHomeSlideshow = memo(() => {
  const [items, setItems] = useState<NewsHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewsHome = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<NewsHomeData[]>("/api/news-home-slider");
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError("Failed to fetch news sliders.");
      toast.error("Error fetching news sliders.", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsHome();
  }, [fetchNewsHome]);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  const loaderVariants: Variants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <motion.div variants={loaderVariants} animate="animate" className="flex items-center gap-3 mb-6">
          <ArrowPathIcon className="w-10 h-10 text-[#0d7680] animate-spin" />
          <h2 className="text-3xl font-bold text-white">Loading...</h2>
        </motion.div>
        <motion.p variants={loaderVariants} animate="animate" className="text-lg text-gray-200">
          Fetching slider content...
        </motion.p>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <InformationCircleIcon className="w-10 h-10 text-[#0d7680]" />
          <h2 className="text-3xl font-bold text-white">{error ? "Failed to Load Content" : "No Content Available"}</h2>
        </div>
        <p className="text-lg text-gray-200">{error || "No slides were found for this section."}</p>
        {error && (
          <button
            onClick={fetchNewsHome}
            className="mt-6 flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />Retry
          </button>
        )}
      </div>
    );
  }

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imagePath = items[currentSlide].home_img?.replace(/^\//, "");
  const imageSrc = imagePath ? `${baseURL}/${imagePath}` : "https://via.placeholder.com/1200x600?text=Image+Missing";

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gray-800">
      <AnimatePresence mode="wait">
        <motion.div
          key={items[currentSlide].news_home_id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          <img
            src={imageSrc}
            alt={items[currentSlide].heading}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error")}
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col justify-center min-h-[80vh] max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-xl">
          <motion.h2
            key={`h2-${items[currentSlide].news_home_id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-bold text-[#fff1e5] mb-4"
          >
            {items[currentSlide].heading}
          </motion.h2>
          <motion.p
            key={`p-${items[currentSlide].news_home_id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="text-xl md:text-2xl font-medium text-gray-100 mb-8"
          >
            {items[currentSlide].description || "No description available"}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={() => setCurrentSlide((p) => (p - 1 + items.length) % items.length)}
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % items.length)}
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

// --- Filter Section ---
/** Allows filtering news by month and year */
const FilterSection = memo<{
  month: string;
  year: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
}>(({ month, year, onMonthChange, onYearChange }) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from({ length: new Date().getFullYear() - 2009 + 1 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  return (
    <section className="bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700">
              Filter by Month
            </label>
            <select
              id="month-filter"
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              className="mt-2 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-[#0d7680] focus:border-[#0d7680] sm:text-sm rounded-full"
            >
              <option value="">All Months</option>
              {months.map((m, i) => (
                <option key={m} value={(i + 1).toString()}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700">
              Filter by Year
            </label>
            <select
              id="year-filter"
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
              className="mt-2 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-[#0d7680] focus:border-[#0d7680] sm:text-sm rounded-full"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
});

// --- Vertical News Card ---
/** Displays a news item in a vertical card layout with consistent height and word limit */
const NewsCard = memo<{
  item: NewsData;
  onViewMore: (newsId: number) => void;
  onImageClick: (newsId: number) => void;
}>(({ item, onViewMore, onImageClick }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const imageUrl = item.news_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.news_img.replace(/^\//, "")}` : null;
  const showPlaceholder = hasImageError || !imageUrl;
  const words = splitDescriptionToWords(item.description);
  const maxWords = 50;
  const isLongDescription = words.length > maxWords;

  return (
    <motion.div
      className="bg-white shadow-lg flex flex-col min-w-[400px] rounded-lg min-h-[450px]"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -12 }}
    >
      <div className="relative px-4 -mt-8 md:px-8 md:-mt-10">
        {showPlaceholder ? (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center shadow-md rounded-t-lg">
            <NewspaperIcon className="w-16 h-16 text-gray-300" />
          </div>
        ) : (
          <img
            className="w-full h-64 object-cover shadow-md rounded-t-lg cursor-pointer"
            src={imageUrl!}
            alt={item.category}
            onError={() => setHasImageError(true)}
            onClick={() => onImageClick(item.news_id)}
            loading="lazy"
          />
        )}
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
          News
        </span>
      </div>
      <div className="p-8 flex flex-col flex-grow text-black">
        <h3 className="uppercase text-sm sm:text-lg font-bold relative pb-4 mb-2 text-[#003459]">
          {item.category}
          <span className="absolute bottom-0 left-0 h-1 w-1/4 bg-[#33302d]"></span>
        </h3>
        <p className="text-[#ed1c24] font-bold text-sm mb-2">{formatDate(item.created_at)}</p>
        <AnimatePresence>
          <motion.p
            key={`desc-${item.news_id}-${isExpanded}`}
            initial={{ height: isLongDescription && !isExpanded ? "4.5rem" : "auto", opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: "4.5rem", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`text-gray-700 text-base font-medium flex-grow ${isLongDescription && !isExpanded ? "line-clamp-3" : ""}`}
          >
            {limitWords(words, maxWords, isExpanded)}
          </motion.p>
        </AnimatePresence>
        {isLongDescription && (
          <span
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 inline-flex items-center text-sm font-semibold text-[#ed1c24] hover:underline cursor-pointer"
          >
            {isExpanded ? "Read Less" : "Read More"}
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </span>
        )}
        <button
          onClick={() => onViewMore(item.news_id)}
          className="mt-6 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#ed1c24] rounded-full border border-[#ed1c24] hover:bg-[#0d7680] hover:text-white transition"
        >
          View More
          <ChevronRightIcon className="w-4 h-4 ml-2" />
        </button>
      </div>
    </motion.div>
  );
});

// --- Horizontal Slider Card ---
/** Displays a news item in a horizontal card layout for the featured slider */
const HorizontalSliderCard = memo<{
  item: NewsData;
  onViewMore: (newsId: number) => void;
  onImageClick: (newsId: number) => void;
}>(({ item, onViewMore, onImageClick }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const imageUrl = item.news_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.news_img.replace(/^\//, "")}` : null;
  const showPlaceholder = hasImageError || !imageUrl;
  const words = splitDescriptionToWords(item.description);
  const maxWords = 50;
  const isLongDescription = words.length > maxWords;

  return (
    <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden min-w-[400px] max-w-[768px] min-h-[300px]">
      <div className="w-full md:w-2/5 flex-shrink-0">
        {showPlaceholder ? (
          <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
            <NewspaperIcon className="w-16 h-16 text-gray-300" />
          </div>
        ) : (
          <img
            src={imageUrl!}
            alt={item.category}
            className="w-full h-56 object-cover cursor-pointer"
            onError={() => setHasImageError(true)}
            onClick={() => onImageClick(item.news_id)}
            loading="lazy"
          />
        )}
      </div>
      <div className="w-full md:w-3/5 p-6 flex flex-col justify-center">
        <h3 className="text-sm font-bold text-[#003459]">{item.category}</h3>
        <p className="text-[#ed1c24] font-bold text-sm mb-2">{formatDate(item.created_at)}</p>
        <AnimatePresence>
          <motion.p
            key={`desc-${item.news_id}-${isExpanded}`}
            initial={{ height: isLongDescription && !isExpanded ? "4.5rem" : "auto", opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: "4.5rem", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`mt-3 text-gray-700 text-base font-medium ${isLongDescription && !isExpanded ? "line-clamp-3" : ""}`}
          >
            {limitWords(words, maxWords, isExpanded)}
          </motion.p>
        </AnimatePresence>
        {isLongDescription && (
          <span
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 inline-flex items-center text-sm font-semibold text-[#ed1c24] hover:underline cursor-pointer"
          >
            {isExpanded ? "Read Less" : "Read More"}
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </span>
        )}
        <button
          onClick={() => onViewMore(item.news_id)}
          className="mt-6 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-[#ed1c24] rounded-full border border-[#ed1c24] hover:bg-[#0d7680] hover:text-white transition"
        >
          View More
          <ChevronRightIcon className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
});

// --- Horizontal News Slider ---
/** Displays a horizontal scrolling slider of featured news items */
const HorizontalNewsSlider = memo<{
  news: NewsData[];
  loading: boolean;
  onViewMore: (newsId: number) => void;
  onImageClick: (newsId: number) => void;
}>(({ news, loading, onViewMore, onImageClick }) => {
  const loaderVariants: Variants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
    },
  };

  if (loading) {
    return (
      <div className="w-full py-20 text-center">
        <motion.div variants={loaderVariants} animate="animate">
          <ArrowPathIcon className="w-8 h-8 mx-auto text-[#0d7680] animate-spin" />
        </motion.div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800">No Content Available</h3>
        <p className="mt-2 text-gray-600">No news found for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="scroller-container overflow-x-auto whitespace-nowrap py-4">
      <div className="scroller-inner flex gap-6">
        {news
          .filter((item) => item.news_id != null)
          .map((item, index) => (
            <HorizontalSliderCard
              key={item.news_id ?? `fallback-${index}`}
              item={item}
              onViewMore={onViewMore}
              onImageClick={onImageClick}
            />
          ))}
        {/* Duplicate items for infinite scroll effect */}
        {news
          .filter((item) => item.news_id != null)
          .map((item, index) => (
            <HorizontalSliderCard
              key={`duplicate-${item.news_id ?? `fallback-${index}`}`}
              item={item}
              onViewMore={onViewMore}
              onImageClick={onImageClick}
            />
          ))}
      </div>
    </div>
  );
});

// --- News Section ---
/** Displays a grid of news items using NewsCard components */
const NewsSection = memo<{
  news: NewsData[];
  loading: boolean;
  onViewMore: (newsId: number) => void;
  onImageClick: (newsId: number) => void;
}>(({ news, loading, onViewMore, onImageClick }) => {
  const loaderVariants: Variants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
    },
  };

  if (loading) {
    return (
      <div className="w-full py-20 text-center">
        <motion.div variants={loaderVariants} animate="animate">
          <ArrowPathIcon className="w-8 h-8 mx-auto text-[#0d7680] animate-spin" />
        </motion.div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800">No Content Available</h3>
        <p className="mt-2 text-gray-600">No news found for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 items-start">
      {news
        .filter((item) => item.news_id != null)
        .map((item, index) => (
          <NewsCard
            key={item.news_id ?? `fallback-${index}`}
            item={item}
            onViewMore={onViewMore}
            onImageClick={onImageClick}
          />
        ))}
    </div>
  );
});

// --- Image Gallery Modal ---
/** Displays a modal for viewing news images with navigation */
const ImageGalleryModal = memo<{
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  newsId: number;
}>(({ isOpen, onClose, images, newsId }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const handleNextImage = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevImage = useCallback(() => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  if (!isOpen || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
          <div className="p-6">
            <img
              src={images[currentImage]}
              alt={`News image ${currentImage + 1}`}
              className="w-full max-h-[70vh] object-contain rounded-lg"
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Error")}
              loading="lazy"
            />
            {images.length > 1 && (
              <div className="flex justify-between mt-4">
                <button
                  onClick={handlePrevImage}
                  className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <span className="text-gray-600 font-semibold">
                  {currentImage + 1} / {images.length}
                </span>
                <button
                  onClick={handleNextImage}
                  className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

// --- News Modal ---
/** Displays detailed news content in a modal */
const NewsModal = memo<{
  isOpen: boolean;
  onClose: () => void;
  newsItem: NewsData | null;
  subNews: SubNewsData[];
  onImageClick: (newsId: number) => void;
}>(({ isOpen, onClose, newsItem, subNews, onImageClick }) => {
  if (!isOpen || !newsItem) return null;

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const maxWords = 50;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-[#33302d]">{newsItem.category}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
          </div>
          {newsItem.pdf_file && (
            <a
              href={`${baseURL}/${newsItem.pdf_file.replace(/^\//, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-[#0d7680] font-semibold rounded-full border border-[#0d7680] hover:bg-[#0d7680] hover:text-white transition"
            >
              <DocumentArrowDownIcon className="w-5 h-5" /> Download PDF
            </a>
          )}
          <div className="mt-4 border-t border-gray-200 pt-4">
            {subNews.length > 0 ? (
              subNews.map((sub) => (
                <div key={sub.subnew_id} className="mb-6 last:mb-0">
                  {sub.img_url && (
                    <img
                      src={`${baseURL}/${sub.img_url.replace(/^\//, "")}`}
                      alt={sub.heading}
                      className="w-full h-64 object-cover rounded-lg mb-4 cursor-pointer"
                      onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Error")}
                      onClick={() => onImageClick(newsItem.news_id)}
                      loading="lazy"
                    />
                  )}
                  <h3 className="text-xl font-bold text-[#33302d] mb-2">{sub.heading}</h3>
                  <p className="text-gray-700 mb-4">
                    {limitWords(splitDescriptionToWords(sub.description), maxWords, true)}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    {sub.twitter_link && (
                      <a
                        href={sub.twitter_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#0d7680]"
                        aria-label="Twitter"
                      >
                        <FaTwitter size={20} />
                      </a>
                    )}
                    {sub.facebook_link && (
                      <a
                        href={sub.facebook_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#0d7680]"
                        aria-label="Facebook"
                      >
                        <FaFacebookF size={20} />
                      </a>
                    )}
                    {sub.instagram_link && (
                      <a
                        href={sub.instagram_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#0d7680]"
                        aria-label="Instagram"
                      >
                        <FaInstagram size={20} />
                      </a>
                    )}
                    {sub.email_url && (
                      <a
                        href={`mailto:${sub.email_url}`}
                        className="text-gray-400 hover:text-[#0d7680]"
                        aria-label="Email"
                      >
                        <EnvelopeIcon className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No further details available for this news item.</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});

// --- Main News Page ---
/** Main component for the news page, orchestrating all sections and modals */
const NewsPage: React.FC = () => {
  const [allNews, setAllNews] = useState<NewsData[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsData | null>(null);
  const [subNews, setSubNews] = useState<SubNewsData[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ news: NewsData[] }>("/api/allNews");
      const sortedNews = Array.isArray(response.data.news)
        ? response.data.news
            .filter((item) => item.news_id != null)
            .sort((a, b) => a.news_id - b.news_id)
        : [];
      setAllNews(sortedNews);
    } catch {
      setError("Could not fetch news data.");
      toast.error("Could not fetch news data.", { position: "top-right" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    let tempNews = allNews;
    if (selectedYear) {
      tempNews = tempNews.filter((item) => new Date(item.created_at).getFullYear().toString() === selectedYear);
    }
    if (selectedMonth) {
      tempNews = tempNews.filter(
        (item) => (new Date(item.created_at).getMonth() + 1).toString() === selectedMonth
      );
    }
    setFilteredNews(tempNews);
  }, [allNews, selectedMonth, selectedYear]);

  const handleViewMore = useCallback(
    async (newsId: number) => {
      const newsItem = allNews.find((n) => n.news_id === newsId);
      if (!newsItem) return;

      setSelectedNewsItem(newsItem);
      setIsNewsModalOpen(true);

      try {
        const response = await axiosInstance.get<{ sub_news: SubNewsData[] }>("/api/subNews");
        const allSubNews = Array.isArray(response.data.sub_news) ? response.data.sub_news : [];
        setSubNews(allSubNews.filter((sub) => sub.news_id === newsId));
      } catch {
        toast.warn("Could not fetch news details.", { position: "top-right" });
      }
    },
    [allNews]
  );

  const handleImageClick = useCallback(
    async (newsId: number) => {
      const newsItem = allNews.find((n) => n.news_id === newsId);
      if (!newsItem) return;

      toast.info(`Image for news ID ${newsId} viewed!`, { position: "top-right" });

      try {
        const response = await axiosInstance.get<{ sub_news: SubNewsData[] }>("/api/subNews");
        const allSubNews = Array.isArray(response.data.sub_news) ? response.data.sub_news : [];
        const subNewsImages = allSubNews
          .filter((sub) => sub.news_id === newsId && sub.img_url)
          .map((sub) => `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${sub.img_url!.replace(/^\//, "")}`);

        const newsImage = newsItem.news_img
          ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${newsItem.news_img.replace(/^\//, "")}`
          : null;

        const images = newsImage ? [newsImage, ...subNewsImages] : subNewsImages;

        setSelectedImages(images);
        setIsImageModalOpen(true);
      } catch {
        toast.warn("Could not fetch images.", { position: "top-right" });
      }
    },
    [allNews]
  );

  const closeNewsModal = useCallback(() => {
    setIsNewsModalOpen(false);
    setSubNews([]);
  }, []);

  const closeImageModal = useCallback(() => {
    setIsImageModalOpen(false);
    setSelectedImages([]);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <SliderStyles />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={3}
      />
      <AnimatePresence>{isLoading && <LandingLoader />}</AnimatePresence>
      <header>
        <NewsHomeSlideshow />
      </header>
      <main className="flex-grow">
        <FilterSection
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#ed1c24] inline-flex items-center">
                <NewspaperIcon className="w-9 h-9 mr-3" />
                Latest News and Events
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Stay up to date with our latest announcements, stories, and media.
              </p>
            </div>
            <NewsSection
              news={filteredNews}
              loading={isLoading}
              onViewMore={handleViewMore}
              onImageClick={handleImageClick}
            />
          </div>
        </section>
        <section className="py-16 bg-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#ed1c24] inline-flex items-center">
                <NewspaperIcon className="w-9 h-9 mr-3" />
                Featured News
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our highlighted stories in a scrolling view.
              </p>
            </div>
            <HorizontalNewsSlider
              news={filteredNews.slice(0, 5)}
              loading={isLoading}
              onViewMore={handleViewMore}
              onImageClick={handleImageClick}
            />
          </div>
        </section>
      </main>
      <AnimatePresence>
        <NewsModal
          isOpen={isNewsModalOpen}
          onClose={closeNewsModal}
          newsItem={selectedNewsItem}
          subNews={subNews}
          onImageClick={handleImageClick}
        />
        <ImageGalleryModal
          isOpen={isImageModalOpen}
          onClose={closeImageModal}
          images={selectedImages}
          newsId={selectedNewsItem?.news_id || 0}
        />
      </AnimatePresence>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default NewsPage;
