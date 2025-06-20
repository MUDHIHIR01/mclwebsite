import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon, InformationCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

interface AboutSliderData {
  about_id: number;
  heading: string;
  description: string;
  home_img: string | null;
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
              className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % data.length)}
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

const AboutContentSection: React.FC = () => {
  const [cards, setCards] = useState<AboutCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [companyRes, serviceRes, careersRes, newsRes] = await Promise.allSettled([
        axiosInstance.get("/api/latest/mcl-groups"),
        axiosInstance.get("/api/latest/service"),
        axiosInstance.get("/api/latestEarlyCareer"),
        axiosInstance.get("/api/latestnew"),
      ]);

      const orderedCards: AboutCardData[] = [];
      if (companyRes.status === "fulfilled" && companyRes.value.data.data) {
        const company = companyRes.value.data.data;
        orderedCards.push({ id: company.mcl_id, type: "Company", title: "Our Company", description: company.description, imageUrl: company.image_file, linkUrl: "/company/home", createdAt: company.created_at });
      }
      if (serviceRes.status === "fulfilled" && serviceRes.value.data.service) {
        const service = serviceRes.value.data.service;
        orderedCards.push({ id: service.service_id, type: "Service", title: "Our Services", description: service.description, imageUrl: service.service_img, linkUrl: "/company/services", createdAt: service.created_at });
      }
      if (careersRes.status === "fulfilled" && careersRes.value.data.early_career) {
        const career = careersRes.value.data.early_career;
        orderedCards.push({ id: career.early_career_id, type: "Careers", title: "Careers", description: career.description, imageUrl: career.img_file, linkUrl: "/careers/what-we-do", createdAt: career.created_at });
      }
      if (newsRes.status === "fulfilled" && newsRes.value.data.news) {
        const news = newsRes.value.data.news;
        orderedCards.push({ id: news.news_id, type: "News", title: "Latest News", description: news.description, imageUrl: news.news_img, linkUrl: "/company/news", createdAt: news.created_at });
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
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Our Company at a Glance</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto py-4"></p>
        </div>
        {loading ? (
          <div className="text-center mt-12">
            <ArrowPathIcon className="w-8 h-8 mx-auto text-white animate-spin" />
          </div>
        ) : cards.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
            {cards.map((card) => (
              <motion.div
                key={`${card.type}-${card.id}`}
                className="bg-[#fff1e5] shadow-lg flex flex-col"
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
                  <span className="absolute top-4 right-6 md:right-12 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
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
                    <Link to={card.linkUrl} className="flex items-center gap-2 text-lg font-bold text-[#0d7680] hover:text-[#0a5a60]">
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

const AboutPage: React.FC = () => (
  <div
    className="min-h-screen text-white font-sans flex flex-col"
    style={{ backgroundColor: '#262a33' }}
  >
    <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
    
    <header>
      <AboutHeroSection />
    </header>
    
    <main className="flex-grow">
      <AboutContentSection />
    </main>

    <footer>
      <Footer />
    </footer>
  </div>
);

export default AboutPage;