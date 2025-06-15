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
  BuildingOffice2Icon,
  UserGroupIcon,
  GlobeAltIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

// --- INTERFACES ---
interface CompanySliderData {
  mcl_home_id: number;
  heading: string;
  description: string | null;
  mcl_home_img: string | null;
}

interface CardData {
  id: string;
  heading: string;
  description: string;
  imageUrl: string | null;
  link: string;
  createdAt: string;
}

// --- REFINED: Slider Section Component ---
const CompanySlideshow: React.FC = () => {
  const [data, setData] = useState<CompanySliderData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ data: CompanySliderData[] }>("/api/sliders");
      setData(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err: any) {
      setError("Failed to fetch slideshow: " + (err.response?.data?.message || err.message));
      toast.error("Failed to fetch slideshow entries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

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
                <span>{error ? "An Error Occurred" : "No Content Found"}</span>
            </div>
            <p className="text-gray-200 mb-8 text-lg text-center">{error || "No slideshow entries were found."}</p>
            {error && <button onClick={fetchCompanies} className="inline-flex items-center px-8 py-3 text-white rounded-full transition-all hover:brightness-90" style={{ backgroundColor: '#d12814' }}><ArrowPathIcon className="w-5 h-5 mr-2" />Try Again</button>}
        </div>
    );
  }

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
      <AnimatePresence mode="wait">
        <motion.div key={currentSlide} variants={cardVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10" />
          <img src={data[currentSlide].mcl_home_img ? `${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${data[currentSlide].mcl_home_img!.replace(/^\//, "")}` : "https://via.placeholder.com/1200x600?text=Image+Missing"} alt={data[currentSlide].heading} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Error"; }} loading="lazy"/>
        </motion.div>
      </AnimatePresence>
      <div className="relative z-20 flex flex-col justify-center min-h-[80vh] px-4 sm:px-8">
        <div className="max-w-[50%] text-left ml-12">
          <motion.h2 key={`h2-${currentSlide}`} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight" style={{ color: "#d12814", textShadow: "0 4px 12px rgba(0, 0, 0, 0.4)" }} variants={contentVariants} initial="hidden" animate="visible">
            {data[currentSlide].heading}
          </motion.h2>
          <motion.p key={`p-${currentSlide}`} className="text-lg sm:text-xl text-gray-100 mb-8 leading-relaxed font-semibold" variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            {data[currentSlide].description || "No description available"}
          </motion.p>
          <motion.div variants={contentVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            {/* BUG FIX: Corrected modulo operator from %p to %data.length */}
            <button onClick={() => setCurrentSlide((p) => (p - 1 + data.length) % data.length)} className="inline-flex items-center p-3 text-white rounded-full transition-all shadow-lg hover:brightness-90" style={{ backgroundColor: '#d12814' }} aria-label="Previous"><ChevronLeftIcon className="w-6 h-6" /></button>
            <button onClick={() => setCurrentSlide((p) => (p + 1) % data.length)} className="ml-4 inline-flex items-center p-3 text-white rounded-full transition-all shadow-lg hover:brightness-90" style={{ backgroundColor: '#d12814' }} aria-label="Next"><ChevronRightIcon className="w-6 h-6" /></button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Icon Helper ---
const getIconForCard = (heading: string, className: string) => {
    switch (heading) {
        case 'MCL-Group': return <BuildingOffice2Icon className={className} />;
        case 'Leadership': return <UserGroupIcon className={className} />;
        case 'Diversity & Inclusion': return <GlobeAltIcon className={className} />;
        case 'Sustainability': return <SparklesIcon className={className} />;
        case 'Giving Back': return <HeartIcon className={className} />;
        case 'MCL Pink 130': return <StarIcon className={className} />;
        case 'Our Standards': return <ShieldCheckIcon className={className} />;
        default: return <InformationCircleIcon className={className} />;
    }
};

// --- REFINED: Individual Card Component with Image Fallback ---
const ContentCard: React.FC<{ item: CardData }> = ({ item }) => {
    const [hasImageError, setHasImageError] = useState(false);
    const showPlaceholder = hasImageError || !item.imageUrl;

    return (
        <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col transition-shadow duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.03, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        >
            <div className="relative h-48 w-full">
                {showPlaceholder ? (
                    <div className="h-full w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {getIconForCard(item.heading, "w-16 h-16 text-gray-300 dark:text-gray-500")}
                    </div>
                ) : (
                    <img className="h-full w-full object-cover" src={item.imageUrl!} alt={item.heading} onError={() => setHasImageError(true)} />
                )}
                <span className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#d12814' }}>
                    {item.heading}
                </span>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold" style={{ color: '#d12814' }}>{item.heading}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm flex-grow font-semibold line-clamp-4">{item.description}</p>
                <div className="mt-6">
                    <Link
                        to={item.link}
                        className="w-full inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg transition-all duration-300 hover:brightness-90"
                        style={{ backgroundColor: '#d12814' }}
                    >
                        {getIconForCard(item.heading, "w-5 h-5 mr-2")}
                        <span>Learn More</span>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

// --- REFINED: Content Card Section Component ---
const ContentCardSection: React.FC<{ data: CardData[]; loading: boolean; error: string | null; onRetry: () => void; }> = ({ data, loading, error, onRetry }) => {
    if (loading) {
        return (
            <div className="w-full bg-gray-50 dark:bg-gray-900 py-20 text-center">
                <div className="flex justify-center items-center space-x-3 text-2xl font-semibold text-gray-700 dark:text-gray-200 animate-pulse">
                    <ArrowPathIcon className="w-8 h-8 animate-spin" style={{ color: '#d12814' }}/>
                    <span>Loading Content...</span>
                </div>
            </div>
        );
    }
    if (error || data.length === 0) {
        return (
          <div className="w-full bg-gray-50 dark:bg-gray-900 py-20 flex flex-col items-center justify-center px-4">
            <div className="text-red-500 text-2xl font-bold mb-4 flex items-center space-x-3">
              <InformationCircleIcon className="w-8 h-8" />
              <span>{error ? "Failed to Load Content" : "No Content Available"}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{error || "There is no additional content to display at the moment."}</p>
            {error && <button onClick={onRetry} className="inline-flex items-center px-6 py-2 text-white rounded-md hover:brightness-90" style={{ backgroundColor: '#d12814' }}><ArrowPathIcon className="w-5 h-5 mr-2" />Retry</button>}
          </div>
        );
    }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: '#d12814' }}>Our Company Initiatives</h2>
          <p className="mt-4 text-lg text-[#0069b4] dark:text-gray-400">Explore the latest from across our company departments.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
          {data.map((item) => <ContentCard key={item.id} item={item} />)}
        </div>
      </div>
    </section>
  );
};

// --- Endpoint Configuration (Remains the same) ---
const contentEndpoints = [
  { url: "/api/sliders", cardTitle: "MCL-Group", idKey: "mcl_home_id", imgKey: "mcl_home_img", link: "/company/mcl-group", extractor: (res: any) => res.data.data },
  { url: "/api/leadershipHomeSlider", cardTitle: "Leadership", idKey: "leadership_home_id", imgKey: "home_img", link: "/company/leadership", extractor: (res: any) => res.data },
  { url: "/api/d-and-inc/homeSlider", cardTitle: "Diversity & Inclusion", idKey: "dhome_id", imgKey: "home_img", link: "/diversity-and-inclusion", extractor: (res: any) => res.data },
  { url: "/api/sust/homeSlider", cardTitle: "Sustainability", idKey: "sustainability_home_id", imgKey: "home_img", link: "/company/sustainability", extractor: (res: any) => res.data },
  { url: "/api/giving-back/slider", cardTitle: "Giving Back", idKey: "giving_back_id", imgKey: "home_img", link: "/company/giving-back", extractor: (res: any) => res.data },
  { url: "/api/pink130Sliders", cardTitle: "MCL Pink 130", idKey: "ft_pink_id", imgKey: "home_img", link: "/company/pink-130", extractor: (res: any) => res.data?.ft_pink_130_homes },
  { url: "/api/ourStandardHomeSlider", cardTitle: "Our Standards", idKey: "id", imgKey: "home_img", link: "/company/our-standards", extractor: (res: any) => res.data?.data?.our_standard_homes },
];

// --- REFINED: Main HomePage Component ---
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
    <div className="w-full font-sans bg-white dark:bg-gray-900">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <CompanySlideshow />
      <ContentCardSection data={cardData} loading={cardsLoading} error={cardsError} onRetry={fetchCardData}/>
      <Footer />
    </div>
  );
};

export default HomePage;