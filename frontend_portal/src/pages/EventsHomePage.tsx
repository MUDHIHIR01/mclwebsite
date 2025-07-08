import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowPathIcon,
  InformationCircleIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import axiosInstance from "../axios";
import Footer from "../components/Footer";

// --- INTERFACES ---
interface EventData {
  event_id: number;
  event_category: string;
  description: string;
  img_file: string | null;
  video_link: string | null;
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

const getYouTubeEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1);
    } else if (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com"
    ) {
      videoId = urlObj.searchParams.get("v");
    }
  } catch (error) {
    console.error("Invalid URL for YouTube parsing:", url);
    return null;
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
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

const ImageModal: React.FC<{
  imageUrl: string;
  altText: string;
  onClose: () => void;
}> = ({ imageUrl, altText, onClose }) => (
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
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-auto max-h-[85vh] object-contain rounded"
        onError={(e) => {
          e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Error";
        }}
      />
    </motion.div>
  </motion.div>
);

const EventCard: React.FC<{ event: EventData }> = ({ event }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const imageUrl = getFullUrl(event.img_file);
  const embedVideoUrl = getYouTubeEmbedUrl(event.video_link);
  const defaultImage = "https://via.placeholder.com/600x400?text=Event+Image";

  const description = event.description || "No description provided.";
  const maxLength = 150;
  const isLongDescription = description.length > maxLength;
  const displayedDescription = isExpanded
    ? description
    : `${description.slice(0, maxLength)}...`;

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 grid grid-cols-1 md:grid-cols-2"
        layout
      >
        {/* Left Side: Image */}
        <div className="relative h-64 md:h-auto group">
          <img
            className="w-full h-full object-cover cursor-pointer"
            src={imageUrl ?? defaultImage}
            alt={event.event_category}
            onClick={() => setIsModalOpen(true)}
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <p

 className="text-white font-bold text-lg">View Image</p>
          </div>
        </div>

        {/* Right Side: Content & Video */}
        <div className="p-6 flex flex-col">
          <h3 className="text-xl font-bold text-[#003459] mb-2">{event.event_category}</h3>
          
          <div className="text-gray-700 text-base mb-4 flex-grow">
            <p className="inline">
              {isLongDescription ? displayedDescription : description}
            </p>
            {isLongDescription && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#0072bc] font-semibold hover:underline ml-1 transition-colors"
              >
                {isExpanded ? "Read Less" : "Read More"}
              </button>
            )}
          </div>
          
          {embedVideoUrl && (
            <div className="mb-4">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-inner">
                <iframe
                  src={embedVideoUrl}
                  title={event.event_category}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <CalendarDaysIcon className="w-5 h-5 mr-2 text-[#0072bc]" />
              <span>{formatDate(event.created_at)}</span>
            </div>
            <Link
              to={`/events/${event.event_id}`}
              title="View Sub-Events"
              className="p-2 rounded-full hover:bg-red-100 transition-colors duration-200"
            >
              <ArrowRightIcon className="w-6 h-6 text-[#ed1c24]" />
            </Link>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && imageUrl && (
          <ImageModal
            imageUrl={imageUrl}
            altText={event.event_category}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// --- MAIN PAGE SECTIONS ---
const EventsSection: React.FC<{
  setContentLoaded: (loaded: boolean) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ setContentLoaded, currentPage, setCurrentPage, itemsPerPage, setItemsPerPage }) => {
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
        if (sortedEvents.length === 0) setError("No events found.");
      } else {
        throw new Error("Invalid data format from API.");
      }
    } catch (err: any) {
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
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#003459]">
            Explore Our Journey: <span className="text-[#0072bc]">Events</span> &{" "}
            <span className="text-[#ed1c24]">Milestones</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our latest activities, partnerships, and achievements.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-12 justify-between items-center">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setFilter(category);
                  setCurrentPage(1);
                }}
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
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <AnimatePresence>
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            {paginatedEvents.length > 0 ? (
              paginatedEvents.map((event) => <EventCard key={event.event_id} event={event} />)
            ) : (
              <div className="col-span-full text-center py-16">
                <CalendarDaysIcon className="w-16 h-16 mx-auto text-gray-600" />
                <h3 className="mt-4 text-xl font-bold text-[#003459]">No Events Found</h3>
                <p className="text-gray-500 mt-2">No events match your current filter. Try selecting a different category.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {paginatedEvents.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#003459] text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-md ${
                      page === currentPage
                        ? "bg-[#0A51A1] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#003459] text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// --- PARENT PAGE COMPONENT ---
const EventsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 8000);
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
      <header className="bg-[#003459] text-white p-4 shadow-md z-30">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Our MCL Events</h1>
        </div>
      </header>
      <main className="flex-grow">
        <EventsSection
          setContentLoaded={(loaded) => loaded && setIsLoading(false)}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      </main>
      <Footer />
    </div>
  );
};

export default EventsPage;