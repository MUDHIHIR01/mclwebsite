import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowPathIcon, InformationCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Header from "../components/header/Header"; // Placeholder Header import
import Footer from "../components/Footer";

// Interface for brand data from API
interface BrandData {
  brand_id: number;
  brand_img: string;
  category: string;
  description: string;
  url_link: string | null;
  created_at: string;
  updated_at: string;
}

// Full-page loader component
const Loader: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#0d7680] to-gray-800 z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="mb-4"
      >
        <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
      </motion.div>
      <motion.h2
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="text-2xl font-bold text-white"
      >
        Loading Brands...
      </motion.h2>
    </motion.div>
  );
};

// Main brands page component
const OurBrands: React.FC = () => {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch brand data
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<BrandData[]>("/api/allBrands");
      setBrands(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Failed to fetch brands");
      toast.error("Failed to fetch brands.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Generate default URL if url_link is null
  const getBrandUrl = (brand: BrandData): string =>
    brand.url_link || `/brands/${brand.category.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: "white" }}>
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <AnimatePresence>{loading && <Loader />}</AnimatePresence>
      <header>
        <Header /> {/* Placeholder Header component */}
      </header>
      <main className="flex-grow">
        <section className="py-16 bg-[#fafaf1]">
          <div className="max-w-6xl mx-auto px-4">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-3xl sm:text-4xl font-bold text-center text-[#ed1c24] mb-12"
            >
              Our Brands
            </motion.h2>
            {error || !brands.length ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                <div className="flex items-center gap-3 mb-6">
                  <InformationCircleIcon className="w-10 h-10 text-[#0d7680]" />
                  <h2 className="text-3xl font-bold text-[#003459]">
                    {brands.length ? "Oops, Something Went Wrong" : "No Brands Found"}
                  </h2>
                </div>
                <p className="text-lg text-gray-700 mb-8">{error || "Content could not be loaded."}</p>
                <button
                  onClick={fetchBrands}
                  className="flex items-center px-6 py-3 bg-[#003459] text-white font-semibold rounded-full hover:bg-[#0a5a60] transition"
                >
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
                {brands.map((brand) => (
                  <motion.div
                    key={brand.brand_id}
                    className="bg-white shadow-lg flex flex-col rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    whileHover={{ y: -8 }}
                  >
                    <div className="relative">
                      <img
                        src={`${axiosInstance.defaults.baseURL?.replace(/\/$/, "")}/${brand.brand_img.replace(/^\//, "")}`}
                        alt={brand.category}
                        className="w-full h-48 object-contain p-4"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x200?text=Image+Error")}
                        loading="lazy"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow text-black">
                      <h3 className="text-xl font-bold text-[#003459] mb-2">{brand.category}</h3>
                      <p className="text-gray-700 text-base font-medium flex-grow mb-4">{brand.description}</p>
                      <Link
                        to={getBrandUrl(brand)}
                        className="flex items-center gap-2 text-lg font-bold text-[#ed1c24] hover:text-[#0a5a60] transition"
                      >
                        View More
                        <ArrowRightIcon className="w-5 h-5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default OurBrands;
