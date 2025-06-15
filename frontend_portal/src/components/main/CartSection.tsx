// src/components/main/CartSection.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from "../../axios";
import { ShoppingCartIcon, TrashIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface BookingSlot {
  ad_slot_id: number;
  ad_type: string;
  ad_unit: string;
  dimensions: string;
  device: string;
  platform: string;
  placement_type: string;
  rate: string;
  rate_unit: string;
  duration_limit: string;
  available: number;
  image: string;
  created_at: string;
  updated_at: string;
  quantity: number | string;
}

interface Invoice {
  invoice_id: number;
  invoice_number: string;
  items: {
    ad_slot_id: number;
    ad_type: string;
    ad_unit: string;
    quantity: number;
    duration: string;
    total_amount: string;
    date: string;
  }[];
  total_amount: string;
  total_quantity: number;
  date: string;
  status: string;
}

interface CartSectionProps {
  initialAds: BookingSlot[];
  onBookingSuccess: (invoice: Invoice) => void;
  onCartUpdate: (updatedAds: BookingSlot[]) => void; // New callback to update parent state
}

export default function CartSection({ initialAds, onBookingSuccess, onCartUpdate }: CartSectionProps) {
  const navigate = useNavigate();
  const [selectedAds, setSelectedAds] = useState<BookingSlot[]>(initialAds);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = selectedAds.reduce((sum, ad) => {
    const rate = Number(ad.rate) || 0;
    const quantity = Number(ad.quantity) || 0;
    return sum + rate * quantity;
  }, 0);

  const isBookingValid = selectedAds.every(
    (ad) => Number(ad.quantity) > 0 && ad.available
  );

  const handleRemove = (adSlotId: number) => {
    const updatedAds = selectedAds.filter((ad) => ad.ad_slot_id !== adSlotId);
    setSelectedAds(updatedAds);
    onCartUpdate(updatedAds); // Update parent state
    toast.info("Item removed from cart");
  };

  const handleQuantityChange = (adSlotId: number, value: string) => {
    const numericValue = value === "" ? "" : Math.max(1, parseInt(value) || 1);
    const updatedAds = selectedAds.map((ad) =>
      ad.ad_slot_id === adSlotId ? { ...ad, quantity: numericValue } : ad
    );
    setSelectedAds(updatedAds);
    onCartUpdate(updatedAds); // Update parent state
  };

  const handleBookNow = async () => {
    if (!isBookingValid) {
      toast.error("Please enter a valid quantity (at least 1) for each available slot");
      setError("Please enter a valid quantity (at least 1) for each available slot.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookings = selectedAds.map((ad) => ({
        ad_slot_id: ad.ad_slot_id,
        quantity: Number(ad.quantity),
        duration_type: "hours",
        duration_value: 1,
      }));

      const response = await axiosInstance.post("/api/bookings", { bookings });
      const invoice = {
        ...response.data.invoice,
        total_quantity: selectedAds.reduce((sum, ad) => sum + Number(ad.quantity), 0),
      };
      setSelectedAds([]);
      onCartUpdate([]); // Clear parent state
      toast.success("Booking completed successfully!");
      onBookingSuccess(invoice);
    } catch (err: any) {
      console.error("Booking error:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || "Failed to create bookings";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCart = () => {
    setSelectedAds([]);
    onCartUpdate([]); // Clear parent state
    navigate("/dashboard");
    toast.info("Returning to dashboard");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Your Cart</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {selectedAds.length > 0 && (
        <>
          {selectedAds.map((ad) => (
            <div
              key={ad.ad_slot_id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-6">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={ad.image} 
                      alt={`${ad.ad_type} - ${ad.ad_unit}`} 
                      className="w-16 h-16 object-cover rounded-md" 
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                        {ad.ad_type} - {ad.ad_unit} ({ad.dimensions})
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {ad.platform} - {ad.device}
                      </p>
                      <p className={`text-sm ${ad.available ? "text-green-600" : "text-red-600"}`}>
                        {ad.available ? "Available" : "Not Available"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Rate: TShs {ad.rate} {ad.rate_unit}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 flex items-center space-x-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={ad.quantity}
                    onChange={(e) => handleQuantityChange(ad.ad_slot_id, e.target.value)}
                    className={`w-20 p-1 border rounded-md dark:bg-gray-700 dark:text-white ${
                      ad.quantity === "" || Number(ad.quantity) < 1 ? "border-red-500" : ""
                    }`}
                    disabled={loading}
                    placeholder="Quantity"
                  />
                  {(ad.quantity === "" || Number(ad.quantity) < 1) && (
                    <p className="text-xs text-red-600">
                      {ad.quantity === "" ? "Required" : "Min 1"}
                    </p>
                  )}
                </div>

                <div className="md:col-span-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    TShs {(Number(ad.rate) * Number(ad.quantity || 0)).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleRemove(ad.ad_slot_id)}
                    className="p-2 text-red-600 hover:text-red-700"
                    disabled={loading}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <p className="text-lg font-semibold text-gray-800 dark:text-white mb-4 sm:mb-0">
              Total Cost: <span className="text-blue-600">TShs {totalCost.toFixed(2)}</span>
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleCancelCart}
                className="py-2 px-6 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center transition-colors"
              >
                <XCircleIcon className="w-5 h-5 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleBookNow}
                disabled={loading || !isBookingValid}
                className={`py-2 px-6 rounded-md text-white flex items-center transition-colors ${
                  loading || !isBookingValid
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <ShoppingCartIcon className="w-5 h-5 mr-2" />
                {loading ? "Booking..." : "Book Now"}
              </button>
            </div>
          </div>
        </>
      )}
      <ToastContainer 
        position="top-right"
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