
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, useGlobalFilter, usePagination, Column, Row } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../axios'; // Make sure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Interfaces for Type Safety ---
interface MclGroupData {
  mcl_id: number;
  mcl_category: string;
  description: string | null;
  weblink: string | null;
  image_file: string | null;
  created_at: string;
}

interface ActionButtonsProps {
  mclId: number;
  onDeletionSuccess: () => void;
}

// --- Sub-Components for Cleanliness ---

const ActionButtons: React.FC<ActionButtonsProps> = ({ mclId, onDeletionSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/mcl-groups/${mclId}`);
      toast.success('MCL Group deleted successfully!');
      onDeletionSuccess();
    } catch (err) {
      toast.error('Failed to delete MCL Group.');
    }
    setShowConfirm(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      <Link to={`/edit-mcl-group/${mclId}`} className="p-1 text-blue-500 hover:text-blue-600" aria-label="Edit">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
      </Link>
      <button onClick={() => setShowConfirm(true)} className="p-1 text-red-500 hover:text-red-600" aria-label="Delete">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this MCL Group?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">No</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
    <div className="relative bg-white rounded-lg p-2" onClick={(e) => e.stopPropagation()}>
      <img src={imageUrl} alt="Full-size view" className="w-full h-auto max-h-[80vh] object-contain rounded" />
      <button onClick={onClose} className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1">×</button>
    </div>
  </div>
);

// --- Main List Component ---
export default function MclGroupList() {
  const [data, setData] = useState<MclGroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchMclGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/mcl-groups');
      
      // *** THE FIX IS HERE ***
      // Your API returns { "data": [...] }, so we access `response.data.data`.
      // The `|| []` ensures that if `response.data.data` is null or undefined,
      // we pass an empty array to `setData`, preventing the "forEach" error.
      setData(response.data.data || []);
      
    } catch (err: any) {
      const errorMessage = 'Failed to fetch MCL Groups. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
      setData([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMclGroups();
  }, [fetchMclGroups]);

  const columns: readonly Column<MclGroupData>[] = useMemo(
    () => [
      { Header: '#', Cell: ({ row }: { row: Row<MclGroupData> }) => <span>{row.index + 1}</span> },
      { Header: 'Category', accessor: 'mcl_category' },
      { Header: 'Description', accessor: 'description', Cell: ({ value }) => value ? <span className="text-sm">{value.substring(0, 50)}{value.length > 50 ? '...' : ''}</span> : <span className="text-gray-400">N/A</span> },
      { Header: 'Weblink', accessor: 'weblink', Cell: ({ value }) => value ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a> : <span className="text-gray-400">N/A</span> },
      {
        Header: 'Image',
        accessor: 'image_file',
        Cell: ({ value }) => {
          if (!value) return <span className="text-gray-400">No Image</span>;
          const baseUrl = (axiosInstance.defaults.baseURL || '').replace(/\/$/, '');
          const imageUrl = `${baseUrl}/${value.replace(/^\//, '')}`;
          return <img src={imageUrl} alt="MCL Group" className="h-12 w-12 object-cover rounded cursor-pointer" onClick={() => setSelectedImage(imageUrl)} onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/50' }} />;
        },
      },
      { Header: 'Created At', accessor: 'created_at', Cell: ({ value }) => new Date(value).toLocaleDateString() },
      {
        Header: 'Actions',
        accessor: 'mcl_id',
        Cell: ({ row }) => <ActionButtons mclId={row.original.mcl_id} onDeletionSuccess={fetchMclGroups} />,
      },
    ],
    [fetchMclGroups]
  );

  const tableInstance = useTable({ columns, data }, useGlobalFilter, usePagination);
  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow, setGlobalFilter, state: { globalFilter } } = tableInstance;

  const exportToPDF = () => { /* PDF logic here... */ };
  const exportToExcel = () => { /* Excel logic here... */ };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button onClick={fetchMclGroups} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
      
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">MCL Group Management</h2>
          <Link to="/add/mcl-group" className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md">
            Create MCL Group
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          />
          <div className="flex gap-2">
            <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">PDF</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Excel</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => <th {...column.getHeaderProps()} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{column.render('Header')}</th>)}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {page.length > 0 ? (
                page.map(row => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="hover:bg-gray-50">
                      {row.cells.map(cell => <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cell.render('Cell')}</td>)}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10 text-gray-500">No MCL Groups found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination controls can be added here if needed */}
      </div>
    </div>
  );
}