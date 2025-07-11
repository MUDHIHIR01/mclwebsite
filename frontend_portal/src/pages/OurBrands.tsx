import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// [REFINED] Removed the unused 'CubeTransparentIcon' to resolve the TS6133 error.
import { ArrowPathIcon, InformationCircleIcon, ArrowUpRightIcon, InboxIcon } from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Header from "../components/header/Header";
import Footer from "../components/Footer";

// --- INTERFACES & UTILITIES ---
interface BrandData {
  brand_id: number;
  brand_img: string;
  category: string;
  description: string;
  url_link: string | null;
}

const getFullUrl = (path: string | null): string => {
  if (!path) return "https://via.placeholder.com/400x200?text=Image+Missing";
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${baseUrl}/${path.replace(/^\//, "")}`;
};

// --- UI COMPONENTS ---

const Loader: React.FC = () => (
  <motion.div
    // [REFACTORED] Background color updated as requested
    className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A51A1] z-50"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="mb-4">
      <ArrowPathIcon className="w-16 h-16 text-white" />
    </motion.div>
    <h2 className="text-2xl font-bold text-white tracking-wider">Loading Brands...</h2>
  </motion.div>
);

const ErrorState: React.FC<{ title: string; message: string; onRetry: () => void }> = ({ title, message, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-gray-50 rounded-lg">
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
      <InformationCircleIcon className="w-10 h-10 text-[#ed1c24]" />
    </div>
    <h2 className="text-3xl font-bold text-[#003459] mb-2">{title}</h2>
    <p className="text-lg text-gray-600 max-w-md mb-8">{message}</p>
    <button onClick={onRetry} className="flex items-center px-6 py-3 bg-[#003459] text-white font-semibold rounded-full hover:bg-[#0072bc] transition-colors shadow-md">
      <ArrowPathIcon className="w-5 h-5 mr-2" />
      Try Again
    </button>
  </div>
);

// [REFACTORED] This now handles paragraphs from a CMS more reliably
const FormattedDescription: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-3 last:mb-0">
          {paragraph}
        </p>
      ))}
    </>
  );
};

const BrandCard: React.FC<{ brand: BrandData; variants: Variants }> = ({ brand, variants }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const imageUrl = getFullUrl(brand.brand_img);
  const isExternalLink = !!brand.url_link && brand.url_link.startsWith('http');
  const targetUrl = brand.url_link || `/brands/${brand.brand_id}`;

  const TRUNCATE_LENGTH = 120;
  const description = brand.description || "No description available.";
  const isLongDescription = description.length > TRUNCATE_LENGTH;

  return (
    <motion.div
      layout
      variants={variants}
      className="bg-white shadow-lg rounded-xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-transparent hover:border-[#0072bc]"
    >
      <div className="h-48 bg-gray-50 flex items-center justify-center p-4">
        <img src={imageUrl} alt={`${brand.category} logo`} className="max-w-full max-h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} loading="lazy" />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-[#003459] mb-3">{brand.category}</h3>
        <motion.div layout="position" className="text-gray-600 text-base mb-4 flex-grow">
          {isLongDescription && !isExpanded ? <p>{`${description.substring(0, TRUNCATE_LENGTH)}...`}</p> : <FormattedDescription text={description} />}
        </motion.div>
        {isLongDescription && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-sm font-semibold text-[#0072bc] hover:text-[#003459] self-start mb-4 transition-colors">
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        )}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link
            to={targetUrl}
            target={isExternalLink ? "_blank" : "_self"}
            rel={isExternalLink ? "noopener noreferrer" : ""}
            className="inline-flex items-center gap-2 text-lg font-semibold text-[#ed1c24] group-hover:text-[#003459] transition-colors"
          >
            View More
            <ArrowUpRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---
const OurBrands: React.FC = () => {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ brands: BrandData[] } | BrandData[]>("/api/allBrands");
      // Handle both { brands: [...] } and [...] formats
      const brandsData = 'brands' in response.data ? response.data.brands : response.data;
      if (Array.isArray(brandsData)) {
        setBrands(brandsData);
      } else {
        throw new Error("Invalid data format received from API.");
      }
    } catch (err: any) {
      setError("Failed to fetch brands. Please check your connection and try again.");
      toast.error("Failed to fetch brands.");
    } finally {
      // Add a small delay to prevent loader flashing on fast connections
      setTimeout(() => setLoading(false), 300);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const categories = ['All', ...Array.from(new Set(brands.map((brand) => brand.category)))];
  const filteredBrands = activeFilter === 'All' ? brands : brands.filter((brand) => brand.category === activeFilter);

  // [REFACTORED] Animation variants for the grid and cards
  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  const cardVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <AnimatePresence>{loading && <Loader />}</AnimatePresence>
      <Header />

      <main className="flex-grow">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl md:text-5xl font-extrabold text-[#003459]">
                 <span className="text-[#0072bc]">Brands</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            
              </motion.p>
            </div>

            {!loading && (
              <>
                {error ? (
                  <ErrorState title="Oops, Something Went Wrong" message={error} onRetry={fetchBrands} />
                ) : (
                  <>
                    <div className="flex justify-center flex-wrap gap-3 mb-12">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setActiveFilter(category)}
                          className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                            activeFilter === category
                              ? 'bg-[#ed1c24] text-white shadow-lg'
                              : 'bg-white text-[#003459] hover:bg-gray-200 shadow-sm'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    <motion.div
                      key={activeFilter}
                      variants={gridVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                      {filteredBrands.length > 0 ? (
                        filteredBrands.map((brand) => (
                          <BrandCard key={brand.brand_id} brand={brand} variants={cardVariants} />
                        ))
                      ) : (
                        <motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            className="col-span-full mt-8 flex flex-col items-center justify-center text-center p-10 bg-white rounded-lg shadow-md"
                        >
                          <InboxIcon className="w-12 h-12 text-gray-400 mb-4" />
                          <h3 className="text-2xl font-bold text-[#003459]">No Brands in this Category</h3>
                          <p className="text-gray-500 mt-1">Please select another category to see more of our brands.</p>
                        </motion.div>
                      )}
                    </motion.div>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OurBrands;