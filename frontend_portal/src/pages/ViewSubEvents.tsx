// src/pages/ViewSubEvents.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowPathIcon,
  InformationCircleIcon,
  XMarkIcon,
  // PhotoIcon, // <-- REMOVED THIS LINE
  CalendarDaysIcon,
  ArrowLeftIcon,
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
}

interface ParentEventInfo {
  event_id: number;
  event_category: string;
}

interface SubEventData {
  subevent_id: number;
  event_id: number;
  sub_category: string;
  description: string;
  img_file: string | null;
  video_link: string | null;
  created_at: string;
  event: ParentEventInfo;
}

// --- UTILITIES ---
const getFullUrl = (path: string | null): string | null => {
  if (!path) return null;
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, "") || "";
  return `${baseUrl}/${path.replace(/^\//, "")}`;
};
const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
const getYouTubeEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    let videoId: string | null = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes("youtu.be")) videoId = urlObj.pathname.slice(1);
        else if (urlObj.hostname.includes("youtube.com")) videoId = urlObj.searchParams.get("v");
    } catch (e) { return null; }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

// --- COMPONENTS ---
const Loader: React.FC = () => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#003459] to-[#0072bc] z-50">
        <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
        <h2 className="mt-4 text-2xl font-bold text-white tracking-wider">Loading Details...</h2>
    </div>
);
const ImageModal: React.FC<{ imageUrl: string; altText: string; onClose: () => void }> = ({ imageUrl, altText, onClose }) => (
    <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="relative bg-white rounded-lg p-2 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
        <button onClick={onClose} className="absolute -top-3 -right-3 p-2 bg-white text-[#ed1c24] rounded-full shadow-lg">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <img src={imageUrl} alt={altText} className="w-full h-auto max-h-[85vh] object-contain rounded" />
      </motion.div>
    </motion.div>
);
const SubEventCard: React.FC<{ subEvent: SubEventData }> = ({ subEvent }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const imageUrl = getFullUrl(subEvent.img_file);
    const embedVideoUrl = getYouTubeEmbedUrl(subEvent.video_link);
    const defaultImage = "https://via.placeholder.com/600x400?text=Sub-Event";
    return (
        <>
            <motion.div className="bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2" layout
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="relative h-64 md:h-auto group">
                    <img className="w-full h-full object-cover cursor-pointer" src={imageUrl ?? defaultImage} alt={subEvent.sub_category}
                        onClick={() => setIsModalOpen(true)} onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/600x400?text=Image+Error"; }} loading="lazy" />
                </div>
                <div className="p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-[#003459] mb-2">{subEvent.sub_category}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                        <CalendarDaysIcon className="w-5 h-5 mr-2 text-[#0072bc]" />
                        <span>{formatDate(subEvent.created_at)}</span>
                    </div>
                    <p className="text-gray-700 text-base mb-4 flex-grow">{subEvent.description}</p>
                    {embedVideoUrl && (
                        <div className="mt-auto pt-4 border-t border-gray-200">
                            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-inner">
                                <iframe src={embedVideoUrl} title={subEvent.sub_category} frameBorder="0" allowFullScreen className="w-full h-full"></iframe>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
            <AnimatePresence>{isModalOpen && imageUrl && <ImageModal imageUrl={imageUrl} altText={subEvent.sub_category} onClose={() => setIsModalOpen(false)} />}</AnimatePresence>
        </>
    );
};

// --- MAIN PAGE ---
const ViewSubEvents: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [parentEvent, setParentEvent] = useState<EventData | null>(null);
  const [subEvents, setSubEvents] = useState<SubEventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!eventId) {
      setError("Event ID is missing.");
      setIsLoading(false);
      return;
    }
    try {
      const [parentEventsRes, subEventsRes] = await Promise.all([
        axiosInstance.get<{ events: EventData[] }>("/api/all-events"),
        axiosInstance.get<{ sub_events: SubEventData[] }>("/api/all/sub-events")
      ]);

      const foundParent = parentEventsRes.data.events.find(e => e.event_id.toString() === eventId);
      if (foundParent) {
        setParentEvent(foundParent);
      } else {
        throw new Error("Parent event not found.");
      }
      
      const filteredSubs = subEventsRes.data.sub_events.filter(s => s.event.event_id.toString() === eventId);
      setSubEvents(filteredSubs.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

    } catch (err: any) {
      setError(err.message || "Could not fetch event details.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) return <Loader />;
  if (error || !parentEvent) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <InformationCircleIcon className="w-16 h-16 mx-auto text-[#ed1c24]" />
            <h3 className="mt-4 text-3xl font-bold text-[#003459]">Error Loading Page</h3>
            <p className="mt-2 text-lg text-gray-600">{error}</p>
            <Link to="/all-events" className="mt-8 inline-flex items-center px-6 py-3 bg-[#003459] text-white font-semibold rounded-lg hover:bg-[#0072bc]">
                <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to All Events
            </Link>
        </div>
    );
  }

  const parentImageUrl = getFullUrl(parentEvent.img_file);
  const parentEmbedVideoUrl = getYouTubeEmbedUrl(parentEvent.video_link);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to="/all-events" className="inline-flex items-center text-gray-600 hover:text-[#0072bc] font-semibold transition-colors group">
              <ArrowLeftIcon className="w-5 h-5 mr-2 transform group-hover:-translate-x-1" />
              Back to All Events
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16 p-6 md:p-8">
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#003459]">{parentEvent.event_category}</h1>
            <div className="flex items-center text-md text-gray-500 my-4">
                <CalendarDaysIcon className="w-5 h-5 mr-2 text-[#0072bc]" />
                <span>{formatDate(parentEvent.created_at)}</span>
            </div>
            <div className="prose prose-lg max-w-none text-gray-800 mb-8">
                <p>{parentEvent.description}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {parentImageUrl && (
                    <div className="group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                        <img src={parentImageUrl} alt={parentEvent.event_category} className="rounded-lg shadow-md w-full h-full object-cover" />
                    </div>
                )}
                {parentEmbedVideoUrl && (
                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md">
                        <iframe src={parentEmbedVideoUrl} title={parentEvent.event_category} frameBorder="0" allowFullScreen className="w-full h-full"></iframe>
                    </div>
                )}
            </div>
          </div>
          
          {subEvents.length > 0 && (
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#003459] mb-8 border-b-2 border-[#0072bc] pb-2">Related Sub-Events & Activities</h2>
                <div className="grid grid-cols-1 gap-10">
                    {subEvents.map((sub) => <SubEventCard key={sub.subevent_id} subEvent={sub} />)}
                </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <AnimatePresence>{isModalOpen && parentImageUrl && <ImageModal imageUrl={parentImageUrl} altText={parentEvent.event_category} onClose={() => setIsModalOpen(false)} />}</AnimatePresence>
    </div>
  );
};

export default ViewSubEvents;