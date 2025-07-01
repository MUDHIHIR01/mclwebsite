import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon, InformationCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

// --- INTERFACES ---

interface AboutSliderData {
  about_id: number;
  heading: string;
  description: string;
  home_img: string | null;
}

// New interface for the /api/about-mwananchi/all response
interface MwananchiAboutData {
  id: number;
  category: string;
  description: string;
  video_link: string;
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
        Loading About Page...
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
      <div className="flex items-center justify-center min-h-[80vh]">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-white mr-3" />
        <span className="text-2xl font-semibold text-white">Loading...</span>
      </div>
    );
  }

  if (error || !data.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
        <div className="flex items-center gap-3 mb-6">
          <InformationCircleIcon className="w-10 h-10 text-[#0d7680]" />
          <h2 className="text-3xl font-bold text-white">{data.length ? "Oops, Something Went Wrong" : "No Sliders Found"}</h2>
        </div>
        <p className="text-lg text-gray-200 mb-8">{error || "Content could not be loaded."}</p>
        <button onClick={fetchAboutSlider} className="flex items-center px-6 py-3 bg-white text-gray-800 font-semibold rounded-full hover:bg-gray-200 transition">
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden">
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
            src={data[currentSlide].home_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${data[currentSlide].home_img.replace(/^\//, "")}` : "https://via.placeholder.com/1200x600?text=Image+Missing"}
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
              onClick={() => setCurrentSlide((prev) => (prev - 1 + data.length) % data.length)}
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % data.length)}
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
};

// --- REFACTORED DYNAMIC "ABOUT US" SECTION ---
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
      <section className="py-16 bg-[#fafaf1]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded-md w-1/3 mx-auto mb-6"></div>
            <div className="h-8 bg-gray-300 rounded-md w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded-md w-full mb-4"></div>
            <div className="h-6 bg-gray-200 rounded-md w-full mb-4"></div>
            <div className="h-6 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !content) {
    return (
      <section className="py-16 bg-[#fafaf1]">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-700">
          <InformationCircleIcon className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Failed to Load Content</h2>
          <p className="mb-4">{error}</p>
          <button onClick={fetchAboutData} className="flex items-center mx-auto px-6 py-3 bg-[#ed1c24] text-white font-semibold rounded-full hover:bg-[#c81a20] transition">
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // Split description by double newlines to create paragraphs
  const paragraphs = content.description.split(/\n\s*\n/);

  return (
    <section className="py-16 bg-[#fafaf1]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-3xl sm:text-4xl font-bold text-[#ed1c24] mb-6"
        >
          About Us
        </motion.h2>
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="text-2xl font-semibold text-[#003459] mb-4"
        >
          {content.category}
        </motion.h3>
        {paragraphs.map((paragraph, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 + index * 0.2 }}
            className="text-lg text-gray-700 leading-relaxed mt-4"
          >
            {paragraph}
          </motion.p>
        ))}
         {content.video_link && (
             <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.8 }}
                className="mt-12"
             >
                <div className="aspect-w-16 aspect-h-9 shadow-lg rounded-lg overflow-hidden bg-black">
                    <iframe
                        src={content.video_link}
                        title={`About ${content.category}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
             </motion.div>
        )}
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

      const orderedCards: AboutCardData[] = [];
      if (companyRes.status === "fulfilled" && companyRes.value.data.data) {
        const company = companyRes.value.data.data;
        orderedCards.push({
          id: company.mcl_id,
          type: "Company",
          title: "Our Company",
          description: company.description,
          imageUrl: company.image_file,
          linkUrl: "/company/home",
          createdAt: company.created_at,
        });
      }
      if (serviceRes.status === "fulfilled" && serviceRes.value.data) {
        const service = serviceRes.value.data;
        orderedCards.push({
          id: service.services_home_id,
          type: "Service",
          title: service.heading || "Our Services",
          description: service.description,
          imageUrl: service.home_img,
          linkUrl: "/company/services",
          createdAt: service.created_at,
        });
      }
      if (careersRes.status === "fulfilled" && careersRes.value.data.early_career) {
        const career = careersRes.value.data.early_career;
        orderedCards.push({
          id: career.early_career_id,
          type: "Careers",
          title: "Careers",
          description: career.description,
          imageUrl: career.img_file,
          linkUrl: "/careers/what-we-do",
          createdAt: career.created_at,
        });
      }
      if (newsRes.status === "fulfilled" && newsRes.value.data.news) {
        const news = newsRes.value.data.news;
        orderedCards.push({
          id: news.news_id,
          type: "News",
          title: "Latest News",
          description: news.description,
          imageUrl: news.news_img,
          linkUrl: "/company/news",
          createdAt: news.created_at,
        });
      }
      setCards(orderedCards);
    } catch {
      toast.error("Failed to fetch content highlights.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#ed1c24]">Our Company at a Glance</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto py-4"></p>
        </div>
        {loading ? (
          <div className="text-center mt-12">
            <ArrowPathIcon className="w-8 h-8 mx-auto text-white animate-spin" />
          </div>
        ) : cards.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 mt-12">
            {cards.map((card) => (
              <motion.div
                key={`${card.type}-${card.id}`}
                className="bg-white shadow-lg flex flex-col"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ y: -12 }}
              >
                <div className="relative px-4 -mt-8 md:px-8 md:-mt-10">
                  <img
                    className="w-full h-64 object-cover shadow-md"
                    src={card.imageUrl ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${card.imageUrl.replace(/^\//, "")}` : "https://via.placeholder.com/400x200?text=Image+Missing"}
                    alt={card.title}
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x200?text=Image+Error")}
                  />
                  <span className="absolute top-4 right-6 md:right-12 bg-white text-[#003459] text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {card.type}
                  </span>
                </div>
                <div className="p-8 flex flex-col flex-grow text-black">
                  <h3 className="uppercase text-xl sm:text-2xl font-bold relative pb-4 mb-4 text-[rgb(51,48.2,45.8)]">
                    {card.title}
                    <span className="absolute bottom-0 left-0 h-1 w-1/4 bg-[rgb(51,48.2,45.8)]"></span>
                  </h3>
                  <p className="text-gray-700 text-base font-medium flex-grow">{card.description}</p>
                  <div className="mt-6">
                    <Link to={card.linkUrl} className="flex items-center gap-2 text-lg font-bold text-[#ed1c24] hover:text-[#0a5a60]">
                      Find more
                      <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-12 text-white">
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
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen text-white font-sans flex flex-col"
      style={{ backgroundColor: 'white' }}
    >
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <AnimatePresence>
        {isLoading && <LandingLoader />}
      </AnimatePresence>
      <header>
        <AboutHeroSection />
      </header>
      <main className="flex-grow">
        {/* The new dynamic section is used here */}
        <AboutMwananchiSection />
        {/* The background of this section was not specified, so I've added a dark one for contrast. */}
        <div className="bg-gray-800">
           <AboutContentSection />
        </div>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default AboutPage;



