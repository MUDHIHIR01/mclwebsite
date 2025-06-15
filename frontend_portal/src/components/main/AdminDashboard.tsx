import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axios'; // Assuming your pre-configured axios instance is here

// --- Type Definitions ---

interface CardItem {
  name: string;
  icon: JSX.Element;
  apiUrl: string;
  apiKey: string; // The key in the JSON response that holds the count
}

// --- Data Configuration for Dashboard Cards ---

// An array defining the properties for each dashboard card.
// This makes it easy to add or remove cards in the future.
const cardItems: CardItem[] = [
  {
    name: "MCL Groups",
    icon: (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20 text-white text-2xl">
        🏢
      </span>
    ),
    apiUrl: "/api/count/mcl-groups",
    apiKey: "count_mcl_group",
  },
  {
    name: "Services",
    icon: (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20 text-white text-2xl">
        ⚙️
      </span>
    ),
    apiUrl: "/api/count/services",
    apiKey: "count_services",
  },
  {
    name: "Leaders",
    icon: (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20 text-white text-2xl">
        💼
      </span>
    ),
    apiUrl: "/api/count/leadership",
    apiKey: "count_leaders",
  },
  {
    name: "News",
    icon: (
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white bg-opacity-20 text-white text-2xl">
        📰
      </span>
    ),
    apiUrl: "/api/count/news",
    apiKey: "count_news",
  },
];

// --- Reusable Dashboard Card Component ---

/**
 * A single card component that fetches and displays data from a given API endpoint.
 */
function DashboardCard({ item }: { item: CardItem }) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(item.apiUrl);
        // Access the count using the dynamic key from our cardItems config
        const fetchedCount = response.data[item.apiKey];

        if (typeof fetchedCount !== 'number') {
            throw new Error(`Invalid data format received for ${item.name}`);
        }
        
        setCount(fetchedCount);
        setError(null);
      } catch (err: any) {
        console.error(`Failed to fetch count for ${item.name}:`, err);
        setError("Failed to load data.");
        setCount(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [item.apiUrl, item.name, item.apiKey]); // Dependencies for the effect

  // Renders a placeholder with a pulsing animation while loading
  const renderLoadingState = () => (
    <div className="h-16 w-24 bg-white bg-opacity-20 rounded-md animate-pulse"></div>
  );
  
  // Renders the fetched count or an error message
  const renderCount = () => {
    if (error) {
        return <span className="text-2xl font-bold text-red-200">{error}</span>;
    }
    return <span className="text-6xl font-bold">{count ?? '--'}</span>;
  }

  return (
    <div className="p-6 rounded-xl shadow-lg flex flex-col justify-between
                   bg-gradient-to-br from-[#0A51A1] to-[#ff3333] 
                   text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{item.name}</h3>
        {item.icon}
      </div>
      <div className="mt-4 text-right">
        {loading ? renderLoadingState() : renderCount()}
      </div>
    </div>
  );
}

// --- Main AdminDashboard Component ---

/**
 * The main dashboard container that lays out all the cards.
 */
export default function AdminDashboard() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-[#0A51A1] mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardItems.map((item) => (
          <DashboardCard key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}