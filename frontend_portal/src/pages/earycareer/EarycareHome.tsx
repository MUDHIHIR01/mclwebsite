import React, { useMemo, useState, useEffect, useCallback } from 'react';
// **FIX 1: Import `Column` and `CellProps` from react-table**
import { useTable, useGlobalFilter, usePagination, Column, CellProps } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Types
interface EarycareHomeData {
  earycare_id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
  created_at: string;
  updated_at?: string;
}

// Utility Functions
const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) return 'https://via.placeholder.com/64x64?text=No+Image';
  const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
  return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
};

// Components
const ActionButtons: React.FC<{ earycare_id: number; onDelete: () => void }> = React.memo(({ earycare_id, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/earycare-home/${earycare_id}`);
      toast.success('Entry deleted successfully!', { position: 'top-right' });
      onDelete();
    } catch (err) {
      toast.error('Failed to delete entry.', { position: 'top-right' });
      console.error('Delete error:', err);
    }
    setShowConfirm(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Link to={`/edit/earycarehome/${earycare_id}`} className="p-1 text-blue-500 hover:text-blue-600" aria-label="Edit">
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
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this entry?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">No</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const DescriptionCell: React.FC<{ value: string | null }> = React.memo(({ value }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100;

  if (!value) return <span className="text-gray-500 text-xs">No Description</span>;

  const truncatedText = value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

  return (
    <div className="text-sm text-gray-700">
      {isExpanded ? value : truncatedText}
      {value.length > maxLength && (
        <button onClick={() => setIsExpanded(!isExpanded)} className="ml-2 text-blue-500 hover:text-blue-600 text-xs font-medium">
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
});

const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = React.memo(({ imageUrl, onClose }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" role="dialog" aria-modal="true" onClick={onClose}>
    <div className="relative bg-white rounded-lg p-4 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800" aria-label="Close modal">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img src={imageUrl} alt="Full-size image" className="w-full h-auto max-h-[80vh] object-contain rounded" />
    </div>
  </div>
));

const EarycareHome: React.FC = () => {
  const [data, setData] = useState<EarycareHomeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<EarycareHomeData[]>('/api/earycare-home');
      setData(response.data);
    } catch (err: any) {
      setError(`Failed to fetch entries: ${err.response?.data?.message || err.message}`);
      toast.error('Failed to fetch entries.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // **FIX 2: Add the explicit type annotation for the columns array.**
  const columns: readonly Column<EarycareHomeData>[] = useMemo(
    () => [
      {
        Header: '#',
        // **FIX 3: Improve typing for Cell props.**
        Cell: ({ row }: CellProps<EarycareHomeData>) => row.index + 1,
      },
      { Header: 'Heading', accessor: 'heading' },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ value }: CellProps<EarycareHomeData, string | null>) => <DescriptionCell value={value} />,
      },
      {
        Header: 'Image',
        accessor: 'home_img',
        Cell: ({ value }: CellProps<EarycareHomeData, string | null>) =>
          value ? (
            <button onClick={() => setSelectedImage(getImageUrl(value))} className="focus:outline-none" aria-label="View image">
              <img src={getImageUrl(value)} alt="Earycare home item" className="h-16 w-16 object-cover rounded cursor-pointer hover:opacity-80" />
            </button>
          ) : (
            <span className="text-gray-500 text-xs">No Image</span>
          ),
      },
      {
        Header: 'Created At',
        accessor: 'created_at',
        Cell: ({ value }: CellProps<EarycareHomeData, string>) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Actions',
        accessor: 'earycare_id',
        Cell: ({ row }: CellProps<EarycareHomeData>) => <ActionButtons earycare_id={row.original.earycare_id} onDelete={fetchData} />,
      },
    ],
    [fetchData]
  );

  // This hook will now receive the correctly typed 'columns' and the error will be resolved.
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
  } = useTable({ columns, data, initialState: { pageSize: 10 } }, useGlobalFilter, usePagination);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.text('Earycare Home Entries', 20, 10);
    autoTable(doc, {
      head: [['#', 'Heading', 'Description', 'Created At']],
      body: data.map((row, index) => [
        index + 1,
        row.heading,
        row.description || 'No Description',
        new Date(row.created_at).toLocaleDateString(),
      ]),
    });
    doc.save('earycare_home_entries.pdf');
    toast.success('PDF exported successfully!', { position: 'top-right' });
  }, [data]);

  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, index) => ({
        '#': index + 1,
        Heading: row.heading,
        Description: row.description || 'No Description',
        'Created At': new Date(row.created_at).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'EarycareHomes');
    XLSX.writeFile(workbook, 'earycare_home_entries.xlsx');
    toast.success('Excel exported successfully!', { position: 'top-right' });
  }, [data]);

  if (loading) return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading...</div>;

  if (error && !data.length)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="text-red-500 text-xl font-semibold mb-4">Error</div>
        <p className="text-gray-700 mb-4">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Retry</button>
      </div>
    );

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">Eary career Home Management</h2>
          <Link to="/add/earycare/home" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Eary career Home
          </Link>
        </div>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search entries..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
          <div className="flex gap-2">
            <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">PDF</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Excel</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()} className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.length ? (
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="hover:bg-gray-50">
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="px-6 py-4 text-sm text-gray-700">
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10 text-gray-500">
                    No entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex gap-2">
              <button
                onClick={previousPage}
                disabled={!canPreviousPage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600"
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={!canNextPage}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600"
              >
                Next
              </button>
            </div>
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{pageIndex + 1}</span> of <span className="font-medium">{pageOptions.length}</span>
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

export default EarycareHome;