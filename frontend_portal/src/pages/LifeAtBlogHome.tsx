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
  SparklesIcon,
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  LinkIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

// --- INTERFACES ---
interface BlogHomeData {
  blog_home_id: number;
  heading: string;
  description: string;
  home_img: string;
  created_at: string;
  updated_at: string;
}

interface BlogData {
  blog_id: number;
  heading: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface SubBlog {
  sublog_id: number;
  heading: string;
  video_file: string | null;
  blog_id: number;
  image_file: string | null;
  url_link: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  blog: BlogData | null;
}

interface SubBlogModalProps {
  blogId: number;
  blogTitle: string;
  onClose: () => void;
}

// --- REFINED: Blog Home Slideshow ---
const BlogHomeSlideshow: React.FC = () => {
  const [data, setData] = useState<BlogHomeData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogHomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<BlogHomeData[]>("/api/blog-home-sliders/public");
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      const message = "Failed to fetch blog sliders: " + (err.response?.data?.message || err.message);
      setError(message);
      toast.error("Error fetching blog sliders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogHomes();
  }, [fetchBlogHomes]);

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
          <span>{data.length === 0 ? "No Content Found" : "An Error Occurred"}</span>
        </div>
        <p className="text-gray-200 mb-8 text-lg text-center">{error || "Blog content could not be loaded."}</p>
        {error && (
          <button
            onClick={fetchBlogHomes}
            className="inline-flex items-center px-8 py-3 text-white rounded-full hover:brightness-90 transition-all shadow-lg"
            style={{ backgroundColor: "#d12814" }}
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" /> Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
      <AnimatePresence mode="wait">
        <motion.div key={currentSlide} variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
          <img
            src={data[currentSlide].home_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${data[currentSlide].home_img.replace(/^\//, "")}` : "https://via.placeholder.com/1200x600?text=Image+Missing"}
            alt={data[currentSlide].heading}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error";
            }}
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col justify-center min-h-[80vh] px-4 sm:px-8">
        <div className="max-w-[50%] text-left ml-12">
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight"
            style={{ color: "#d12814", textShadow: "0 4px 12px rgba(0,0,0,0.4)" }}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {data[currentSlide].heading}
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl text-gray-100 mb-8 leading-relaxed font-semibold"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            {data[currentSlide].description || "No description available"}
          </motion.p>
          <motion.div variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            <button
              onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)}
              className="inline-flex items-center p-3 text-white rounded-full transition-all duration-300 shadow-lg hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d12814]"
              style={{ backgroundColor: "#d12814" }}
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % data.length)}
              className="ml-4 inline-flex items-center p-3 text-white rounded-full transition-all duration-300 shadow-lg hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d12814]"
              style={{ backgroundColor: "#d12814" }}
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

