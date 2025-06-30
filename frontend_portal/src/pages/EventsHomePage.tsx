import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowPathIcon,
  InformationCircleIcon,
  XMarkIcon,
  PhotoIcon,
  PlayCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../axios"; // Assuming your axios instance is correctly configured
import Footer from "../components/Footer";

// --- INTERFACES ---

interface EventData {
  event_id: number;
  event_category: string;
  description: string;
  img_file: string | null;
  video_file: string | null;
  created_at: string;
  updated_at: string;
}

interface EventsResponse {
  events: EventData[];
}

// --- UTILITY FUNCTIONS ---

const getFullUrl = (path: string | null): string | null => {
  if (!path) return null;
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${baseUrl}/${path.replace(/^\//, "")}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};


// --- UI COMPONENTS ---

const Loader: React.FC = () => (
  <motion.div
    className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#003459] to-[#0072bc] z-50"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="mb-4"
    >
      <ArrowPathIcon className="w-16 h-16 text-white" />
    </motion.div>
    <h2 className="text-2xl font-bold text-white tracking-wider">
      Loading Events...
    </h2>
  </motion.div>
);

const MediaModal: React.FC<{
  type: "image" | "video";
  url: string;
  altText: string;
  onClose: () => void;
}> = ({ type, url, altText, onClose }) => (
  <motion.div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="relative bg-white rounded-lg p-2 max-w-4xl w-full"
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 50 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -top-3 -right-3 p-2 bg-white text-[#ed1c24] rounded-full shadow-lg hover:bg-gray-200 transition"
        aria-label="Close modal"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      {type === "image" ? (
        <img
          src={url}
          alt={altText}
          className="w-full h-auto max-h-[85vh] object-contain rounded"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Error";
          }}
        />
      ) : (
        <video
          src={url}
          controls
          autoPlay
          className="w-full h-auto max-h-[85vh] object-contain rounded"
          onError={(e) => {
            console.error("Video failed to load:", url);
            toast.error("The video could not be played.");
          }}
        />
      )}
    </motion.div>
  </motion.div>
);

const EventCard: React.FC<{ event: EventData }> = ({ event }) => {
  const [modalContent, setModalContent] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  const imageUrl = getFullUrl(event.img_file);
  const videoUrl = getFullUrl(event.video_file);
  const defaultImage = "https://via.placeholder.com/600x400?text=Event+Image";

  return (
    <>
      <motion.div
        className="bg-white shadow-xl rounded-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
        layout
      >
        <div className="relative h-56 bg-gray-200">
          {imageUrl && (
             <img
                className="w-full h-full object-cover cursor-pointer"
                src={imageUrl}
                alt={event.event_category}
                onClick={() => imageUrl && setModalContent({ type: 'image', url: imageUrl })}
                onError={(e) => { e.currentTarget.src = defaultImage; }}
                loading="lazy"
              />
          )}
          {!imageUrl && <PhotoIcon className="w-16 h-16 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
          <div className="absolute top-0 left-0 bg-[#0072bc] text-white px-3 py-1 text-sm font-semibold rounded-br-lg">
            {event.event_category}
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <p className="text-gray-700 text-base flex-grow mb-4">
            {event.description || "No description provided."}
          </p>
          <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
             <div className="flex items-center text-sm text-gray-500">
                <CalendarDaysIcon className="w-5 h-5 mr-2 text-[#0072bc]" />
                <span>{formatDate(event.created_at)}</span>
            </div>
            {videoUrl && (
              <button
                onClick={() => setModalContent({ type: 'video', url: videoUrl })}
                className="flex items-center text-sm font-semibold text-[#ed1c24] hover:text-[#003459] transition-colors"
                aria-label="Play video"
              >
                <PlayCircleIcon className="w-6 h-6 mr-1" />
                <span>Watch Video</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {modalContent && (
          <MediaModal
            type={modalContent.type}
            url={modalContent.url}
            altText={event.event_category}
            onClose={() => setModalContent(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};


// --- MAIN PAGE SECTIONS ---

const EventsSection: React.FC<{ setContentLoaded: (loaded: boolean) => void }> = ({ setContentLoaded }) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const fetchEvents = useCallback(async () => {
    setError(null);
    try {
      const response = await axiosInstance.get<EventsResponse>("/api/all-events");
      if (response.data && Array.isArray(response.data.events)) {
        const sortedEvents = response.data.events.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setEvents(sortedEvents);
        if (sortedEvents.length === 0) {
            setError("No events found.");
        }
      } else {
        throw new Error("Invalid data format from API.");
      }
    } catch (err: any) {
      console.error("Events fetch error:", err.message);
      setError("Could not fetch events data. Please try again later.");
      toast.error("Error fetching events.");
    } finally {
      setContentLoaded(true);
    }
  }, [setContentLoaded]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const categories = ["All", ...new Set(events.map((event) => event.event_category))];
  const filteredEvents = filter === "All" ? events : events.filter((event) => event.event_category === filter);

  if (error) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center px-4 text-center bg-gray-50">
        <InformationCircleIcon className="w-16 h-16 mx-auto text-[#ed1c24]" />
        <h3 className="mt-4 text-3xl font-bold text-[#003459]">
          {error === "No events found." ? "No Events Available" : "Failed to Load Content"}
        </h3>
        <p className="mt-2 text-lg text-gray-600 max-w-md">
            {error === "No events found." ? "There are no events to display at the moment. Check back soon!" : error}
        </p>
        <button
          onClick={fetchEvents}
          className="mt-8 flex items-center px-6 py-3 bg-[#003459] text-white font-semibold rounded-full hover:bg-[#0072bc] transition-colors shadow-md"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#003459]">
            Company <span className="text-[#0072bc]">Events</span> & <span className="text-[#ed1c24]">Happenings</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our recent events.
          </p>
        </div>

        <div className="flex justify-center flex-wrap gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                filter === category
                  ? "bg-[#ed1c24] text-white shadow-lg"
                  : "bg-white text-[#003459] hover:bg-gray-200 shadow-md"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <AnimatePresence>
            <motion.div
                key={filter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {filteredEvents.map((event) => (
                    <EventCard key={event.event_id} event={event} />
                ))}
            </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};


// --- PARENT PAGE COMPONENT ---

const EventsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Failsafe to hide loader after a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("Loader timeout: Forcing UI to display.");
        setIsLoading(false);
      }
    }, 8000); // 8-second timeout
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>
      
      {/* Header Placeholder - can be replaced with your actual Navbar */}
      <header className="bg-[#003459] text-white p-4 shadow-md z-30">
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">Our MCL  Events</h1>
        </div>
      </header>

      <main className="flex-grow">
        <EventsSection setContentLoaded={(loaded) => loaded && setIsLoading(false)} />
      </main>
      
      <Footer />
    </div>
  );
};

export default EventsPage;