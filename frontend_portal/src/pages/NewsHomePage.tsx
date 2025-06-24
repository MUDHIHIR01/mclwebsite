import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
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

// --- Component to hold the slider's CSS animation ---
const SliderStyles = () => (
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
);

// --- Top Hero Slideshow ---
const NewsHomeSlideshow: React.FC<{
  items: NewsData[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}> = ({ items, loading, error, onRetry }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideshowItems = items.filter((item) => item.news_img);

  useEffect(() => {
    if (slideshowItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slideshowItems.length]);

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

  if (error || slideshowItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <InformationCircleIcon className="w-10 h-10 text-[#0d7680]" />
          <h2 className="text-3xl font-bold text-white">{error ? "Failed to Load Content" : "No Content Available"}</h2>
        </div>
        <p className="text-lg text-gray-200">{error || "No slides were found for this section."}</p>
        {error && (
          <button
            onClick={onRetry}
            className="mt-6 flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />Retry
          </button>
        )}
      </div>
    );
  }

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imagePath = slideshowItems[currentSlide].news_img?.replace(/^\//, "");
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
            alt={slideshowItems[currentSlide].category}
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
            {slideshowItems[currentSlide].category}
          </motion.h2>
          <motion.p
            key={`p-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="text-xl md:text-2xl font-medium text-gray-100 mb-8"
          >
            {slideshowItems[currentSlide].description || "No description available"}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={() => setCurrentSlide((p) => (p - 1 + slideshowItems.length) % slideshowItems.length)}
              className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % slideshowItems.length)}
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

// --- Filter Section ---
const FilterSection: React.FC<{
  month: string;
  year: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
}> = ({ month, year, onMonthChange, onYearChange }) => {
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
  const years = Array.from({ length: new Date().getFullYear() - 2009 + 1 }, (_, i) => (new Date().getFullYear() - i).toString());

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
};

// --- Vertical News Card ---
const NewsCard: React.FC<{
  item: NewsData;
  onViewMore: (newsId: number) => void;
}> = ({ item, onViewMore }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = item.news_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.news_img.replace(/^\//, "")}` : null;
  const showPlaceholder = hasImageError || !imageUrl;

  return (
    <motion.div
      className="bg-[white] shadow-lg flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -12 }}
    >
      <div className="relative px-4 -mt-8 md:px-8 md:-mt-10">
        {showPlaceholder ? (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center shadow-md">
            <NewspaperIcon className="w-16 h-16 text-gray-300" />
          </div>
        ) : (
          <img
            className="w-full h-64 object-cover shadow-md"
            src={imageUrl!}
            alt={item.category}
            onError={() => setHasImageError(true)}
          />
        )}
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
          News
        </span>
      </div>
      <div className="p-8 flex flex-col flex-grow text-black">
        <h3 className="uppercase text-xl sm:text-2xl font-bold relative pb-4 mb-4 text-[#33302d]">
          {item.category}
          <span className="absolute bottom-0 left-0 h-1 w-1/4 bg-[#33302d]"></span>
        </h3>
        <p className="text-gray-700 text-base font-medium flex-grow line-clamp-4">{item.description}</p>
        <button
          onClick={() => onViewMore(item.news_id)}
          className="mt-6 inline-flex items-center justify-center px-4 py-2 text-[#0d7680] font-semibold rounded-full border border-[#0d7680] hover:bg-[#0d7680] hover:text-white transition"
        >
          View More
          <ChevronRightIcon className="w-5 h-5 ml-2" />
        </button>
      </div>
    </motion.div>
  );
};

// --- News Grid Section ---
const NewsSection: React.FC<{
  news: NewsData[];
  loading: boolean;
  onViewMore: (newsId: number) => void;
}> = ({ news, loading, onViewMore }) => {
  if (loading) {
    return (
      <div className="w-full py-20 text-center">
        <ArrowPathIcon className="w-8 h-8 mx-auto text-[#0d7680] animate-spin" />
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
      {news.map((item) => (
        <NewsCard key={item.news_id} item={item} onViewMore={onViewMore} />
      ))}
    </div>
  );
};

// --- Horizontal Card for Infinite Slider ---
const HorizontalSliderCard: React.FC<{
  item: NewsData;
  onViewMore: (newsId: number) => void;
}> = ({ item, onViewMore }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = item.news_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.news_img.replace(/^\//, "")}` : null;
  const showPlaceholder = hasImageError || !imageUrl;

  return (
    <div className="flex flex-col md:flex-row bg-[white] shadow-lg rounded-lg overflow-hidden h-full w-[90vw] md:w-[768px]">
      <div className="w-full md:w-2/5 flex-shrink-0">
        {showPlaceholder ? (
          <div className="w-full h-56 md:h-full bg-gray-100 flex items-center justify-center">
            <NewspaperIcon className="w-16 h-16 text-gray-300" />
          </div>
        ) : (
          <img
            src={imageUrl!}
            alt={item.category}
            className="w-full h-56 md:h-full object-cover"
            onError={() => setHasImageError(true)}
          />
        )}
      </div>
      <div className="w-full md:w-3/5 p-6 flex flex-col justify-center">
        <h3 className="text-xl font-bold text-[#33302d]">{item.category}</h3>
        <p className="mt-3 text-gray-700 text-base line-clamp-4 flex-grow">{item.description}</p>
        <div className="mt-5">
          <button
            onClick={() => onViewMore(item.news_id)}
            className="inline-flex items-center text-sm font-semibold text-[#0d7680] px-5 py-2.5 rounded-full border border-[#0d7680] hover:bg-[#0d7680] hover:text-white transition"
          >
            Read More
            <ChevronRightIcon className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Infinite Horizontal Slider Section ---
const AdditionalNewsSlider: React.FC<{
  news: NewsData[];
  onViewMore: (newsId: number) => void;
}> = ({ news, onViewMore }) => {
  const sliderItems = news.filter((item) => item.news_img);
  const extendedSliderItems = [...sliderItems, ...sliderItems];

  if (sliderItems.length < 1) {
    return null;
  }

  return (
    <section className="w-full bg-gray-100 py-16 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-[#ed1c24] inline-flex items-center">
            <NewspaperIcon className="w-9 h-9 mr-3" />
            Explore More News Highlights
          </h3>
        </div>
      </div>
      <div
        className="w-full overflow-hidden relative scroller-container"
        style={{ maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" }}
      >
        <div className="flex w-max">
          <div className="flex scroller-inner">
            {extendedSliderItems.map((item, index) => (
              <div key={`slide-${index}`} className="mx-8">
                <HorizontalSliderCard item={item} onViewMore={onViewMore} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Main News Page Component ---
const NewsPage: React.FC = () => {
  const [allNews, setAllNews] = useState<NewsData[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsData | null>(null);
  const [subNews, setSubNews] = useState<SubNewsData[]>([]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ news: NewsData[] }>("/api/allNews");
      setAllNews(Array.isArray(response.data.news) ? response.data.news : []);
    } catch (err: any) {
      setError("Could not fetch news data.");
      toast.error("Could not fetch news data.");
    } finally {
      setLoading(false);
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
      setIsModalOpen(true);

      try {
        const response = await axiosInstance.get<{ sub_news: SubNewsData[] }>("/api/subNews");
        const allSubNews = Array.isArray(response.data.sub_news) ? response.data.sub_news : [];
        setSubNews(allSubNews.filter((sub) => sub.news_id === newsId));
      } catch (err) {
        toast.warn("Could not fetch news details.");
      }
    },
    [allNews]
  );

  const closeModal = () => setIsModalOpen(false);

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
      />
      <header>
        <NewsHomeSlideshow items={allNews} loading={loading} error={error} onRetry={fetchNews} />
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
            <NewsSection news={filteredNews} loading={loading} onViewMore={handleViewMore} />
          </div>
        </section>
        <AdditionalNewsSlider news={filteredNews} onViewMore={handleViewMore} />
      </main>
      <AnimatePresence>
        {isModalOpen && selectedNewsItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
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
                  <h2 className="text-2xl font-bold text-[#33302d]">{selectedNewsItem.category}</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                {selectedNewsItem.pdf_file && (
                  <a
                    href={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${selectedNewsItem.pdf_file.replace(/^\//, "")}`}
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
                            src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${sub.img_url.replace(/^\//, "")}`}
                            alt={sub.heading}
                            className="w-full h-64 object-cover rounded-lg mb-4"
                            onError={(e) =>
                              (e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Error")
                            }
                          />
                        )}
                        <h3 className="text-xl font-bold text-[#33302d] mb-2">{sub.heading}</h3>
                        <p className="text-gray-700 mb-4">{sub.description}</p>
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
        )}
      </AnimatePresence>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default NewsPage;
