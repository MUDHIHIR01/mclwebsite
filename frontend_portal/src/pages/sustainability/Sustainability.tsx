import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, useGlobalFilter, usePagination, Row, Column, CellProps } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SustainabilityData {
  sustain_id: number;
  sustain_category: string;
  description: string | null;
  weblink: string | null;
  sustain_pdf_file: string | null;
  sustain_image_file: string | null;
  created_at: string;
  updated_at?: string;
}

// REFINEMENT 1: Define an interface for the API response object.
// This assumes your API wraps the array of data in a 'data' key.
interface ApiResponse {
  data: SustainabilityData[];
}


interface ActionButtonsProps {
  sustainabilityId: number;
  onDeletionSuccess: () => void;
}

// ... (ActionButtons, DescriptionCell, FileCell, WeblinkCell components remain the same) ...
const ActionButtons: React.FC<ActionButtonsProps> = ({ sustainabilityId, onDeletionSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/sustainability/${sustainabilityId}`);
      toast.success('Sustainability record deleted successfully!', { position: 'top-right' });
      onDeletionSuccess();
    } catch (err) {
      toast.error('Failed to delete sustainability record.', { position: 'top-right' });
      console.error('Delete error:', err);
    }
    setShowConfirm(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      <Link to={`/edit-sustainability/${sustainabilityId}`} className="p-1 text-blue-500 hover:text-blue-600" aria-label="Edit">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </Link>
      <button onClick={() => setShowConfirm(true)} className="p-1 text-red-500 hover:text-red-600" aria-label="Delete">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this sustainability record?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">No</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Yes, Delete</button>
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

  const truncatedText = value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

  return (
    <div className="text-sm text-gray-700">
      {isExpanded ? value : truncatedText}
      {value.length > maxLength && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-blue-500 hover:text-blue-600 text-xs font-medium"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
};

const FileCell: React.FC<{ value: string | null; type: 'pdf' | 'image' }> = ({ value, type }) => {
  if (!value) return <span className="text-gray-500 text-xs">No {type === 'pdf' ? 'PDF' : 'Image'}</span>;
  const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
  const fileUrl = `${baseUrl}/${value.replace(/^\//, '')}`;
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:text-blue-600 underline text-sm"
    >
      {type === 'pdf' ? 'View PDF' : 'View Image'}
    </a>
  );
};

const WeblinkCell: React.FC<{ value: string | null }> = ({ value }) => {
  if (!value) return <span className="text-gray-500 text-xs">No Link</span>;
  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:text-blue-600 underline text-sm"
    >
      Visit Link
    </a>
  );
};


export default function Sustainability() {
  const [data, setData] = useState<SustainabilityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSustainability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // REFINEMENT 2: Use the new ApiResponse interface for the get request.
      const response = await axiosInstance.get<ApiResponse>('/api/sustainability');
      // FIX: Access the 'data' property on the response object, with a fallback to an empty array.
      setData(response.data.data || []);
    } catch (err: any) {
      const errorMessage = 'Failed to fetch sustainability records: ' + (err.response?.data?.error || err.message || 'Unknown error');
      setError(errorMessage);
      toast.error('Failed to fetch sustainability records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSustainability();
  }, [fetchSustainability]);

  const columns: readonly Column<SustainabilityData>[] = useMemo(
    () => [
      {
        Header: '#',
        id: 'rowIndex',
        Cell: ({ row, flatRows }: CellProps<SustainabilityData>) => {
          const originalIndex = flatRows.findIndex(flatRow => flatRow.original === row.original);
          return <span>{originalIndex + 1}</span>;
        },
      },
      { Header: 'Category', accessor: 'sustain_category' },
      { Header: 'Description', accessor: 'description', Cell: ({ value }) => <DescriptionCell value={value} /> },
      { Header: 'Web Link', accessor: 'weblink', Cell: ({ value }) => <WeblinkCell value={value} /> },
      { Header: 'PDF File', accessor: 'sustain_pdf_file', Cell: ({ value }) => <FileCell value={value} type="pdf" /> },
      { Header: 'Image File', accessor: 'sustain_image_file', Cell: ({ value }) => <FileCell value={value} type="image" /> },
      {
        Header: 'Created At',
        accessor: 'created_at',
        Cell: ({ value }: CellProps<SustainabilityData, string>) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Actions',
        accessor: 'sustain_id',
        Cell: ({ row }: CellProps<SustainabilityData>) => (
          <ActionButtons sustainabilityId={row.original.sustain_id} onDeletionSuccess={fetchSustainability} />
        ),
      },
    ],
    [fetchSustainability]
  );

  // ... (rest of the component, including table instance and JSX, remains the same) ...
  const tableInstance = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 10 } },
    useGlobalFilter,
    usePagination
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
  } = tableInstance;

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Sustainability Records', 20, 10);
    autoTable(doc, {
      head: [['#', 'Category', 'Description', 'Web Link', 'PDF File', 'Image File', 'Created At']],
      body: data.map((row, index) => [
        index + 1,
        row.sustain_category,
        row.description || 'None',
        row.weblink || 'None',
        row.sustain_pdf_file ? 'Available' : 'None',
        row.sustain_image_file ? 'Available' : 'None',
        new Date(row.created_at).toLocaleDateString(),
      ]),
    });
    doc.save('sustainability_records.pdf');
    toast.success('PDF exported successfully!');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, index) => ({
        '#': index + 1,
        Category: row.sustain_category,
        Description: row.description || 'None',
        'Web Link': row.weblink || 'None',
        'PDF File': row.sustain_pdf_file ? 'Available' : 'None',
        'Image File': row.sustain_image_file ? 'Available' : 'None',
        'Created At': new Date(row.created_at).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sustainability');
    XLSX.writeFile(workbook, 'sustainability_records.xlsx');
    toast.success('Excel exported successfully!');
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="text-lg font-semibold">Loading...</div></div>;

  if (error && data.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="text-red-500 text-xl font-semibold mb-4">Error</div>
        <p className="text-gray-700 mb-2">{error}</p>
        <button
          onClick={fetchSustainability}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Sustainability Management</h2>
          <Link to="/add/sustainability" className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Sustainability
          </Link>
        </div>

        {error && !loading && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">{error}</div>}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search entries..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
          <div className="flex gap-2">
            <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Export PDF</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">Export Excel</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()} className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
              {page.length > 0 ? (
                page.map((row: Row<SustainabilityData>) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="hover:bg-gray-50 transition-colors">
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="px-2 sm:px-4 py-4 text-sm text-gray-700">
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={columns.length} className="text-center py-10 text-gray-500">No sustainability records found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {data.length > 0 && page.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex gap-2">
              <button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition">Previous</button>
              <button onClick={() => nextPage()} disabled={!canNextPage} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition">Next</button>
            </div>
            <div className="text-sm text-gray-700">
              Page <span className="font-medium">{pageIndex + 1}</span> of <span className="font-medium">{pageOptions.length}</span>
            </div>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[5, 10, 20, 30, 50].map((size) => (<option key={size} value={size}>Show {size}</option>))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}