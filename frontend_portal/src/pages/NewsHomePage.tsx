import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowPathIcon,
  InformationCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import Footer from "../components/Footer"; // Assuming Footer component exists

// --- Axios Instance (replace with your actual configured instance) ---
const axiosInstance = axios.create({
  baseURL: "https://your-api-base-url.com", // IMPORTANT: Replace with your API base URL
});

// --- Interfaces ---
interface EventData {
  event_id: number;
  event_category: string;
  description: string;
  img_file: string | null;
  video_file: string | null;
  created_at: string;
  updated_at: string;
}

interface EventsApiResponse {
  events: EventData[];
}

// --- Utility Functions ---
const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const getFullMediaUrl = (path: string | null): string | null => {
  if (!path) return null;
  const baseURL = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  const cleanPath = path.replace(/^\//, "");
  return `${baseURL}/${cleanPath}`;
};

// --- Full-page loader component ---
const Loader: React.FC = () => (
  <motion.div
    className="fixed inset-0 flex flex-col items-center justify-center bg-dark-blue z-50"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="mb-4"
    >
      <ArrowPathIcon className="w-16 h-16 text-primary-blue animate-spin" />
    </motion.div>
    <motion.h2
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="text-2xl font-bold text-white"
    >
      Loading Events...
    </motion.h2>
  </motion.div>
);

// --- Modal for viewing media ---
const EventMediaModal: React.FC<{
  media: { url: string; isVideo: boolean }[];
  onClose: () => void;
}> = ({ media, onClose }) => {
  const [current, setCurrent] = useState(0);

  if (media.length === 0) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-dark-blue rounded-lg p-2 max-w-5xl w-full mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 bg-black/30 rounded-full hover:bg-accent-red transition z-20"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
        <div className="relative w-full h-auto max-h-[80vh]">
          {media[current].isVideo ? (
            <video
              src={media[current].url}
              className="w-full h-full max-h-[80vh] object-contain"
              controls
              autoPlay
            />
          ) : (
            <img
              src={media[current].url}
              alt="Event Media"
              className="w-full h-full max-h-[80vh] object-contain"
            />
          )}
        </div>
        {media.length > 1 && (
            <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center items-center gap-4">
              <button onClick={() => setCurrent(p => (p - 1 + media.length) % media.length)} className="p-3 bg-black/50 text-white rounded-full hover:bg-primary-blue transition"><ChevronLeftIcon className="w-6 h-6" /></button>
              <span className="text-white font-mono text-sm bg-black/50 px-3 py-1 rounded-full">{current + 1} / {media.length}</span>
              <button onClick={() => setCurrent(p => (p + 1) % media.length)} className="p-3 bg-black/50 text-white rounded-full hover:bg-primary-blue transition"><ChevronRightIcon className="w-6 h-6" /></button>
            </div>
          )}
      </motion.div>
    </motion.div>
  );
};

