import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, useGlobalFilter, usePagination, Column } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interfaces
interface EventData {
  eventId: number;
  eventCategory: string;
  description: string | null;
  imgFile: string | null;
  videoLink: string | null;
  createdAt: string;
}

interface EventApiResponse {
  events: {
    event_id: number;
    event_category: string;
    description: string | null;
    img_file: string | null;
    video_link: string | null;
    created_at: string;
  }[];
}

interface ActionButtonsProps {
  eventId: number;
  eventCategory: string;
  onDeleteSuccess: () => void;
}

type MediaType = 'image' | 'video';

// Helper Functions
const constructFileUrl = (filePath: string | null): string | null => {
  if (!filePath) return null;
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, '') || '';
  return `${baseUrl}/${filePath.replace(/^\//, '')}`;
};

const getYouTubeEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;
  try {
    // Handle both youtu.be and youtube.com URLs
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url; // Return original URL if not a YouTube link
  } catch {
    return url; // Fallback to original URL if parsing fails
  }
};

// Sub-Components
const ActionButtons: React.FC<ActionButtonsProps> = ({ eventId, eventCategory, onDeleteSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/api/events/${eventId}`);
      toast.success('Event deleted successfully!');
      onDeleteSuccess();
    } catch {
      toast.error('Failed to delete event.');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }, [eventId, onDeleteSuccess]);

  return (
    <div className="relative flex items-center gap-2">
      <Link to={`/edit/our-event/${eventId}`} className="p-1 text-blue-500 hover:text-blue-600" aria-label={`Edit ${eventCategory}`}>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </Link>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className={`p-1 ${isDeleting ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:text-red-600'}`}
        aria-label={`Delete ${eventCategory}`}
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete the event "{eventCategory}"?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">No</button>
              <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DescriptionCell: React.FC<{ value: string | null }> = ({ value }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100;
  if (!value) return <span className="text-gray-500 text-xs">No Description</span>;

  const isLong = value.length > maxLength;
  const truncatedText = isLong ? `${value.slice(0, maxLength)}...` : value;

  return (
    <div className="text-sm text-gray-700">
      {isExpanded ? value : truncatedText}
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-blue-500 hover:text-blue-600 text-xs font-medium"
          aria-label={isExpanded ? 'Collapse description' : 'Expand description'}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
};

const MediaModal: React.FC<{ url: string; type: MediaType; onClose: () => void }> = ({ url, type, onClose }) => {
  const embedUrl = type === 'video' ? getYouTubeEmbedUrl(url) : url;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative bg-white rounded-lg p-4 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          aria-label="Close media modal"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {type === 'image' ? (
          <img
            src={url}
            alt="Full-size event image"
            className="w-full h-auto max-h-[80vh] object-contain rounded"
            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Error')}
          />
        ) : (
          <iframe
            src={embedUrl || url}
            className="w-full h-[80vh] rounded"
            title="Event video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

// Main Component
const OurEvents: React.FC = () => {
  const [data, setData] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: MediaType } | null>(null);

  const mapEventData = useCallback((events: EventApiResponse['events']): EventData[] => {
    return events.map((event) => ({
      eventId: event.event_id,
      eventCategory: event.event_category,
      description: event.description ?? null,
      imgFile: event.img_file ?? null,
      videoLink: event.video_link ?? null,
      createdAt: event.created_at,
    }));
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<EventApiResponse>('/api/events');
      if (!response.data.events) {
        throw new Error('Invalid API response: events array is missing');
      }
      setData(mapEventData(response.data.events));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch events';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [mapEventData]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const columns = useMemo<Column<EventData>[]>(
    () => [
      { Header: '#', Cell: ({ row }) => row.index + 1 },
      { Header: 'Category', accessor: 'eventCategory' },
      { Header: 'Description', accessor: 'description', Cell: ({ value }) => <DescriptionCell value={value} /> },
      {
        Header: 'Image',
        accessor: 'imgFile',
        Cell: ({ value }: { value: string | null }) => {
          const imageUrl = constructFileUrl(value);
          if (!imageUrl) return <span className="text-gray-500 text-xs">No Image</span>;
          return (
            <button
              onClick={() => setSelectedMedia({ url: imageUrl, type: 'image' })}
              className="focus:outline-none"
              aria-label="View full-size image"
            >
              <img
                src={imageUrl}
                alt="Event thumbnail"
                className="h-16 w-16 object-cover rounded cursor-pointer hover:opacity-80 transition"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64x64?text=Error')}
              />
            </button>
          );
        },
      },
      {
        Header: 'Video',
        accessor: 'videoLink',
        Cell: ({ value }: { value: string | null }) => {
          if (!value) return <span className="text-gray-500 text-xs">No Video</span>;
          return (
            <button
              onClick={() => setSelectedMedia({ url: value, type: 'video' })}
              className="text-blue-500 hover:text-blue-600 hover:underline text-sm font-medium"
              aria-label="View event video"
            >
              View Video
            </button>
          );
        },
      },
      { Header: 'Created At', accessor: 'createdAt', Cell: ({ value }) => new Date(value).toLocaleDateString() },
      {
        Header: 'Actions',
        accessor: 'eventId',
        Cell: ({ row }) => (
          <ActionButtons eventId={row.original.eventId} eventCategory={row.original.eventCategory} onDeleteSuccess={fetchEvents} />
        ),
      },
    ],
    [fetchEvents]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable<EventData>({ columns, data, initialState: { pageIndex: 0, pageSize: 10 } }, useGlobalFilter, usePagination);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.text('Event Records', 20, 10);
    autoTable(doc, {
      head: [['#', 'Category', 'Description', 'Created At']],
      body: data.map((row, index) => [index + 1, row.eventCategory, row.description || 'N/A', new Date(row.createdAt).toLocaleDateString()]),
    });
    doc.save('event_records.pdf');
    toast.success('PDF exported successfully!');
  }, [data]);

  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, index) => ({
        '#': index + 1,
        Category: row.eventCategory,
        Description: row.description || 'N/A',
        'Created At': new Date(row.createdAt).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');
    XLSX.writeFile(workbook, 'event_records.xlsx');
    toast.success('Excel exported successfully!');
  }, [data]);

  if (loading) return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading...</div>;
  if (error && data.length === 0) return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
      <div className="text-red-500 text-xl font-semibold mb-4">Error</div>
      <p className="text-gray-700 mb-4">{error}</p>
      <button
        onClick={fetchEvents}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop theme="colored" />
      {selectedMedia && <MediaModal url={selectedMedia.url} type={selectedMedia.type} onClose={() => setSelectedMedia(null)} />}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Event Management</h2>
          <Link
            to="/add/our-event"
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search records..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            aria-label="Search events"
          />
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              aria-label="Export events to PDF"
            >
              Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              aria-label="Export events to Excel"
            >
              Export Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full">
            <thead className="bg-gray-50">
              {headerGroups.map((hg) => (
                <tr {...hg.getHeaderGroupProps()}>
                  {hg.headers.map((col) => (
                    <th
                      {...col.getHeaderProps()}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
              {page.length > 0 ? (
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="hover:bg-gray-50 transition-colors">
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="px preoccupation-top">
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data.length > 10 && page.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition"
                aria-label="Previous page"
              >
                Previous
              </button>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
            <div className="text-sm text-gray-700">
              Page <span className="font-medium">{pageIndex + 1}</span> of{' '}
              <span className="font-medium">{pageOptions.length}</span>
            </div>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Select rows per page"
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default OurEvents;