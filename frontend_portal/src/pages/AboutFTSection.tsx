import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon, // <-- ADDED: Icon for the report button
} from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

// --- INTERFACES ---

interface AboutSliderData {
  about_id: number;
  heading: string;
  description: string;
  home_img: string | null;
}

// [MODIFIED] Added pdf_file to the interface to match backend capabilities
interface MwananchiAboutData {
  id: number;
  category: string;
  description: string;
  video_link: string;
  pdf_file: string | null; // <-- ADDED: To hold the report link
}

interface AboutCardData {
  id: number;
  type: "Company" | "Service" | "Careers" | "News";
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string;
  createdAt: string;
}

// --- COMPONENTS ---

const LandingLoader: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A51A1] z-50"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
      </motion.div>
      <motion.h2 variants={itemVariants} className="text-2xl font-bold text-white tracking-wide">
        Loading Our Story...
      </motion.h2>
    </motion.div>
  );
};

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
      setError("Failed to fetch sliders");
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
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % data.length), 5000);
    return () => clearInterval(interval);
  }, [data.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A51A1]">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-white mr-3" />
        <span className="text-2xl font-semibold text-white">Loading Hero...</span>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-center p-6">
        <InformationCircleIcon className="w-12 h-12 text-[#ed1c24] mb-4" />
        <h2 className="text-3xl font-bold text-white">{data.length ? "An Error Occurred" : "No Content Available"}</h2>
        <p className="text-lg text-gray-300 my-4 max-w-md">{error || "We couldn't load the content for this section. Please try again later."}</p>
        <button onClick={fetchAboutSlider} className="flex items-center px-6 py-3 bg-[#ed1c24] text-white font-semibold rounded-full hover:bg-red-700 transition-colors duration-300">
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20 z-10" />
          <img
            src={data[currentSlide].home_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${data[currentSlide].home_img.replace(/^\//, "")}` : "https://via.placeholder.com/1920x1080?text=Image+Missing"}
            alt={data[currentSlide].heading}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1920x1080?text=Image+Error")}
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col justify-center h-full max-w-7xl mx-auto px-6 md:px-8">
        <div className="max-w-2xl">
          <motion.h1
            key={`h1-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6"
          >
            {data[currentSlide].heading}
          </motion.h1>
          <motion.p
            key={`p-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="text-lg md:text-xl font-normal text-gray-200 mb-10"
          >
            {data[currentSlide].description || "No description available"}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
            className="flex gap-4"
          >
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + data.length) % data.length)}
              className="p-3 bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/30 hover:bg-white/40 transition-all duration-300"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-7 h-7" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % data.length)}
              className="p-3 bg-white/20 text-white rounded-full backdrop-blur-sm border border-white/30 hover:bg-white/40 transition-all duration-300"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-7 h-7" />
            </button>
          </motion.div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <ChevronDownIcon className="w-8 h-8 text-white animate-bounce" />
      </motion.div>
    </section>
  );
};

