import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";
import { GlobeAltIcon, ArrowPathIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

// --- Interfaces ---
interface WhatWeDoData {
  what_we_do_id: number;
  category: string;
  description: string;
}

// --- Full-Page Landing Loader ---
const LandingLoader: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#0A51A1] z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <motion.div
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.05, 1],
          transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
        }}
        className="mb-4"
      >
        <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
      </motion.div>
      <motion.h2
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.05, 1],
          transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
        }}
        className="text-2xl font-bold text-white"
      >
        Loading What We Do Page...
      </motion.h2>
    </motion.div>
  );
};

// --- What We Do Card Component ---
const WhatWeDoCard: React.FC<{ item: WhatWeDoData }> = ({ item }) => {
  return (
    <motion.div
      className="bg-white shadow-xl rounded-lg p-8 flex flex-col items-start gap-4 border-l-4 border-[#0A51A1] hover:shadow-2xl transition-shadow duration-300"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -8 }}
    >
      <div className="flex items-center gap-3">
        <GlobeAltIcon className="w-8 h-8 text-[#0A51A1]" />
        <h3 className="text-2xl font-bold text-[#003459] uppercase">{item.category}</h3>
      </div>
      <p className="text-gray-700 text-base font-medium">{item.description}</p>
    </motion.div>
  );
};

// --- What We Do Section ---
const WhatWeDoSection: React.FC = () => {
  const [whatWeDoData, setWhatWeDoData] = useState<WhatWeDoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWhatWeDoData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ records: WhatWeDoData[] }>("/api/we-do/all");
      setWhatWeDoData(Array.isArray(response.data.records) ? response.data.records : []);
    } catch (err) {
      setError("Could not fetch What We Do data.");
      toast.error("Could not fetch What We Do data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWhatWeDoData();
  }, [fetchWhatWeDoData]);

  if (loading) {
    return (
      <div className="w-full py-20 text-center">
        <ArrowPathIcon className="w-8 h-8 mx-auto text-[#0A51A1] animate-spin" />
        <p className="mt-4 text-lg text-gray-600">Loading content...</p>
      </div>
    );
  }

  if (error || whatWeDoData.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-2xl font-bold text-gray-800">
          {error ? "Failed to Load Content" : "No Content Available"}
        </h3>
        <p className="mt-2 text-gray-600">
          {error || "There are no What We Do initiatives to display at the moment."}
        </p>
        {error && (
          <button
            onClick={fetchWhatWeDoData}
            className="mt-6 flex items-center px-6 py-3 bg-[#0A51A1] text-white font-semibold rounded-full hover:bg-[#003459] transition"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0A51A1] inline-flex items-center">
            <GlobeAltIcon className="w-9 h-9 mr-3" />
            What We Do
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our commitment to delivering quality information and services worldwide.
          </p>
        </div>
        <div className="flex flex-col gap-8">
          {whatWeDoData.map((item) => (
            <WhatWeDoCard key={item.what_we_do_id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Main WhatWeDoHomePage Component ---
const WhatWeDoHomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
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
      <AnimatePresence>
        {isLoading && <LandingLoader />}
      </AnimatePresence>
      <main className="flex-grow">
        <WhatWeDoSection />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default WhatWeDoHomePage;