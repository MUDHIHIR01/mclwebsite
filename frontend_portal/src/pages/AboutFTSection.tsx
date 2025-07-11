import React, { useState, useEffect } from "react";
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
} from "@heroicons/react/24/outline";
import CountUp from "react-countup";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

// --- INTERFACES ---
interface AboutSliderData {
  about_id: number;
  heading: string;
  description: string;
  home_img: string | null;
}

interface MwananchiAboutData {
  id: number;
  category: string;
  description: string;
  video_link: string;
  pdf_file: string | null;
}

interface AboutCardData {
  id: number;
  type: "Company" | "Service" | "News" | "Events" | "Brand";
  title: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string;
  createdAt: string;
}

interface SubscriptionData {
  subscription_id: number;
  category: string;
  total_viewers: number;
  logo_img_file: string;
  created_at: string;
  updated_at: string;
}

interface ValueData {
  value_id: number;
  category: string;
  img_file: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// --- SIMPLIFIED & REUSABLE COMPONENTS ---

const LandingLoader: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 z-50"
    >
      <motion.div variants={itemVariants} className="mb-4">
        <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
      </motion.div>
      <motion.h2 variants={itemVariants} className="text-2xl font-bold text-white tracking-wide font-inter">
        Loading Our Story...
      </motion.h2>
    </motion.div>
  );
};

const AboutHeroSection: React.FC<{ data: AboutSliderData[] }> = ({ data }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % data.length), 5000);
    return () => clearInterval(interval);
  }, [data.length]);

  if (!data.length) {
    return null;
  }

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const imagePath = data[currentSlide].home_img?.replace(/^\//, "") || "";
  const imageSrc = imagePath ? `${baseURL}/${imagePath}` : "https://via.placeholder.com/1920x1080?text=Image+Missing";

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
          <img
            src={imageSrc}
            alt={data[currentSlide].heading}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1920x1080?text=Image+Error")}
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 flex flex-col h-full justify-end pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <motion.h1
              key={`h1-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 font-inter"
            >
              {data[currentSlide].heading}
            </motion.h1>
            <motion.p
              key={`p-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="text-lg sm:text-xl font-normal text-gray-200 mb-6 font-inter"
            >
              {data[currentSlide].description || "No description available"}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
              className="flex gap-4 mb-12"
            >
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + data.length) % data.length)}
                className="p-3 bg-white/20 text-white rounded-full backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300"
                aria-label="Previous slide"
              >
                <ChevronLeftIcon className="w-7 h-7" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % data.length)}
                className="p-3 bg-white/20 text-white rounded-full backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300"
                aria-label="Next slide"
              >
                <ChevronRightIcon className="w-7 h-7" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40"
      >
        <ChevronDownIcon className="w-8 h-8 text-white animate-bounce" />
      </motion.div>
    </section>
  );
};

