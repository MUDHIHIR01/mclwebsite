import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, useGlobalFilter, usePagination, Row, Column, CellProps } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface WedoRow {
  what_we_do_id: number;
  category: string;
  description?: string;
  img_file?: string;
  created_at: string;
  updated_at?: string;
}

interface ActionButtonsProps {
  whatWeDoId: number;
  onDeleteSuccess: () => void;
}

const ActionButton: React.FC<ActionButtonsProps> = ({ whatWeDoId, onDeleteSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/we-do/${whatWeDoId}`);
      toast.success('Category deleted successfully!', { position: 'top-right' });
      onDeleteSuccess();
    } catch (error: any) {
      toast.error('Failed to delete category.', { position: 'top-right' });
      console.error('Delete error:', error);
    }
    setShowConfirm(false);
  };

  return (
    <div className="flex items-center gap-2 relative">
      <Link to={`/edit/We-do/${whatWeDoId}`} className="p-2 text-blue-500 hover:text-blue-600 transition-colors" aria-label="Edit category">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793-.793-2.828-2.828.793-.793zM11.379 5.828L3 14.172V17h2.828l8.379-8.379-2.828-2.828z" />
        </svg>
      </Link>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-2 text-red-500 hover:text-red-600 transition-colors"
        aria-label="Delete category"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 0 00-1 1v6a1 1 0 102 0V8a1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this category?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

const DescriptionCell: React.FC<{ value?: string }> = ({ value }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100;

  if (!value) return <span className="text-gray-500 text-sm">No description</span>;

  const truncatedText = value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

  return (
    <div className="text-sm text-gray-700">
      {isExpanded ? value : truncatedText}
      {value.length > maxLength && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-blue-500 hover:text-blue-600 text-xs font-medium"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

const ImageCell: React.FC<{ value?: string }> = ({ value }) => {
  const [showModal, setShowModal] = useState(false);
  const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
  const imageUrl = value ? `${baseUrl}/${value.replace(/^\//, '')}` : undefined;

  if (!value || !imageUrl) return <span className="text-gray-500 text-sm">No image</span>;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="focus:outline-none"
        aria-label="View image"
      >
        <img
          src={imageUrl}
          alt="Category image"
          className="h-16 w-16 object-cover rounded cursor-pointer hover:opacity-80 transition"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/64x64?text=Error';
            target.alt = 'Image load error';
          }}
        />
      </button>
      {showModal && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowModal(false)}
        >
          <div className="relative bg-white rounded-lg p-4 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={imageUrl}
              alt="Full-size category image"
              className="w-full h-auto max-h-[80vh] object-contain rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/300x300?text=Error';
                target.alt = 'Image load error';
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

const Wedo: React.FC = () => {
  const [data, setData] = useState<WedoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/we-do');
      setData(response.data.records || response.data || []);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch categories';
      setError(errorMessage);
      toast.error(errorMessage, { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo<Column<WedoRow>[]>(
    () => [
      {
        Header: '#',
        id: 'index',
        Cell: ({ row, flatRows }: CellProps<WedoRow>) => flatRows.indexOf(row) + 1,
      },
      { Header: 'Category', accessor: 'category', Cell: ({ value }) => <span className="text-sm">{value}</span> },
      { Header: 'Description', accessor: 'description', Cell: DescriptionCell },
      { Header: 'Image', accessor: 'img_file', Cell: ImageCell },
      {
        Header: 'Created At',
        accessor: 'created_at',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }: CellProps<WedoRow>) => (
          <ActionButton whatWeDoId={row.original.what_we_do_id} onDeleteSuccess={fetchData} />
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
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable<WedoRow>(
    { columns, data, initialState: { pageIndex: 0, pageSize: 10 } },
    useGlobalFilter,
    usePagination
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('What We Do Categories', 20, 10);
    autoTable(doc, {
      head: [['#', 'Category', 'Description', 'Created At']],
      body: data.map((row, index) => [
        index + 1,
        row.category,
        row.description || 'None',
        new Date(row.created_at).toLocaleDateString(),
      ]),
    });
    doc.save('what_we_do_categories.pdf');
    toast.success('PDF exported successfully!', { position: 'top-right' });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, index) => ({
        '#': index + 1,
        Category: row.category,
        Description: row.description || 'None',
        'Created At': new Date(row.created_at).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
    XLSX.writeFile(workbook, 'what_we_do_categories.xlsx');
    toast.success('Excel exported successfully!', { position: 'top-right' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="text-red-600 text-xl font-semibold mb-4">Error</div>
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">What We Do Management</h2>
          <Link
            to="/add/We-do"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Category
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">{error}</div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search categories..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full border border-gray-200 rounded-lg divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps()}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {page.length > 0 ? (
                page.map((row: Row<WedoRow>) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="hover:bg-gray-50 transition-colors">
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
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-500 text-sm">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data.length > 0 && page.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
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
            >
              {[5, 10, 20, 30, 50].map((size) => (
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

export default Wedo;