// --- REFINED: Sub-Blog Modal Component ---
const SubBlogModal: React.FC<SubBlogModalProps> = ({ blogId, blogTitle, onClose }) => {
  const [subBlogs, setSubBlogs] = useState<SubBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedSubBlogs, setSelectedSubBlogs] = useState<number[]>([]);

  const fetchSubBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ sub_blogs: SubBlog[] }>("/api/sub-blogs/all");
      const allSubBlogs = response.data.sub_blogs || [];
      const filteredBlogs = allSubBlogs.filter(sub => sub.blog_id === blogId);
      setSubBlogs(filteredBlogs);
    } catch (err) {
      setError("Failed to fetch stories. Please try again later.");
      toast.error("Error fetching sub-blog data.");
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchSubBlogs();
  }, [fetchSubBlogs]);

  const handleSelectSubBlog = (sublogId: number) => {
    setSelectedSubBlogs(prev =>
      prev.includes(sublogId)
        ? prev.filter(id => id !== sublogId)
        : [...prev, sublogId]
    );
  };

  const toggleCompareMode = () => {
    if (selectedSubBlogs.length < 2) {
      toast.warn("Please select at least two stories to compare.");
      return;
    }
    setIsCompareMode(true);
  };

  const resetCompareMode = () => {
    setIsCompareMode(false);
    setSelectedSubBlogs([]);
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 50, scale: 0.95 }
  };

  const highlightDifferences = (text1: string, text2: string) => {
    if (text1 === text2) return <span>{text1}</span>;
    return (
      <span>
        <span className="bg-yellow-200">{text1}</span> vs <span className="bg-yellow-200">{text2}</span>
      </span>
    );
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold" style={{ color: "#d12814" }}>
              {isCompareMode ? "Compare Stories" : "Stories From:"}
            </h3>
            <p className="text-lg text-[#0069b4] dark:text-gray-300 font-semibold">{blogTitle}</p>
          </div>
          <div className="flex items-center space-x-2">
            {!isCompareMode && (
              <button
                onClick={toggleCompareMode}
                className={`px-4 py-2 rounded-lg text-white font-semibold transition-all ${
                  selectedSubBlogs.length < 2 ? "bg-gray-400 cursor-not-allowed" : "bg-[#0069b4] hover:brightness-110"
                }`}
                disabled={selectedSubBlogs.length < 2}
              >
                Compare Selected
              </button>
            )}
            {isCompareMode && (
              <button
                onClick={resetCompareMode}
                className="px-4 py-2 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-all"
              >
                Back to List
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-grow">
          {loading && (
            <div className="flex justify-center items-center h-64">
              <ArrowPathIcon className="w-10 h-10 animate-spin" style={{ color: "#d12814" }} />
            </div>
          )}
          {error && (
            <div className="text-center text-red-500 dark:text-red-400 p-8">
              <InformationCircleIcon className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg">{error}</p>
            </div>
          )}
          {!loading && !error && (
            <>
              {subBlogs.length > 0 ? (
                isCompareMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {subBlogs
                      .filter(item => selectedSubBlogs.includes(item.sublog_id))
                      .map((item) => (
                        <motion.div
                          key={item.sublog_id}
                          className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden shadow-md"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          {/* --- START REFACTOR: DYNAMIC MEDIA LAYOUT --- */}
                          <div className="w-full bg-black">
                            {item.video_file && item.image_file ? (
                              // Case 1: Both exist - side by side
                              <div className="flex flex-col sm:flex-row items-center justify-center">
                                <div className="w-full sm:w-1/2 h-48">
                                  <video
                                    src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.video_file.replace(/^\//, "")}`}
                                    controls
                                    className="w-full h-full object-contain"
                                  > Your browser does not support the video tag. </video>
                                </div>
                                <div className="w-full sm:w-1/2 h-48">
                                  <img
                                    src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.image_file.replace(/^\//, "")}`}
                                    alt={item.heading}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                </div>
                              </div>
                            ) : (
                              // Case 2: Only one exists - centered
                              <div className="flex justify-center items-center h-48">
                                {item.video_file && (
                                  <video
                                    src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.video_file.replace(/^\//, "")}`}
                                    controls
                                    className="max-w-full h-full object-contain"
                                  > Your browser does not support the video tag. </video>
                                )}
                                {item.image_file && (
                                  <img
                                    src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.image_file.replace(/^\//, "")}`}
                                    alt={item.heading}
                                    className="max-w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                          {/* --- END REFACTOR --- */}
                          <div className="p-4">
                            <h4 className="text-lg font-bold mb-2 text-[#0069b4] dark:text-indigo-400">
                              {item.heading}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                              {item.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                              <div className="flex items-center">
                                <CalendarDaysIcon className="w-5 h-5 mr-1.5 text-gray-400" />
                                <span>
                                  {new Date(item.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              {item.url_link && (
                                <a
                                  href={item.url_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-red-600 hover:underline"
                                >
                                  <LinkIcon className="w-5 h-5 mr-1" /> View Link
                                </a>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {subBlogs.map((item) => (
                      <motion.div
                        key={item.sublog_id}
                        className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden shadow-md transition-shadow hover:shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
                          <input
                            type="checkbox"
                            checked={selectedSubBlogs.includes(item.sublog_id)}
                            onChange={() => handleSelectSubBlog(item.sublog_id)}
                            className="w-5 h-5 text-[#0069b4] rounded focus:ring-[#0069b4]"
                          />
                          <h4 className="ml-4 text-lg font-bold text-[#0069b4] dark:text-indigo-400">{item.heading}</h4>
                        </div>
                        {/* --- START REFACTOR: DYNAMIC MEDIA LAYOUT --- */}
                        <div className="w-full bg-black">
                          {item.video_file && item.image_file ? (
                            // Case 1: Both exist - side by side
                            <div className="flex flex-col sm:flex-row items-center justify-center">
                              <div className="w-full sm:w-1/2 h-56">
                                <video
                                  src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.video_file.replace(/^\//, "")}`}
                                  controls
                                  className="w-full h-full object-contain"
                                > Your browser does not support the video tag. </video>
                              </div>
                              <div className="w-full sm:w-1/2 h-56">
                                <img
                                  src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.image_file.replace(/^\//, "")}`}
                                  alt={item.heading}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              </div>
                            </div>
                          ) : (
                            // Case 2: Only one exists - centered
                            <div className="flex justify-center items-center min-h-[224px]">{/* 224px = h-56 */}
                              {item.video_file && (
                                <video
                                  src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.video_file.replace(/^\//, "")}`}
                                  controls
                                  className="w-full max-h-96 object-contain"
                                > Your browser does not support the video tag. </video>
                              )}
                              {item.image_file && (
                                <img
                                  src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.image_file.replace(/^\//, "")}`}
                                  alt={item.heading}
                                  className="w-full h-56 object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              )}
                            </div>
                          )}
                        </div>
                        {/* --- END REFACTOR --- */}
                        <div className="p-6">
                          <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">{item.description}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                            <div className="flex items-center">
                              <CalendarDaysIcon className="w-5 h-5 mr-1.5 text-gray-400" />
                              <span>
                                {new Date(item.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            {item.url_link && (
                              <a
                                href={item.url_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-red-600 hover:underline"
                              >
                                <LinkIcon className="w-5 h-5 mr-1" /> View Link
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                  <InformationCircleIcon className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg">No additional stories found for this blog category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- REFINED: Blog Section ---
const BlogSection: React.FC = () => {
  const [blogData, setBlogData] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<{ id: number; title: string } | null>(null);

  const fetchBlogData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<{ blogs: BlogData[] }>("/api/blogs/all");
      setBlogData(Array.isArray(response.data.blogs) ? response.data.blogs : []);
    } catch (err) {
      toast.error("Error fetching blog data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogData();
  }, [fetchBlogData]);

  const handleReadMoreClick = (blogId: number, blogTitle: string) => {
    setSelectedBlog({ id: blogId, title: blogTitle });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  return (
    <>
      <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-[#0069b4] dark:text-indigo-400 tracking-wide uppercase">Our Stories</h2>
            <p className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: "#d12814" }}>
              Blog
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-[#0069b4] dark:text-gray-400">
              Discover stories and insights from our team at the Financial Times.
            </p>
          </div>

          {loading ? (
            <div className="text-center mt-12">
              <ArrowPathIcon className="w-8 h-8 mx-auto animate-spin" style={{ color: "#d12814" }} />
            </div>
          ) : (
            <div className="mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {blogData.map((item) => (
                <motion.div
                  key={item.blog_id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-shadow duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                >
                  <div className="relative">
                    <div className="h-48 w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <SparklesIcon className="w-16 h-16 text-gray-300 dark:text-gray-500" />
                    </div>
                    <span className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: "#d12814" }}>
                      Blog
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold flex-grow" style={{ color: "#d12814" }}>
                      {item.heading}
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm flex-grow font-semibold">{item.description}</p>
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleReadMoreClick(item.blog_id, item.heading)}
                        className="w-full text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800"
                        style={{ backgroundColor: "#d12814" }}
                      >
                        Read More
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && selectedBlog && (
          <SubBlogModal
            blogId={selectedBlog.id}
            blogTitle={selectedBlog.title}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main BlogHomePage Component ---
const BlogHomePage: React.FC = () => {
  return (
    <div className="w-full font-sans bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <BlogHomeSlideshow />
      <BlogSection />
      <Footer />
    </div>
  );
};

export default BlogHomePage;