// --- Individual event card component ---
const EventCard: React.FC<{
  event: EventData;
  isFeatured: boolean;
  onMediaClick: (event: EventData) => void;
}> = ({ event, isFeatured, onMediaClick }) => {
  const mediaUrl = getFullMediaUrl(event.img_file);

  return (
    <motion.div
      className="bg-white shadow-lg flex flex-col rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -8 }}
    >
      <div className="relative h-56">
        <img
          className="w-full h-full object-cover"
          src={mediaUrl || "https://via.placeholder.com/400x225/003459/ffffff?text=Event"}
          alt={event.event_category}
          loading="lazy"
        />
        {isFeatured && (
          <span className="absolute top-0 left-4 bg-accent-red text-white text-xs font-bold px-3 py-1 rounded-b-md z-10">
            LATEST
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow text-black">
        <p className="text-sm font-semibold text-primary-blue mb-2">{formatDate(event.created_at)}</p>
        <h3 className="text-xl font-bold text-dark-blue mb-3">{event.event_category}</h3>
        <p className="text-gray-600 text-base flex-grow line-clamp-4 mb-4">
          {event.description || "No description available."}
        </p>
        <button
          onClick={() => onMediaClick(event)}
          className="mt-auto w-full px-4 py-2.5 font-bold text-white bg-primary-blue rounded-lg hover:bg-opacity-90 transition-all duration-300"
        >
          View Media
        </button>
      </div>
    </motion.div>
  );
};

// --- Events section with filters ---
const EventsSection: React.FC<{
  setLoading: (loading: boolean) => void;
  onMediaClick: (event: EventData) => void;
}> = ({ setLoading, onMediaClick }) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axiosInstance.get<EventsApiResponse>("/api/all-events");
      console.log("Events API response:", response.data);

      const eventsData = response.data.events;
      const sortedEvents = (Array.isArray(eventsData) ? eventsData : []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setEvents(sortedEvents);

      if (sortedEvents.length === 0) {
        toast.info("No events were found on the server.");
      }

    } catch (err: any) {
      console.error("Events fetch error:", err.message);
      setError("Failed to fetch events data.");
      toast.error("Error fetching events data.");
    } finally {
      setLoading(true);
    }
  }, [setLoading]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter(event => {
      if (year && new Date(event.created_at).getFullYear().toString() !== year) return false;
      if (month && (new Date(event.created_at).getMonth() + 1).toString() !== month) return false;
      return true;
  });

  const latestEventId = filteredEvents.length > 0 ? filteredEvents[0].event_id : null;

  if (error) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center px-4 text-center">
        <InformationCircleIcon className="w-12 h-12 mx-auto text-accent-red" />
        <h3 className="mt-4 text-2xl font-bold text-dark-blue">Failed to Load Events</h3>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={fetchEvents}
          className="mt-6 flex items-center px-6 py-3 bg-dark-blue text-white font-semibold rounded-full hover:bg-opacity-90 transition"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-extrabold text-dark-blue"
          >
            Our Events
          </motion.h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our latest activities, gatherings, and company milestones.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={month} onChange={e => setMonth(e.target.value)} className="w-full p-3 border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue">
                <option value="">All Months</option>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={year} onChange={e => setYear(e.target.value)} className="w-full p-3 border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue">
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={() => { setMonth(""); setYear(""); }} className="w-full p-3 bg-dark-blue text-white rounded-lg font-semibold hover:bg-opacity-90">Reset Filters</button>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.event_id} event={event} isFeatured={event.event_id === latestEventId} onMediaClick={onMediaClick}/>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <CalendarDaysIcon className="w-16 h-16 mx-auto text-gray-400"/>
            <h3 className="mt-4 text-xl font-bold text-dark-blue">No Events Found</h3>
            <p className="text-gray-500 mt-2">There are no events matching your current filters.</p>
          </div>
        )}
      </div>
    </section>
  );
};

// --- Main events page component ---
const EventsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sectionLoaded, setSectionLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState<{ url: string; isVideo: boolean }[]>([]);

  useEffect(() => {
    if (sectionLoaded) {
      setIsLoading(false);
    }
  }, [sectionLoaded]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) setIsLoading(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  const handleMediaClick = (event: EventData) => {
    const mediaToDisplay: { url: string; isVideo: boolean }[] = [];
    if(event.img_file) mediaToDisplay.push({ url: getFullMediaUrl(event.img_file)!, isVideo: false });
    if(event.video_file) mediaToDisplay.push({ url: getFullMediaUrl(event.video_file)!, isVideo: true });

    if(mediaToDisplay.length > 0){
        setModalMedia(mediaToDisplay);
        setIsModalOpen(true);
    } else {
        toast.info("No media available for this event.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>
      <main className="flex-grow">
        <EventsSection setLoading={setSectionLoaded} onMediaClick={handleMediaClick} />
      </main>
      <Footer />
      <AnimatePresence>
        {isModalOpen && (
          <EventMediaModal media={modalMedia} onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsPage;