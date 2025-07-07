import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import Footer from '../components/Footer';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

// --- INTERFACES ---
interface CompanySliderData {
  company_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
  created_at: string;
  updated_at: string;
}

interface CardData {
  id: string;
  heading: string;
  description: string;
  imageUrl: string | null;
  link: string;
  createdAt: string;
}

// --- Slider Section Component ---
const CompanySlideshow: React.FC = () => {
  const [data, setData] = useState<CompanySliderData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSliderData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/homeSliders");
        const sliderData = response.data; // Direct array as per example response
        if (!Array.isArray(sliderData)) {
          throw new Error("Invalid data format received");
        }
        setData(sliderData);
      } catch (err) {
        setError("Failed to load slider content");
        toast.error("Could not load slider content");
      } finally {
        setLoading(false);
      }
    };

    fetchSliderData();
  }, []);

  useEffect(() => {
    if (data.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % data.length), 5000);
    return () => clearInterval(interval);
  }, [data.length]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <ArrowPathIcon className="w-8 h-8 mx-auto text-[#0d7680] animate-spin" />
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 bg-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <InformationCircleIcon className="w-10 h-10 text-[#0d7680]" />
          <h2 className="text-3xl font-bold text-white">No Sliders Found</h2>
        </div>
        <p className="text-lg text-gray-200">{error || "Content could not be loaded."}</p>
      </div>
    );
  }

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
            src={data[currentSlide].home_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${data[currentSlide].home_img!.replace(/^\//, "")}` : "https://via.placeholder.com/1200x600?text=Image+Missing"}
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
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition"
              aria-label="Previous"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((p) => (p + 1) % data.length)}
              className="p-3 bg-[#003459] text-white rounded-full hover:bg-black/70 transition"
              aria-label="Next"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Individual Card Component ---
const ContentCard: React.FC<{ item: CardData }> = ({ item }) => {
  return (
    <motion.div
      key={item.id}
      className="bg-[white] shadow-lg flex flex-col"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -12 }}
    >
      <div className="relative px-4 -mt-8 md:px-8 md:-mt-10">
        <img
          className="w-full h-64 object-cover shadow-md"
          src={item.imageUrl || "https://via.placeholder.com/400x200?text=Image+Missing"}
          alt={item.heading}
          onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x200?text=Image+Error")}
        />
        <span className="absolute top-4 right-6 md:right-12 bg-white text-black text-xs font-bold px-3 py-1 rounded-full uppercase">
          {item.heading}
        </span>
      </div>
      <div className="p-8 flex flex-col flex-grow text-black">
        <h3 className="uppercase text-xl sm:text-2xl font-bold relative pb-4 mb-4 text-[#003459]">
          {item.heading}
          <span className="absolute bottom-0 left-0 h-1 w-1/4 bg-[#33302d]"></span>
        </h3>
        <p className="text-gray-700 text-base font-medium flex-grow line-clamp-4">{item.description}</p>
        <div className="mt-6">
          <Link to={item.link} className="flex items-center gap-2 text-lg font-bold text-[#ed1c24] hover:text-[#0a5a60]">
            Find more
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// --- Content Card Section Component ---
const ContentCardSection: React.FC<{ data: CardData[]; loading: boolean; error: string | null; onRetry: () => void; }> = ({ data, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="w-full py-20 text-center">
          <ArrowPathIcon className="w-8 h-8 mx-auto text-[#0d7680] animate-spin" />
      </div>
    );
  }
  if (error || data.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800">{error ? "Failed to Load Content" : "No Content Available"}</h3>
        <p className="mt-2 text-gray-600">{error || "There is no additional content to display at the moment."}</p>
        {error && <button onClick={onRetry} className="mt-6 flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-full hover:bg-gray-700 transition"><ArrowPathIcon className="w-5 h-5 mr-2" />Retry</button>}
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#ed1c24]">Our Company Initiatives</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the latest from across our company departments.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          {data.map((item) => <ContentCard key={item.id} item={item} />)}
        </div>
      </div>
    </section>
  );
};

// --- Endpoint Configuration ---
const contentEndpoints = [
  { url: "/api/leadershipHomeSlider", cardTitle: "Leadership", idKey: "leadership_home_id", imgKey: "home_img", link: "/company/leadership", extractor: (res: any) => res.data },
  { url: "/api/d-and-inc/homeSlider", cardTitle: "Diversity & Inclusion", idKey: "dhome_id", imgKey: "home_img", link: "/diversity-and-inclusion", extractor: (res: any) => res.data },
  { url: "/api/sust/homeSlider", cardTitle: "Sustainability", idKey: "sustainability_home_id", imgKey: "home_img", link: "/company/sustainability", extractor: (res: any) => res.data },
  { url: "/api/giving-back/slider", cardTitle: "Giving Back", idKey: "giving_back_id", imgKey: "home_img", link: "/company/giving-back", extractor: (res: any) => res.data },
  { url: "/api/ourStandardHomeSlider", cardTitle: "Our Standards", idKey: "id", imgKey: "home_img", link: "/company/our-standards", extractor: (res: any) => res.data?.data?.our_standard_homes },
];

// --- Main HomePage Component ---
const HomePage: React.FC = () => {
  const [cardData, setCardData] = useState<CardData[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);

  const fetchCardData = useCallback(async () => {
    setCardsLoading(true);
    setCardsError(null);

    const promises = contentEndpoints.map(async (endpoint) => {
        const response = await axiosInstance.get(endpoint.url);
        const items = endpoint.extractor(response);

        if (!Array.isArray(items) || items.length === 0) return null;

        const latestItem = items.reduce((latest, current) => 
            new Date(current.created_at) > new Date(latest.created_at) ? current : latest
        );
        
        const imageUrlRaw = latestItem[endpoint.imgKey] || null;
        
        return {
          id: `${endpoint.cardTitle}-${latestItem[endpoint.idKey]}`,
          heading: endpoint.cardTitle,
          description: latestItem.description || "No description provided.",
          imageUrl: imageUrlRaw ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${imageUrlRaw.replace(/^\//, "")}` : null,
          link: endpoint.link,
          createdAt: latestItem.created_at,
        };
    });
    
    try {
        const results = await Promise.allSettled(promises);
        const successfulData = results
            .filter((res): res is PromiseFulfilledResult<CardData | null> => res.status === 'fulfilled' && res.value !== null)
            .map(res => res.value as CardData);

        if (results.some(res => res.status === 'rejected')) {
            setCardsError("Some content sections failed to load.");
            toast.warn("Some content could not be loaded. Please try again later.");
        }
        
        setCardData(successfulData);
    } catch (err) {
        setCardsError("A critical error occurred while fetching content.");
        toast.error("Could not fetch page content.");
    } finally {
        setCardsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCardData();
  }, [fetchCardData]);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      
      <header>
        <CompanySlideshow />
      </header>

      <main className="flex-grow">
        <ContentCardSection data={cardData} loading={cardsLoading} error={cardsError} onRetry={fetchCardData}/>
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default HomePage;