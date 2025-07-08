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
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

// --- INTERFACES ---
interface NewsHomeData {
  news_home_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
}

interface NewsData {
  news_id: number;
  category: string;
  description: string | null;
  news_img: string | null;
  pdf_file: string | null;
  created_at: string;
}

// --- UTILITY FUNCTIONS ---
const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const getFullMediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${baseURL}/${path.replace(/^\//, "")}`;
};

// --- LOADER COMPONENT ---
const Loader: React.FC = () => {
  const loaderVariants: Variants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A51A1] z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div variants={loaderVariants} animate="animate" className="mb-4">
        <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
      </motion.div>
      <motion.h2 variants={loaderVariants} animate="animate" className="text-2xl font-bold text-white">
        Loading News...
      </motion.h2>
    </motion.div>
  );
};

// --- NEWS HOME SLIDESHOW ---
const NewsHomeSlideshow: React.FC = () => {
  const [data, setData] = useState<NewsHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchNewsHome = useCallback(async () => {
    try {
      const response = await axiosInstance.get<NewsHomeData[]>("/api/news-home-slider");
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch news sliders:", err);
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

  if (data.length === 0) return null;

  const imagePath = getFullMediaUrl(data[currentSlide].home_img);

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          <img
            src={imagePath || "https://via.placeholder.com/1200x600?text=Image+Missing"}
            alt={data[currentSlide].heading}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error")}
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
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            {data[currentSlide].heading}
          </motion.h2>
          <motion.p
            key={`p-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="text-xl text-gray-200 mb-8"
          >
            {data[currentSlide].description || "The latest updates from our team."}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)}
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-[#0A51A1] transition"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % data.length)}
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-[#0A51A1] transition"
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

// --- INDIVIDUAL NEWS CARD (SMALL) ---
const NewsCard: React.FC<{ news: NewsData; onCardClick: (news: NewsData) => void }> = ({ news, onCardClick }) => {
  const mediaUrl = getFullMediaUrl(news.news_img);

  return (
    <motion.div
      layoutId={`news-card-${news.news_id}`}
      className="bg-white shadow-lg flex flex-col rounded-xl overflow-hidden cursor-pointer"
      whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={() => onCardClick(news)}
    >
      <div className="relative h-56">
        <img
          className="w-full h-full object-cover"
          src={mediaUrl || "https://via.placeholder.com/400x225/003459/ffffff?text=News"}
          alt={news.category}
          loading="lazy"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-sm font-semibold text-[#0d7680] mb-2">{formatDate(news.created_at)}</p>
        <h3 className="text-xl font-bold text-[#003459] mb-3 line-clamp-2">{news.category}</h3>
        <p className="text-gray-600 text-base flex-grow line-clamp-3">
          {news.description || "Click to read more."}
        </p>
      </div>
    </motion.div>
  );
};

// --- UNIFIED EXPANDED NEWS CARD/MODAL ---
const ExpandedNewsCard: React.FC<{ news: NewsData; onClose: () => void }> = ({ news, onClose }) => {
  const mediaUrl = getFullMediaUrl(news.news_img);
  const pdfUrl = getFullMediaUrl(news.pdf_file);
  const fullDescription = (news.description || "No description available.")
    .split(/\n\s*\n/)
    .map((p, i) => <p key={i} className="mb-4">{p}</p>);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        layoutId={`news-card-${news.news_id}`}
        className="relative bg-white shadow-2xl rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {mediaUrl && (
          <div className="h-64 md:h-80 w-full flex-shrink-0">
            <img
              className="w-full h-full object-cover rounded-t-xl"
              src={mediaUrl}
              alt={news.category}
            />
          </div>
        )}
        <div className="p-6 lg:p-8 flex-grow overflow-y-auto">
          <p className="text-sm font-semibold text-[#0d7680] mb-2">{formatDate(news.created_at)}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-[#003459] mb-4">{news.category}</h3>
          <div className="text-gray-700 text-base leading-relaxed">{fullDescription}</div>
          {pdfUrl && (
            <div className="mt-6">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#ed1c24] text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                View/Download PDF
              </a>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-[#ed1c24] transition-transform hover:scale-110"
          aria-label="Close"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </motion.div>
    </div>
  );
};

// --- NEWS SECTION (PRESENTATIONAL) ---
const NewsSection: React.FC<{
  news: NewsData[];
  onSelectNews: (news: NewsData) => void;
  filters: {
    month: string;
    setMonth: (m: string) => void;
    year: string;
    setYear: (y: string) => void;
  };
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ news, onSelectNews, filters, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage }) => {
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => (currentYear - i).toString());
  const totalPages = Math.ceil(news.length / itemsPerPage);
  const paginatedNews = news.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section className="py-16 bg-[#f0f2f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003459]">Our Newsroom</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest stories and achievements from our company.
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md mb-12 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <select
            value={filters.year}
            onChange={(e) => filters.setYear(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={filters.month}
            onChange={(e) => filters.setMonth(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Months</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <button
            onClick={() => {
              filters.setYear("");
              filters.setMonth("");
              setCurrentPage(1);
            }}
            className="w-full p-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>

        {paginatedNews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedNews.map((item) => (
                <NewsCard key={item.news_id} news={item} onCardClick={onSelectNews} />
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, news.length)} of{" "}
                {news.length} news
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#003459] text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-md ${
                        page === currentPage ? "bg-[#0A51A1] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#003459] text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <CalendarDaysIcon className="w-16 h-16 mx-auto text-gray-600" />
            <h3 className="mt-4 text-xl font-bold text-[#003459]">No News Found</h3>
            <p className="text-gray-500 mt-2">No articles match your current filters. Try clearing them.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// --- MAIN NEWS PAGE COMPONENT ---
const NewsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allNews, setAllNews] = useState<NewsData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsData | null>(null);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ news: NewsData[] }>("/api/allNews");
      const sortedNews = (response.data.news || []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAllNews(sortedNews);
    } catch (err) {
      setError("Failed to fetch news data.");
      toast.error("Error fetching news data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filteredNews = allNews.filter((item) => {
    if (year && new Date(item.created_at).getFullYear().toString() !== year) return false;
    if (month && (new Date(item.created_at).getMonth() + 1).toString() !== month) return false;
    return true;
  });

  if (error && !isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-4">
        <InformationCircleIcon className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">An Error Occurred</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={fetchNews}
          className="mt-6 px-6 py-2 bg-[#0A51A1] text-white font-semibold rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>

      {!isLoading && (
        <>
          <header>
            <NewsHomeSlideshow />
          </header>
          <main className="flex-grow">
            <NewsSection
              news={filteredNews}
              onSelectNews={setSelectedNews}
              filters={{ month, setMonth, year, setYear }}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
            />
          </main>
          <footer>
            <Footer />
          </footer>
          <AnimatePresence>
            {selectedNews && <ExpandedNewsCard news={selectedNews} onClose={() => setSelectedNews(null)} />}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default NewsPage;