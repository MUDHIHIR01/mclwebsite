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
  EnvelopeIcon
} from "@heroicons/react/24/outline";

// --- Interfaces --- (Unchanged)
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

// --- NEW: Component to hold the slider's CSS animation ---
// This keeps all code in this one file.
const SliderStyles = () => (
  <style jsx global>{`
    .scroller-container:hover .scroller-inner {
      animation-play-state: paused;
    }

    .scroller-inner {
      /* Slower animation for larger cards. Increase 120s to make it even slower. */
      animation: scroll 120s linear infinite;
    }

    @keyframes scroll {
      from {
        transform: translateX(0);
      }
      to {
        /* This moves the content exactly one half of its width, creating a seamless loop */
        transform: translateX(-50%);
      }
    }
  `}</style>
);


// --- Top Hero Slideshow --- (Unchanged)
const NewsHomeSlideshow: React.FC<{
  items: NewsData[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}> = ({ items, loading, error, onRetry }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideshowItems = items.filter(item => item.news_img);

  useEffect(() => {
    if (slideshowItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slideshowItems.length]);

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
          <span>Loading News...</span>
        </div>
      </div>
    );
  }

  if (error || slideshowItems.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] bg-gradient-to-br from-indigo-600 to-purple-700 p-6">
        <div className="text-rose-300 text-3xl font-bold mb-6 flex items-center space-x-3">
          <InformationCircleIcon className="w-8 h-8" />
          <span>{error ? "An Error Occurred" : "No Slideshow Content"}</span>
        </div>
        <p className="text-gray-200 mb-8 text-lg text-center">{error || "Content for the slideshow could not be loaded."}</p>
        {error && <button onClick={onRetry} className="inline-flex items-center px-8 py-3 text-white rounded-full hover:brightness-90 transition-all shadow-lg" style={{ backgroundColor: '#d12814' }}><ArrowPathIcon className="w-5 h-5 mr-2" /> Try Again</button>}
      </div>
    );
  }

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
      <AnimatePresence mode="wait">
        <motion.div key={currentSlide} variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
          <img 
            src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${slideshowItems[currentSlide].news_img!.replace(/^\//, "")}`} 
            alt={slideshowItems[currentSlide].category} 
            className="w-full h-full object-cover" 
            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error"; }} 
            loading="lazy" 
          />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col justify-center min-h-[80vh] px-4 sm:px-8">
        <div className="max-w-[50%] text-left ml-12">
          <motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight" style={{ color: "#d12814", textShadow: "0 4px 12px rgba(0,0,0,0.4)" }} variants={contentVariants} initial="hidden" animate="visible">
            {slideshowItems[currentSlide].category}
          </motion.h2>
          <motion.p className="text-lg sm:text-xl text-gray-100 mb-8 leading-relaxed font-semibold" variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            {slideshowItems[currentSlide].description || "No description available"}
          </motion.p>
          <motion.div variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            <button onClick={() => setCurrentSlide((p) => (p - 1 + slideshowItems.length) % slideshowItems.length)} className="inline-flex items-center p-3 text-white rounded-full transition-all shadow-lg hover:brightness-90" style={{ backgroundColor: '#d12814' }} aria-label="Previous slide"><ChevronLeftIcon className="w-6 h-6" /></button>
            <button onClick={() => setCurrentSlide((p) => (p + 1) % slideshowItems.length)} className="ml-4 inline-flex items-center p-3 text-white rounded-full transition-all shadow-lg hover:brightness-90" style={{ backgroundColor: '#d12814' }} aria-label="Next slide"><ChevronRightIcon className="w-6 h-6" /></button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Filter Section --- (Unchanged)
const FilterSection: React.FC<{
    month: string;
    year: string;
    onMonthChange: (month: string) => void;
    onYearChange: (year: string) => void;
}> = ({ month, year, onMonthChange, onYearChange }) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = Array.from({ length: new Date().getFullYear() - 2009 + 1 }, (_, i) => (new Date().getFullYear() - i).toString());

    return (
        <section className="bg-gray-100 dark:bg-gray-800 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                        <label htmlFor="month-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Month</label>
                        <select id="month-filter" value={month} onChange={(e) => onMonthChange(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-[#d12814] focus:border-[#d12814] sm:text-sm rounded-md">
                            <option value="">All Months</option>
                            {months.map((m, i) => (<option key={i} value={(i + 1).toString()}>{m}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Year</label>
                        <select id="year-filter" value={year} onChange={(e) => onYearChange(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-[#d12814] focus:border-[#d12814] sm:text-sm rounded-md">
                            <option value="">All Years</option>
                            {years.map(y => (<option key={y} value={y}>{y}</option>))}
                        </select>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Vertical News Card (for main grid) --- (Unchanged)
const NewsCard: React.FC<{ item: NewsData; onViewMore: (newsId: number) => void; }> = ({ item, onViewMore }) => {
    const [hasImageError, setHasImageError] = useState(false);
    const imageUrl = item.news_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.news_img.replace(/^\//, "")}` : null;
    const showPlaceholder = hasImageError || !imageUrl;

    return (
        <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-shadow duration-300 group"
            whileHover={{ y: -8, scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
            <div className="relative">
                <div className="h-48 w-full">
                    {showPlaceholder ? (
                        <div className="h-full w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <NewspaperIcon className="w-16 h-16 text-gray-300 dark:text-gray-500" />
                        </div>
                    ) : (
                        <img className="h-full w-full object-cover" src={imageUrl!} alt={item.category} onError={() => setHasImageError(true)} />
                    )}
                </div>
                <span className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#d12814' }}>News</span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold" style={{ color: '#d12814' }}>{item.category}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm flex-grow font-semibold">{item.description}</p>
                <div className="mt-6">
                    <button
                        onClick={() => onViewMore(item.news_id)}
                        className="w-full inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg transition-all duration-300 hover:brightness-90"
                        style={{ backgroundColor: '#d12814' }}
                    >
                        <span>View More</span>
                        <ChevronRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// --- News Grid Section --- (Unchanged)
const NewsSection: React.FC<{
    news: NewsData[];
    loading: boolean;
    onViewMore: (newsId: number) => void;
}> = ({ news, loading, onViewMore }) => {
    if (loading) {
        return <div className="text-center py-20"><ArrowPathIcon className="w-8 h-8 mx-auto animate-spin" style={{ color: '#d12814' }} /></div>;
    }

    if (news.length === 0) {
        return (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                <InformationCircleIcon className="w-12 h-12 mx-auto mb-4" />
                <p className="text-xl">No news found for the selected filters.</p>
            </div>
        );
    }

    return (
        <div className="mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {news.map(item => <NewsCard key={item.news_id} item={item} onViewMore={onViewMore} />)}
        </div>
    );
};


// --- XLarge Horizontal Card for the Infinite Slider --- (Unchanged)
const HorizontalSliderCard: React.FC<{ item: NewsData; onViewMore: (newsId: number) => void; }> = ({ item, onViewMore }) => {
    const imageUrl = item.news_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.news_img.replace(/^\//, "")}` : null;
    const [hasImageError, setHasImageError] = useState(false);

    return (
        <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full w-[90vw] md:w-[768px]">
            <div className="w-full md:w-2/5 flex-shrink-0">
                 {imageUrl && !hasImageError ? (
                    <img src={imageUrl} alt={item.category} className="w-full h-56 md:h-full object-cover" onError={() => setHasImageError(true)} />
                ) : (
                    <div className="w-full h-56 md:h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <NewspaperIcon className="w-16 h-16 text-gray-300 dark:text-gray-500" />
                    </div>
                )}
            </div>
            <div className="w-full md:w-3/5 p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-bold" style={{ color: '#d12814' }}>{item.category}</h3>
                <p className="mt-3 text-gray-700 dark:text-gray-300 text-base font-semibold line-clamp-4 flex-grow">
                    {item.description}
                </p>
                <div className="mt-5">
                    <button onClick={() => onViewMore(item.news_id)} className="inline-flex items-center text-sm font-semibold text-white px-5 py-2.5 rounded-md hover:brightness-90 transition-all" style={{ backgroundColor: '#0069b4' }}>
                        Read More
                        <ChevronRightIcon className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- REFINED: Infinite Horizontal Slider Section ---
const AdditionalNewsSlider: React.FC<{
    news: NewsData[];
    onViewMore: (newsId: number) => void;
}> = ({ news, onViewMore }) => {
    const sliderItems = news.filter(item => item.news_img);
    const extendedSliderItems = [...sliderItems, ...sliderItems];

    if (sliderItems.length < 1) {
        return null; 
    }

    return (
        <section className="w-full bg-gray-100 dark:bg-gray-800 py-16 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                     <h3 className="text-3xl font-extrabold sm:text-4xl" style={{ color: '#d12814' }}>
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


// --- Main News Page Component (Container) ---
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
      const response = await axiosInstance.get("/api/allNews");
      setAllNews(Array.isArray(response.data.news) ? response.data.news : []);
    } catch (err: any) {
      const message = "Failed to fetch news: " + (err.response?.data?.message || err.message);
      setError(message);
      toast.error("Error fetching news.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  useEffect(() => {
    let tempNews = allNews;
    if (selectedYear) {
        tempNews = tempNews.filter(item => new Date(item.created_at).getFullYear().toString() === selectedYear);
    }
    if (selectedMonth) {
        tempNews = tempNews.filter(item => (new Date(item.created_at).getMonth() + 1).toString() === selectedMonth);
    }
    setFilteredNews(tempNews);
  }, [allNews, selectedMonth, selectedYear]);

  const handleViewMore = useCallback(async (newsId: number) => {
    const newsItem = allNews.find(n => n.news_id === newsId);
    if (!newsItem) return;

    setSelectedNewsItem(newsItem);
    setIsModalOpen(true);
    
    try {
      const response = await axiosInstance.get("/api/subNews");
      const allSubNews = Array.isArray(response.data.sub_news) ? response.data.sub_news : [];
      setSubNews(allSubNews.filter((sub: SubNewsData) => sub.news_id === newsId));
    } catch (err) {
      toast.warn("Could not fetch news details.");
    }
  }, [allNews]);

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="w-full font-sans bg-gray-50 dark:bg-gray-900">
      {/* RENDER THE STYLES SO THE ANIMATION IS AVAILABLE */}
      <SliderStyles />
      
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <NewsHomeSlideshow items={allNews} loading={loading} error={error} onRetry={fetchNews} />
      <main>
        <FilterSection month={selectedMonth} year={selectedYear} onMonthChange={setSelectedMonth} onYearChange={setSelectedYear} />
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-12">
                <p className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: '#d12814' }}>
                  Latest News and Events
                </p>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-[#0069b4] dark:text-gray-400">
                  Stay up to date with our latest announcements, stories, and media.
                </p>
            </div>
            {/* The original grid of news cards */}
            <NewsSection news={filteredNews} loading={loading} onViewMore={handleViewMore} />
          </div>
        </section>

        {/* The new, separate, full-width infinite slider */}
        <AdditionalNewsSlider news={filteredNews} onViewMore={handleViewMore} />

      </main>
      <AnimatePresence>
        {isModalOpen && selectedNewsItem && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={closeModal}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6 sm:p-8">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold" style={{ color: '#d12814' }}>{selectedNewsItem.category}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XMarkIcon className="w-7 h-7" /></button>
                        </div>
                        {selectedNewsItem.pdf_file && (
                            <a href={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${selectedNewsItem.pdf_file.replace(/^\//, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 mb-4 text-white font-semibold rounded-lg transition-colors" style={{ backgroundColor: '#d12814',  }}>
                                <DocumentArrowDownIcon className="w-5 h-5"/> Download PDF
                            </a>
                        )}
                        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                           {subNews.length > 0 ? subNews.map(sub => (
                               <div key={sub.subnew_id} className="mb-6 last:mb-0">
                                   <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{sub.heading}</h3>
                                   <p className="text-gray-600 dark:text-gray-300 mb-4">{sub.description}</p>
                                   <div className="flex flex-wrap items-center gap-4">
                                       {sub.twitter_link && <a href={sub.twitter_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1DA1F2]"><FaTwitter size={20} /></a>}
                                       {sub.facebook_link && <a href={sub.facebook_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2]"><FaFacebookF size={20} /></a>}
                                       {sub.instagram_link && <a href={sub.instagram_link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E4405F]"><FaInstagram size={20} /></a>}
                                       {sub.email_url && <a href={`mailto:${sub.email_url}`} className="text-gray-400 hover:text-[#d12814]"><EnvelopeIcon className="w-5 h-5" /></a>}
                                   </div>
                               </div>
                           )) : <p className="text-center text-gray-500">No further details available for this news item.</p>}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default NewsPage;