const SubscriptionCountersSection: React.FC<{ subscriptions: SubscriptionData[] }> = ({ subscriptions }) => {
  if (!subscriptions.length) {
    return null;
  }

  const marqueeDuration = subscriptions.length * 6;
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-[#0A51A1] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-inter">
            Our Reach Across Platforms
          </h2>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#0A51A1] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#0A51A1] to-transparent z-10 pointer-events-none"></div>

        <motion.div
          className="flex gap-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: marqueeDuration, repeat: Infinity }}
        >
          {[...subscriptions, ...subscriptions].map((sub, index) => (
            <div key={`${sub.subscription_id}-${index}`} className="relative flex flex-col justify-end items-center bg-white rounded-2xl shadow-lg w-64 pt-20 pb-8 px-6 flex-shrink-0 border-4 border-solid border-[#003459]">
              <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full overflow-hidden bg-white p-2 shadow-xl border-4 border-white z-10">
                <img
                  src={sub.logo_img_file ? `${baseURL}/${sub.logo_img_file.replace(/^\//, "")}` : "https://via.placeholder.com/128x128?text=Logo"}
                  alt={sub.category}
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/128x128?text=Logo")}
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <CountUp
                  start={1}
                  end={sub.total_viewers}
                  duration={2}
                  formattingFn={(value) => `${new Intl.NumberFormat('en-US').format(Math.floor(value))}+`}
                  className="text-4xl font-bold text-[#ed1c24] font-inter"
                />
                <p className="text-md font-bold text-gray-700 font-inter mt-2">{sub.category}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const AboutMwananchiSection: React.FC<{ content: MwananchiAboutData | null }> = ({ content }) => {
  if (!content) {
    return null;
  }

  const paragraphs = content.description.split(/\n\s*\n/);

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-base font-semibold text-red-600 uppercase tracking-wider font-inter">About Mwananchi</h2>
            <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold text-blue-900 tracking-tight font-inter">{content.category}</h3>
            <div className="mt-8 space-y-6">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-lg text-gray-600 leading-relaxed font-inter">{paragraph}</p>
              ))}
            </div>
          </motion.div>
          {content.video_link && (
            <motion.div
              className="w-full h-[400px] sm:h-[500px]"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl bg-black">
                <div className="aspect-w-16 aspect-h-9 h-full">
                  <iframe
                    src={content.video_link}
                    title={`About ${content.category}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

const VisionMissionValuesSection: React.FC = () => {
    return (
      <section className="py-16 sm:py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-900 tracking-tight font-inter">
              Our Vision and Mission
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="bg-white/80 backdrop-blur-md rounded-2xl border-4 border-solid border-[#003459] p-6 transition-all duration-300 hover:shadow-xl"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h3 className="text-xl font-bold text-gray-800 font-inter">Our Vision</h3>
              <p className="mt-3 text-gray-600 text-base leading-relaxed font-inter">To be the leading digital multimedia company in Tanzania.</p>
            </motion.div>
            <motion.div
              className="bg-white/80 backdrop-blur-md rounded-2xl border-4 border-solid border-[#003459] p-6 transition-all duration-300 hover:shadow-xl"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-800 font-inter">Our Mission</h3>
              <p className="mt-3 text-gray-600 text-base leading-relaxed font-inter">To enrich the lives of people and empower them to promote positive change in society through superior media.</p>
            </motion.div>
          </div>
        </div>
      </section>
    );
  };
  
const OurValuesSection: React.FC<{ values: ValueData[] }> = ({ values }) => {
  if (!values.length) {
    return null;
  }

  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-900 tracking-tight font-inter">Our Core Values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.value_id}
              className="flex flex-col items-center text-center bg-gray-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-4 border-solid border-[#003459]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 * index }}
            >
              <img
                src={value.img_file ? `${baseURL}/${value.img_file.replace(/^\//, "")}` : "https://via.placeholder.com/150x150?text=Icon"}
                alt={value.category}
                className="w-24 h-24 object-contain mb-4"
                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150x150?text=Icon")}
                loading="lazy"
              />
              <h3 className="text-lg font-bold text-blue-900 font-inter">{value.category}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutContentSection: React.FC<{ cards: AboutCardData[] }> = ({ cards }) => {
    if (!cards.length) {
        return (
            <section className="py-16 sm:py-20 lg:py-28 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-700">
                    <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-lg font-inter">No content highlights found at this time.</p>
                </div>
            </section>
        );
    }

    const cardVariants: Variants = {
        offscreen: { y: 50, opacity: 0 },
        onscreen: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.3, duration: 0.7 } },
    };

    const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";

    return (
        <section className="py-16 sm:py-20 lg:py-28 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-900 tracking-tight font-inter">Discover More About Us</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card) => (
                        <motion.div
                            key={`${card.type}-${card.id}`}
                            className="group relative flex flex-col bg-white/80 backdrop-blur-md rounded-2xl border-4 border-solid border-[#003459] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                            variants={cardVariants}
                            initial="offscreen"
                            whileInView="onscreen"
                            viewport={{ once: true, amount: 0.4 }}
                        >
                            <div className="relative h-56 w-full">
                                <img
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    src={card.imageUrl ? `${baseURL}/${card.imageUrl.replace(/^\//, "")}` : "https://via.placeholder.com/600x400?text=Image+Missing"}
                                    alt={card.title}
                                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/600x400?text=Image+Error")}
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider font-inter">{card.type}</span>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-800 font-inter">{card.title}</h3>
                                <p className="mt-3 text-gray-600 text-base font-normal flex-grow leading-relaxed font-inter">{card.description.length > 120 ? `${card.description.substring(0, 120)}...` : card.description}</p>
                                <div className="mt-6">
                                    <Link to={card.linkUrl} className="inline-flex items-center gap-2 text-base font-bold text-blue-900 group-hover:text-red-600 transition-colors duration-300 font-inter">
                                        Find out more
                                        <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};


// --- MAIN PAGE COMPONENT (REFINED) ---
const AboutFTSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sliderData, setSliderData] = useState<AboutSliderData[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [mwananchiContent, setMwananchiContent] = useState<MwananchiAboutData | null>(null);
  const [values, setValues] = useState<ValueData[]>([]);
  const [cards, setCards] = useState<AboutCardData[]>([]);

  useEffect(() => {
    const loadPageData = async () => {
      // Promise to fetch all data concurrently
      const fetchDataPromise = Promise.allSettled([
        axiosInstance.get<AboutSliderData[]>("/api/slider-imgs"),
        axiosInstance.get<{ data: SubscriptionData[] }>("/api/allsubscriptions"),
        axiosInstance.get<{ records: MwananchiAboutData[] }>("/api/about-mwananchi/all"),
        axiosInstance.get<{ values: ValueData[] }>("/api/values/all"),
        axiosInstance.get("/api/latestbrand"),
        axiosInstance.get("/api/latestnew"),
        axiosInstance.get("/api/latestEvent"),
      ]);

      // Promise to ensure the loader is visible for a minimum duration
      // This prevents a "flash" of the loader on fast connections
      const minimumLoadTimePromise = new Promise(resolve => setTimeout(resolve, 800));

      // Wait for both data fetching and minimum load time to complete
      const [results] = await Promise.all([fetchDataPromise, minimumLoadTimePromise]);
      
      // Process slider data
      if (results[0].status === "fulfilled" && Array.isArray(results[0].value.data)) {
        setSliderData(results[0].value.data);
      } else {
        toast.error("Failed to fetch hero content.");
      }

      // Process subscriptions data
      if (results[1].status === "fulfilled" && Array.isArray(results[1].value.data.data)) {
        setSubscriptions(results[1].value.data.data);
      } else {
        toast.error("Failed to load audience data.");
      }

      // Process about data
      if (results[2].status === "fulfilled" && results[2].value.data?.records?.length > 0) {
        setMwananchiContent(results[2].value.data.records[0]);
      } else {
        toast.error("Failed to fetch company information.");
      }

      // Process values data
      if (results[3].status === "fulfilled" && Array.isArray(results[3].value.data.values)) {
        setValues(results[3].value.data.values);
      } else {
        toast.error("Failed to fetch company values.");
      }

      // Process card data (from brand, news, event)
      const createCard = (data: any, type: AboutCardData["type"], idKey: string, title: string, descKey: string, imgKey: string, link: string, dateKey: string): AboutCardData | null => {
        if (!data || !data[idKey]) return null;
        return {
          id: data[idKey], type, title: data.title || title, description: data[descKey] || "", imageUrl: data[imgKey] || null, linkUrl: link, createdAt: data[dateKey] || new Date().toISOString()
        };
      };
      
      const potentialCards: (AboutCardData | null)[] = [];
      if (results[4].status === "fulfilled") potentialCards.push(createCard(results[4].value.data, "Brand", "brand_id", results[4].value.data?.category || "Our Brand", "description", "brand_img", "/our-brands", "created_at"));
      if (results[5].status === "fulfilled") potentialCards.push(createCard(results[5].value.data?.news, "News", "news_id", "Latest News", "description", "news_img", "/company/news", "created_at"));
      if (results[6].status === "fulfilled") potentialCards.push(createCard(results[6].value.data?.event, "Events", "event_id", results[6].value.data?.event?.event_category || "Event", "description", "img_file", "/all-events", "created_at"));
      
      setCards(potentialCards.filter((card): card is AboutCardData => card !== null));

      // All data processed, hide the loader
      setIsLoading(false);
    };

    loadPageData();
  }, []); // Empty dependency array ensures this runs only once.

  return (
    <div className="min-h-screen text-gray-800 font-inter flex flex-col bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      
      <AnimatePresence>
        {isLoading && <LandingLoader />}
      </AnimatePresence>
      
      {!isLoading && (
        <>
          <header>
            <AboutHeroSection data={sliderData} />
          </header>
          <main className="flex-grow">
            <AboutMwananchiSection content={mwananchiContent} />
            <VisionMissionValuesSection />
            <OurValuesSection values={values} />
            <SubscriptionCountersSection subscriptions={subscriptions} />
            <AboutContentSection cards={cards} />
          </main>
          <footer>
            <Footer />
          </footer>
        </>
      )}
    </div>
  );
};

export default AboutFTSection;