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
  LinkIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

// --- Interfaces ---
interface BlogHomeData {
  blog_home_id: number;
  heading: string;
  description: string;
  home_img: string;
}

interface BlogData {
  blog_id: number;
  heading: string;
  description: string;
  created_at: string;
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
}

interface SubBlogModalProps {
  blogId: number;
  blogTitle: string;
  onClose: () => void;
}

// --- Blog Home Slideshow ---
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
      setError("Failed to fetch blog sliders.");
      toast.error("Error fetching blog sliders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBlogHomes(); }, [fetchBlogHomes]);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % data.length), 5000);
    return () => clearInterval(interval);
  }, [data.length]);

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

  if (error || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <InformationCircleIcon className="w-10 h-10 text-[#0d7680]" />
          <h2 className="text-3xl font-bold text-white">{error ? "Failed to Load Content" : "No Content Available"}</h2>
        </div>
        <p className="text-lg text-gray-200">{error || "No slides were found for this section."}</p>
        {error && (
          <button
            onClick={fetchBlogHomes}
            className="mt-6 flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />Retry
          </button>
        )}
      </div>
    );
  }

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imagePath = data[currentSlide].home_img?.replace(/^\//, "");
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
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % data.length)}
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

// --- Sub-Blog Modal Component ---
const SubBlogModal: React.FC<SubBlogModalProps> = ({ blogId, blogTitle, onClose }) => {
  const [subBlogs, setSubBlogs] = useState<SubBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ sub_blogs: SubBlog[] }>("/api/sub-blogs/all");
      const filteredBlogs = response.data.sub_blogs.filter((sub) => sub.blog_id === blogId);
      setSubBlogs(filteredBlogs);
    } catch (err) {
      setError("Failed to fetch stories.");
      toast.error("Error fetching sub-blog data.");
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => { fetchSubBlogs(); }, [fetchSubBlogs]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl flex flex-col shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-[#33302d]">Stories From:</h3>
            <p className="text-lg text-gray-600 font-semibold">{blogTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-grow">
          {loading && (
            <div className="flex justify-center items-center h-64">
              <ArrowPathIcon className="w-10 h-10 animate-spin text-[#0d7680]" />
            </div>
          )}
          {error && (
            <div className="text-center p-8">
              <InformationCircleIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg text-gray-600">{error}</p>
            </div>
          )}
          {!loading && !error && (
            <>
              {subBlogs.length > 0 ? (
                <div className="space-y-8">
                  {subBlogs.map((item) => (
                    <motion.div
                      key={item.sublog_id}
                      className="bg-[#fff1e5] rounded-xl shadow-md"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="p-4 border-b border-gray-200">
                        <h4 className="text-lg font-bold text-[#33302d]">{item.heading}</h4>
                      </div>
                      <div className="w-full bg-black">
                        {item.video_file && item.image_file ? (
                          <div className="flex flex-col sm:flex-row items-center justify-center">
                            <div className="w-full sm:w-1/2 h-56">
                              <video
                                src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.video_file.replace(/^\//, "")}`}
                                controls
                                className="w-full h-full object-contain"
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                            <div className="w-full sm:w-1/2 h-56">
                              <img
                                src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.image_file.replace(/^\//, "")}`}
                                alt={item.heading}
                                className="w-full h-full object-cover"
                                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x224?text=Image+Error")}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center items-center min-h-[224px]">
                            {item.video_file && (
                              <video
                                src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.video_file.replace(/^\//, "")}`}
                                controls
                                className="w-full max-h-96 object-contain"
                              >
                                Your browser does not support the video tag.
                              </video>
                            )}
                            {item.image_file && (
                              <img
                                src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${item.image_file.replace(/^\//, "")}`}
                                alt={item.heading}
                                className="w-full h-56 object-cover"
                                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x224?text=Image+Error")}
                              />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 border-t border-gray-200 pt-4 mt-4">
                          <div className="flex items-center">
                            <CalendarDaysIcon className="w-5 h-5 mr-1.5 text-gray-400" />
                            <span>
                              {new Date(item.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          {item.url_link && (
                            <a
                              href={item.url_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-[#0d7680] hover:text-[#0a5a60]"
                            >
                              <LinkIcon className="w-5 h-5 mr-1" />View Link
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <InformationCircleIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600">No additional stories found for this blog category.</p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Individual Blog Card Component ---
const BlogCard: React.FC<{ item: BlogData; onReadMore: (id: number, title: string) => void }> = ({ item, onReadMore }) => {
  return (
    <motion.div
      className="bg-[white] shadow-lg flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -12 }}
    >
      <div className="relative px-4 -mt-8 md:px-8 md:-mt-10">
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center shadow-md">
          <SparklesIcon className="w-16 h-16 text-gray-300" />
        </div>
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
          Blog
        </span>
      </div>
      <div className="p-8 flex flex-col flex-grow text-black">
        <h3 className="uppercase text-xl sm:text-2xl font-bold relative pb-4 mb-4 text-[#33302d]">
          {item.heading}
          <span className="absolute bottom-0 left-0 h-1 w-1/4 bg-[#33302d]"></span>
        </h3>
        <p className="text-gray-700 text-base font-medium flex-grow line-clamp-4">{item.description}</p>
        <div className="mt-6">
          <button
            onClick={() => onReadMore(item.blog_id, item.heading)}
            className="flex items-center gap-2 text-lg font-bold text-[#0d7680] hover:text-[#0a5a60]"
          >
            Read More
            <LinkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Blog Section ---
const BlogSection: React.FC = () => {
  const [blogData, setBlogData] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<{ id: number; title: string } | null>(null);

  const fetchBlogData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ blogs: BlogData[] }>("/api/blogs/all");
      setBlogData(Array.isArray(response.data.blogs) ? response.data.blogs : []);
    } catch (err) {
      setError("Could not fetch blog data.");
      toast.error("Could not fetch blog data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBlogData(); }, [fetchBlogData]);

  const handleReadMoreClick = (blogId: number, blogTitle: string) => {
    setSelectedBlog({ id: blogId, title: blogTitle });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  if (loading) {
    return (
      <div className="w-full py-20 text-center">
        <ArrowPathIcon className="w-8 h-8 mx-auto text-[#0d7680] animate-spin" />
      </div>
    );
  }

  if (error || blogData.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800">{error ? "Failed to Load Content" : "No Content Available"}</h3>
        <p className="mt-2 text-gray-600">{error || "There are no blog posts to display at the moment."}</p>
        {error && (
          <button
            onClick={fetchBlogData}
            className="mt-6 flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#ed1c24] inline-flex items-center">
              <SparklesIcon className="w-9 h-9 mr-3" />
              Our Stories
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Discover stories and insights from our team.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
            {blogData.map((item) => (
              <BlogCard key={item.blog_id} item={item} onReadMore={handleReadMoreClick} />
            ))}
          </div>
        </div>
      </section>
      <AnimatePresence>
        {isModalOpen && selectedBlog && (
          <SubBlogModal blogId={selectedBlog.id} blogTitle={selectedBlog.title} onClose={closeModal} />
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main BlogHomePage Component ---
const BlogHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <header>
        <BlogHomeSlideshow />
      </header>
      <main className="flex-grow">
        <BlogSection />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default BlogHomePage;
