import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axios'; // Assuming your pre-configured axios instance is here

// --- Type Definitions ---

interface CardItem {
  name: string;
  icon: React.ReactNode;
  apiUrl: string;
  apiKey: string;
  color: string; // Add color property for each card
}

// --- Data Configuration for Dashboard Cards ---

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
    color: "bg-[#0A51A1]", // Blue
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
    color: "bg-[#2E7D32]", // Green
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
    color: "bg-[#D81B60]", // Pink
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
    color: "bg-[#F57C00]", // Orange
  },
];

// --- Reusable Dashboard Card Component ---

function DashboardCard({ item }: { item: CardItem }) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(item.apiUrl);
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
  }, [item.apiUrl, item.name, item.apiKey]);

  const renderLoadingState = () => (
    <div className="h-16 w-24 bg-white bg-opacity-20 rounded-md animate-pulse"></div>
  );

  const renderCount = () => {
    if (error) {
      return <span className="text-2xl font-bold text-red-200">{error}</span>;
    }
    return <span className="text-6xl font-bold">{count ?? '--'}</span>;
  };

  return (
    <div
      className={`p-6 rounded-xl shadow-lg flex flex-col justify-between bg-gradient-to-br ${item.color} text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
    >
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