const AboutMwananchiSection: React.FC = () => {
    const [content, setContent] = useState<MwananchiAboutData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    const fetchAboutData = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<{ records: MwananchiAboutData[] }>("/api/about-mwananchi/all");
        if (response.data?.records?.length > 0) {
          setContent(response.data.records[0]);
        } else {
          throw new Error("No 'About Us' content was found.");
        }
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch company information.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }, []);
  
    useEffect(() => {
      fetchAboutData();
    }, [fetchAboutData]);
  
    if (loading) {
      return (
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="h-[500px] bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-10 bg-gray-300 rounded-md w-1/3 mb-6"></div>
                <div className="h-8 bg-gray-300 rounded-md w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }
  
    if (error || !content) {
      return (
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center text-gray-700">
            <InformationCircleIcon className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Failed to Load Content</h2>
            <p className="mb-6 text-lg">{error}</p>
            <button onClick={fetchAboutData} className="flex items-center mx-auto px-6 py-3 bg-[#ed1c24] text-white font-semibold rounded-full hover:bg-red-700 transition-colors duration-300">
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Retry
            </button>
          </div>
        </section>
      );
    }
  
    const paragraphs = content.description.split(/\n\s*\n/);
  
    return (
      <section className="py-20 lg:py-28 bg-white text-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {content.video_link && (
              <motion.div
                className="w-full h-[500px]"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl bg-black">
                  <div className="aspect-w-16 aspect-h-9 h-full">
                      <iframe
                        src={content.video_link}
                        title={`About ${content.category}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className={!content.video_link ? 'lg:col-span-2 text-center' : ''}>
              <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <h2 className="text-base font-semibold text-[#ed1c24] uppercase tracking-wider">
                  About Mwananchi
                </h2>
                <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#0A51A1] tracking-tight">
                  {content.category}
                </h3>
                <div className="mt-8 space-y-6">
                  {paragraphs.map((paragraph, index) => (
                    <p key={index} className="text-lg text-gray-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* --- [NEW] "VIEW REPORT" BUTTON --- */}
                {content.pdf_file && (
                    <div className="mt-10">
                        <a
                            href={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${content.pdf_file.replace(/^\//, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-[#ed1c24] text-white font-bold text-lg rounded-full shadow-lg hover:bg-red-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
                        >
                            <ArrowDownTrayIcon className="w-6 h-6" />
                            View History
                        </a>
                    </div>
                )}
                {/* --- END OF NEW BUTTON --- */}

              </motion.div>
            </div>
          </div>
        </div>
      </section>
    );
};
  
const AboutContentSection: React.FC = () => {
  const [cards, setCards] = useState<AboutCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [companyRes, serviceRes, careersRes, newsRes] = await Promise.allSettled([
        axiosInstance.get("/api/latest/mcl-groups"),
        axiosInstance.get("/api/latestService"),
        axiosInstance.get("/api/latestEarlyCareer"),
        axiosInstance.get("/api/latestnew"),
      ]);

      const createCard = (data: any, type: AboutCardData['type'], idKey: string, title: string, descKey: string, imgKey: string, link: string, dateKey: string) => {
        if (data) {
          return {
            id: data[idKey], type, title, description: data[descKey], imageUrl: data[imgKey], linkUrl: link, createdAt: data[dateKey]
          };
        }
        return null;
      };

      const potentialCards = [
        companyRes.status === "fulfilled" && createCard(companyRes.value.data.data, "Company", "mcl_id", "Our Company", "description", "image_file", "/company/home", "created_at"),
        serviceRes.status === "fulfilled" && createCard(serviceRes.value.data, "Service", "services_home_id", serviceRes.value.data.heading || "Our Services", "description", "home_img", "/company/services", "created_at"),
        careersRes.status === "fulfilled" && createCard(careersRes.value.data.early_career, "Careers", "early_career_id", "Careers", "description", "img_file", "/careers/what-we-do", "created_at"),
        newsRes.status === "fulfilled" && createCard(newsRes.value.data.news, "News", "news_id", "Latest News", "description", "news_img", "/company/news", "created_at"),
      ];
      
      setCards(potentialCards.filter(Boolean) as AboutCardData[]);

    } catch {
      toast.error("Failed to fetch content highlights.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cardVariants: Variants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A51A1] tracking-tight">Discover More About Us</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Explore the core pillars of our organization, from our services and company culture to career opportunities and the latest news.
          </p>
        </div>
        {loading ? (
          <div className="text-center mt-12">
            <ArrowPathIcon className="w-10 h-10 mx-auto text-[#0A51A1] animate-spin" />
            <p className="mt-4 text-gray-600">Loading Highlights...</p>
          </div>
        ) : cards.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {cards.map((card) => (
              <motion.div
                key={`${card.type}-${card.id}`}
                className="group relative flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:border-gray-300 hover:-translate-y-2"
                variants={cardVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.4 }}
              >
                <div className="relative h-64 w-full">
                  <img
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    src={card.imageUrl ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${card.imageUrl.replace(/^\//, "")}` : "https://via.placeholder.com/600x400?text=Image+Missing"}
                    alt={card.title}
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/600x400?text=Image+Error")}
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                  <span className="absolute top-4 left-4 bg-[#ed1c24] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {card.type}
                  </span>
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-gray-600 text-base font-normal flex-grow leading-relaxed">
                    {card.description.length > 120 ? `${card.description.substring(0, 120)}...` : card.description}
                  </p>
                  <div className="mt-6">
                    <Link to={card.linkUrl} className="inline-flex items-center gap-2 text-base font-bold text-[#0A51A1] group-hover:text-[#ed1c24] transition-colors duration-300">
                      Find out more
                      <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-12 text-gray-700">
            <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-4 text-lg">No highlights found at this time.</p>
          </div>
        )}
      </div>
    </section>
  );
};


// --- MAIN PAGE COMPONENT ---
const AboutPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen text-gray-800 font-sans flex flex-col bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <AnimatePresence>
        {isLoading && <LandingLoader />}
      </AnimatePresence>
      
      {!isLoading && (
        <>
          <header>
            <AboutHeroSection />
          </header>
          <main className="flex-grow">
            <AboutMwananchiSection />
            <AboutContentSection />
          </main>
          <footer>
            <Footer />
          </footer>
        </>
      )}
    </div>
  );
};

export default AboutPage;