import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  BuildingOffice2Icon,
  WrenchScrewdriverIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";

// --- INTERFACES ---
interface AboutSliderData {
  about_id: number;
  heading: string;
  description: string;
  home_img: string | null; // Can be null
}

interface AboutCardData {
  id: number;
  type: 'Company' | 'Service' | 'News';
  title: string;
  description: string;
  imageUrl: string | null; // Can be null
  linkUrl: string;
  createdAt: string;
}

// --- About Hero Section ---
const AboutHeroSection: React.FC = () => {
  const [data, setData] = useState<AboutSliderData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAboutSlider = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<AboutSliderData[]>("/api/slider-imgs");
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError("Failed to fetch sliders: " + (err.response?.data?.message || err.message || "Unknown error"));
      toast.error("Failed to fetch about sliders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutSlider();
  }, [fetchAboutSlider]);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.length);
    }, 5000);
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
                <span>{data.length === 0 ? "No Sliders Found" : "Oops, Something Went Wrong"}</span>
            </div>
            <p className="text-gray-200 mb-8 text-lg text-center">{error || "Content could not be loaded."}</p>
            <button
                onClick={fetchAboutSlider}
                className="inline-flex items-center px-8 py-3 text-white rounded-full transition-all duration-300 shadow-lg hover:brightness-90 focus:outline-none"
                style={{ backgroundColor: '#d12814' }}
            >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Try Again
            </button>
        </div>
    );
  }

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
        <AnimatePresence mode="wait">
            <motion.div key={currentSlide} variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
                {/* CHANGED: Added safe check for home_img to prevent crash on null */}
                <img
                    src={
                      data[currentSlide].home_img
                        ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${data[currentSlide].home_img!.replace(/^\//, "")}`
                        : "https://via.placeholder.com/1200x600?text=Image+Missing"
                    }
                    alt={data[currentSlide].heading}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error"; }}
                    loading="lazy"
                />
            </motion.div>
        </AnimatePresence>
        <div className="relative z-20 flex flex-col justify-center min-h-[80vh] px-4 sm:px-8">
            <div className="max-w-[50%] text-left ml-12">
                <motion.h2
                    key={`h2-${currentSlide}`}
                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight"
                    style={{ color: "#d12814", textShadow: "0 4px 12px rgba(0, 0, 0, 0.4)" }}
                    variants={contentVariants} initial="hidden" animate="visible"
                >
                    {data[currentSlide].heading}
                </motion.h2>
                <motion.p
                    key={`p-${currentSlide}`}
                    className="text-lg sm:text-xl text-gray-100 mb-8 leading-relaxed font-semibold"
                    variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
                >
                    {data[currentSlide].description || "No description available"}
                </motion.p>
                <motion.div variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                    <button
                        onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)}
                        className="inline-flex items-center px-5 py-3 text-white rounded-full transition-all duration-300 shadow-lg hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d12814]"
                        style={{ backgroundColor: '#d12814' }}
                        aria-label="Previous slide"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setCurrentSlide((p) => (p + 1) % data.length)}
                        className="ml-4 inline-flex items-center px-5 py-3 text-white rounded-full transition-all duration-300 shadow-lg hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d12814]"
                        style={{ backgroundColor: '#d12814' }}
                        aria-label="Next slide"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        </div>
    </section>
  );
};

// --- About Content Section ---
const AboutContentSection: React.FC = () => {
    const [cards, setCards] = useState<AboutCardData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [companyRes, serviceRes, newsRes] = await Promise.allSettled([
                axiosInstance.get("/api/latest/mcl-groups"),
                axiosInstance.get("/api/latest/service"),
                axiosInstance.get("/api/latestnew"),
            ]);

            const combinedData: AboutCardData[] = [];

            if (companyRes.status === 'fulfilled' && companyRes.value.data.data) {
                const company = companyRes.value.data.data;
                combinedData.push({
                    id: company.mcl_id,
                    type: 'Company',
                    title: company.mcl_category,
                    description: company.description,
                    imageUrl: company.image_file, // This can be null
                    linkUrl: '/company/home',
                    createdAt: company.created_at,
                });
            }

            if (serviceRes.status === 'fulfilled' && serviceRes.value.data.service) {
                const service = serviceRes.value.data.service;
                combinedData.push({
                    id: service.service_id,
                    type: 'Service',
                    title: service.service_category,
                    description: service.description,
                    imageUrl: service.service_img, // This can be null
                    linkUrl: '/company/services',
                    createdAt: service.created_at,
                });
            }

            if (newsRes.status === 'fulfilled' && newsRes.value.data.news) {
                const news = newsRes.value.data.news;
                combinedData.push({
                    id: news.news_id,
                    type: 'News',
                    title: news.category,
                    description: news.description,
                    imageUrl: news.news_img, // This can be null
                    linkUrl: '/company/news',
                    createdAt: news.created_at,
                });
            }
            
            setCards(combinedData);

        } catch (err) {
            toast.error("An error occurred while fetching content.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getIcon = (type: 'Company' | 'Service' | 'News') => {
        switch (type) {
            case 'Company': return <BuildingOffice2Icon className="w-5 h-5 mr-2" />;
            case 'Service': return <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />;
            case 'News': return <NewspaperIcon className="w-5 h-5 mr-2" />;
            default: return null;
        }
    };

    return (
        <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-[#0069b4] dark:text-indigo-400 tracking-wide uppercase"></h2>
                    <p className="mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: '#d12814' }}>
                        Our Company at a Glance
                    </p>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-[#0069b4] dark:text-gray-400">
                        Explore the latest highlights from our company, services, and news updates.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center mt-12"><ArrowPathIcon className="w-8 h-8 mx-auto animate-spin text-red-600" style={{ color: '#d12814' }} /></div>
                ) : (
                    <div className="mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {cards.map((card) => (
                            <motion.div 
                                key={`${card.type}-${card.id}`}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-shadow duration-300 group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                whileHover={{ y: -8, scale: 1.03, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                            >
                                <div className="relative">
                                    {/* CHANGED: Added safe check for card.imageUrl to prevent crash on null */}
                                    <img 
                                        className="h-48 w-full object-cover" 
                                        src={
                                            card.imageUrl
                                                ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${card.imageUrl.replace(/^\//, "")}`
                                                : "https://via.placeholder.com/400x200?text=Image+Missing"
                                        } 
                                        alt={card.title} 
                                        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x200?text=Image+Error"; }}
                                    />
                                    <span className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#d12814' }}>
                                        {card.type}
                                    </span>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold" style={{ color: '#d12814' }}>{card.title}</h3>
                                    <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm flex-grow font-semibold">{card.description}</p>
                                    <div className="mt-6">
                                        <Link
                                            to={card.linkUrl}
                                            className="w-full inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg transition-all duration-300 hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d12814]"
                                            style={{ backgroundColor: '#d12814' }}
                                        >
                                            {getIcon(card.type)}
                                            <span>Learn More</span>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

// --- Main AboutPage Component ---
const AboutPage: React.FC = () => {
  return (
    <div className="w-full font-sans">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <AboutHeroSection />
      <AboutContentSection />
      <Footer />
    </div>
  );
};

export default AboutPage;