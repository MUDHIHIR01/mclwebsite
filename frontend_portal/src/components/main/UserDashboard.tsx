import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from "../../axios";
import { 
  ShoppingCartIcon, 
  ComputerDesktopIcon, 
  PhotoIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowsPointingOutIcon 
} from '@heroicons/react/24/outline';

interface AdSlot {
  ad_slot_id: number;
  ad_type: string;
  ad_unit: string;
  dimensions: string;
  device: string;
  platform: string;
  placement_type: string;
  rate: string; 
  duration_limit: string;
  available: number;
  image: string;
  created_at: string;
  updated_at: string;
}

// FIX: Definition for the missing FilterBar component
interface FilterBarProps {
  onFilter: (filters: { 
    placement_type: string; 
    dimensions: string; 
    maxPrice: number | null 
  }) => void;
}

const FilterBar = ({ onFilter }: FilterBarProps) => {
  const [placementType, setPlacementType] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
    onFilter({
      placement_type: placementType,
      dimensions: dimensions,
      maxPrice: maxPrice === '' ? null : Number(maxPrice),
    });
  };

  const handleReset = () => {
    setPlacementType('');
    setDimensions('');
    setMaxPrice('');
    onFilter({
      placement_type: '',
      dimensions: '',
      maxPrice: null,
    });
    toast.info("Filters have been reset");
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-6 border-2 border-yellow-400 dark:border-yellow-500">
      <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="placement_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Placement Type</label>
          <input
            type="text"
            id="placement_type"
            value={placementType}
            onChange={(e) => setPlacementType(e.target.value)}
            placeholder="e.g., Homepage Banner"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dimensions</label>
          <input
            type="text"
            id="dimensions"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            placeholder="e.g., 728x90"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="max_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price (TShs)</label>
          <input
            type="number"
            id="max_price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g., 50000"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="w-full justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Filter
          </button>
          <button type="button" onClick={handleReset} className="w-full justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

const TotalCostCard = ({ totalCost, selectedAds, filteredAds, handleProcess }: { 
  totalCost: number; 
  selectedAds: AdSlot[]; 
  filteredAds: AdSlot[]; 
  handleProcess: () => void;
}) => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-2 border-yellow-400 dark:border-yellow-500 p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center text-gray-800 dark:text-white gap-4">
          <p className="text-lg font-semibold">
            Total Cost: <span className="text-blue-600">TShs {totalCost.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ({selectedAds.length} selected of {filteredAds.length} filtered slots)
          </p>
        </div>
        <button
          onClick={handleProcess}
          disabled={selectedAds.length === 0}
          className={`py-2 px-6 rounded-md text-white font-semibold flex items-center transition-colors duration-200 ${
            selectedAds.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <ShoppingCartIcon className="w-5 h-5 mr-2" />
          Process Selected Slots
        </button>
      </div>
    </div>
  );
};

export default function UserDashboard() {
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [selectedAds, setSelectedAds] = useState<AdSlot[]>([]);
  const [filteredAds, setFilteredAds] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdSlots = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/ad-slots");
        const slots = response.data?.data;
        if (!Array.isArray(slots) || slots.length === 0) {
          toast.error("No available ad slots found");
          setAdSlots([]);
          setFilteredAds([]);
          setSelectedAds([]);
        } else {
          const availableSlots = slots.filter((slot: AdSlot) => slot.available);
          setAdSlots(availableSlots);
          setFilteredAds(availableSlots);
          setSelectedAds([]);
          toast.success("Ad slots loaded successfully!");
        }
      } catch (err: any) {
        toast.error("Network error");
        setError(err.response?.data?.message || "Failed to fetch ad slots. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdSlots();
  }, []);

  const parseRate = (rate: string): number => parseFloat(rate) || 0;
  const totalCost = selectedAds.reduce((sum, ad) => sum + parseRate(ad.rate), 0);

  const handleFilter = ({ 
    placement_type, 
    dimensions, 
    maxPrice 
  }: { placement_type: string; dimensions: string; maxPrice: number | null }) => {
    let filtered = [...adSlots];

    if (placement_type && placement_type.trim() !== "") {
      filtered = filtered.filter((ad) =>
        ad.placement_type.toLowerCase().includes(placement_type.toLowerCase().trim())
      );
    }

    if (dimensions && dimensions.trim() !== "") {
      filtered = filtered.filter((ad) =>
        ad.dimensions.toLowerCase() === dimensions.toLowerCase().trim()
      );
    }

    if (maxPrice !== null && !isNaN(maxPrice) && maxPrice >= 0) {
      filtered = filtered.filter((ad) => parseRate(ad.rate) <= maxPrice);
    }

    const validSelectedAds = selectedAds.filter((selected) =>
      filtered.some((ad) => ad.ad_slot_id === selected.ad_slot_id)
    );
    setSelectedAds(validSelectedAds);
    setFilteredAds(filtered);
    if (filtered.length === 0) {
      toast.info("No ad slots match your filter criteria");
    } else {
      toast.success(`Filtered to ${filtered.length} ad slot(s)`);
    }
  };

  const handleSelect = (ad: AdSlot) => {
    const isSelected = selectedAds.some(selected => selected.ad_slot_id === ad.ad_slot_id);
    let updatedSelectedAds;
    if (isSelected) {
      updatedSelectedAds = selectedAds.filter(selected => selected.ad_slot_id !== ad.ad_slot_id);
      toast.info("Ad slot removed from selection");
    } else {
      updatedSelectedAds = [...selectedAds, ad];
      toast.success(`Added to selection: TShs ${ad.rate}/Hour`);
    }
    setSelectedAds(updatedSelectedAds);
  };

  const handleProcess = () => {
    if (selectedAds.length > 0) {
      toast.success("Proceeding to process selected slots!");
      navigate("/processed-slots", { state: { selectedAds } });
    } else {
      toast.error("Please select at least one ad slot");
    }
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const renderAdSlotCard = (ad: AdSlot) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    const availabilityColor = ad.available ? 'text-green-600' : 'text-red-600';
    const buttonBg = ad.available
      ? 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700'
      : 'bg-gray-400 cursor-not-allowed';

    return (
      <div
        key={ad.ad_slot_id}
        className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-yellow-400 dark:border-yellow-500"
      >
        <div className="relative group">
          <img
            src={ad.image}
            alt={ad.ad_type}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            onClick={() => handleImageClick(ad.image)}
          />
          <button
            onClick={() => handleImageClick(ad.image)}
            className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 rounded-full shadow-md hover:bg-opacity-100 transition-all duration-200"
          >
            <ArrowsPointingOutIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <div className="p-5 flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 truncate">{ad.ad_type}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="space-y-2">
              <div className="flex items-center">
                <PhotoIcon className="w-5 h-5 mr-2 text-blue-500" />
                <span><strong>Unit:</strong> {ad.ad_unit}</span>
              </div>
              <div className="flex items-center">
                <ComputerDesktopIcon className="w-5 h-5 mr-2 text-purple-500" />
                <span><strong>Dimension:</strong> {ad.dimensions}</span>
              </div>
              <div className="flex items-center">
                <ComputerDesktopIcon className="w-5 h-5 mr-2 text-indigo-500" />
                <span><strong>Device:</strong> {ad.device}</span>
              </div>
              <div className="flex items-center">
                <ComputerDesktopIcon className="w-5 h-5 mr-2 text-teal-500" />
                <span><strong>Platform:</strong> {ad.platform}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <PhotoIcon className="w-5 h-5 mr-2 text-orange-500" />
                <span><strong>Placement:</strong> {ad.placement_type}</span>
              </div>
              <div className="flex items-center">
                <PhotoIcon className="w-5 h-5 mr-2 text-yellow-500" />
                <span><strong>Rate:</strong> <span className="text-teal-600 font-medium">TShs {ad.rate}/Hour</span></span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-pink-500" />
                <span><strong>Duration:</strong> {ad.duration_limit}</span>
              </div>
              <div className="flex items-center">
                {ad.available ? (
                  <CheckCircleIcon className={`w-5 h-5 mr-2 ${availabilityColor}`} />
                ) : (
                  <XCircleIcon className={`w-5 h-5 mr-2 ${availabilityColor}`} />
                )}
                <span><strong>Avail:</strong> <span className={availabilityColor}>{ad.available ? 'Yes' : 'No'}</span></span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-cyan-500" />
                <span><strong>Created:</strong> {formatDate(ad.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={() => handleSelect(ad)}
            className={`w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center ${buttonBg} transition-all duration-200 shadow-md`}
            disabled={!ad.available}
          >
            <ShoppingCartIcon className="w-5 h-5 mr-2" />
            {ad.available ? 'Select Slot' : 'Unavailable'}
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-6 text-gray-800 dark:text-white">Loading ad slots...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <svg className="w-8 h-8 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-14" />
          </svg>
          Ad Slot Booking Dashboard
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-8">
          Select available ad slots and proceed to review your cart.
        </p>

        <FilterBar onFilter={handleFilter} />

        <TotalCostCard 
          totalCost={totalCost} 
          selectedAds={selectedAds} 
          filteredAds={filteredAds} 
          handleProcess={handleProcess} 
        />

        {filteredAds.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 mt-6">
            No ad slots found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredAds.map((ad) => renderAdSlotCard(ad))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="relative max-w-4xl w-full p-4" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Enlarged Ad" className="w-full h-auto rounded-lg" />
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <ToastContainer 
        position="top-center"  
        className="mt-16"    
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}