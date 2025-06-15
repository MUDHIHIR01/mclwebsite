import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTable, useGlobalFilter, usePagination } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface OurStandardHomeData {
  id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
  created_at: string;
}

interface ApiResponse {
  message: string;
  data: {
    our_standard_homes?: OurStandardHomeData[];
  };
  error?: string;
}

interface ActionButtonsProps {
  id: number;
  onDeletionSuccess: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ id, onDeletionSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await axiosInstance.delete<ApiResponse>(`/api/our-standard-home/${id}`);
      toast.success(response.data.message, { position: 'top-right' });
      onDeletionSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete entry', { position: 'top-right' });
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        to={`/edit/our-standards/${id}`}
        className="p-2 text-blue-600 hover:text-blue-700"
        aria-label="Edit entry"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </Link>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 text-red-600 hover:text-red-700"
        aria-label="Delete entry"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this entry?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
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

  if (!value) return <span className="text-gray-500 text-sm">No Description</span>;

  const truncatedText = value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

  return (
    <div className="text-sm text-gray-700">
      {isExpanded ? value : truncatedText}
      {value.length > maxLength && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-blue-600 hover:text-blue-700 text-sm"
          aria-label={isExpanded ? 'Collapse description' : 'Expand description'}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
};

const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative bg-white rounded-lg p-4 w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={imageUrl}
          alt="Full-size image"
          className="w-full h-auto max-h-[80vh] object-contain rounded"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
            e.currentTarget.alt = 'Image load error';
          }}
        />
      </div>
    </div>
  );
};

const ViewOurStandardHome: React.FC = () => {
  const [data, setData] = useState<OurStandardHomeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ApiResponse>('/api/our-standard-home');
      const records = response.data.data.our_standard_homes || [];
      setData(records);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch entries';
      setError(errorMessage);
      setData([]);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo(
    () => [
      {
        Header: '#',
        id: 'rowIndex',
        Cell: ({ row, flatRows }: any) => flatRows.indexOf(row) + 1,
      },
      { Header: 'Heading', accessor: 'heading' },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ value }: { value: string | null }) => <DescriptionCell value={value} />,
      },
      {
        Header: 'Image',
        accessor: 'home_img',
        Cell: ({ value }: { value: string | null }) => {
          if (!value) return <span className="text-gray-500 text-sm">No Image</span>;
          const imageUrl = `${axiosInstance.defaults.baseURL?.replace(/\/$/, '')}/${value}`;
          return (
            <button
              onClick={() => setSelectedImage(imageUrl)}
              aria-label="View image"
            >
              <img
                src={imageUrl}
                alt="Entry image"
                className="h-16 w-16 object-cover rounded hover:opacity-80"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/64x64?text=Image+Not+Found';
                  e.currentTarget.alt = 'Image load error';
                }}
              />
            </button>
          );
        },
      },
      {
        Header: 'Created At',
        accessor: 'created_at',
        Cell: ({ value }: { value: string }) =>
          new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      },
      {
        Header: 'Actions',
        accessor: 'id',
        Cell: ({ row }: any) => (
          <ActionButtons id={row.original.id} onDeletionSuccess={fetchData} />
        ),
      },
    ],
    [fetchData]
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
    state: { pageIndex, pageSize },
    setGlobalFilter: setTableGlobalFilter,
  } = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 10 } },
    useGlobalFilter,
    usePagination
  );

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.text('Our Standard Home Entries', 20, 10);
    autoTable(doc, {
      head: [['#', 'Heading', 'Description', 'Created At']],
      body: data.map((row, index) => [
        index + 1,
        row.heading,
        row.description || 'No Description',
        new Date(row.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      ]),
    });
    doc.save('our_standard_home_entries.pdf');
    toast.success('PDF exported successfully', { position: 'top-right' });
  }, [data]);

  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, index) => ({
        '#': index + 1,
        Heading: row.heading,
        Description: row.description || 'No Description',
        'Created At': new Date(row.created_at).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OurStandardHome');
    XLSX.writeFile(workbook, 'our_standard_home_entries.xlsx');
    toast.success('Excel exported successfully', { position: 'top-right' });
  }, [data]);

  useEffect(() => {
    setTableGlobalFilter(globalFilter);
  }, [globalFilter, setTableGlobalFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-lg text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="text-red-600 text-xl font-semibold">Error</div>
        <p className="text-gray-700 my-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">Our Standard Home Management</h2>
          <Link
            to="/add/our-standards/home"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Entry
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search entries..."
            className="px-4 py-2 w-full sm:w-64 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full border rounded-lg">
            <thead className="bg-gray-50">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
              {page.length ? (
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="hover:bg-gray-50">
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="px-4 py-4 text-sm text-gray-700">
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:text-gray-500 hover:bg-blue-700"
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={!canNextPage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:text-gray-500 hover:bg-blue-700"
              >
                Next
              </button>
            </div>
            <span className="text-sm text-gray-700">
              Page <span className="font-semibold">{pageIndex + 1}</span> of{' '}
              <span className="font-semibold">{pageOptions.length}</span>
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 border rounded-lg bg-gray-50"
            >
              {[5, 10, 20].map((size) => (
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

export default ViewOurStandardHome;