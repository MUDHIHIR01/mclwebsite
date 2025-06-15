import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, useGlobalFilter, usePagination, Row, Column, CellProps } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- INTERFACES ---
interface WhatWeDo {
  what_we_do_id: number;
  category: string;
  description: string;
  img_file: string;
  created_at: string;
  updated_at: string;
}

interface SubCategory {
  subcategory_id: number;
  subcategory: string;
  what_we_do_id: string;
  description: string | null;
  img_url: string | null;
  web_url: string | null;
  created_at: string;
  updated_at: string;
  what_we_do: WhatWeDo;
}

// --- ACTION BUTTONS COMPONENT ---
interface ActionButtonsProps {
  subcategoryId: number;
  onDeletionSuccess: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ subcategoryId, onDeletionSuccess }) => {
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/subcategories/${subcategoryId}`);
      toast.success('Subcategory deleted successfully!');
      onDeletionSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete subcategory.');
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      <Link
        to={`/subcategories/we-do/edit/${subcategoryId}`}
        className="p-1 text-blue-500 hover:text-blue-600"
        aria-label="Edit"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </Link>
      <button
        onClick={() => setShowConfirm(true)}
        className="p-1 text-red-500 hover:text-red-600"
        aria-label="Delete"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this subcategory?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                No
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- REUSABLE CELL COMPONENTS ---
const DescriptionCell: React.FC<{ value: string | null }> = ({ value }) => (
  <span className="text-sm text-gray-700">
    {value ? (
      value.length > 100 ? (
        <span>{value.slice(0, 100)}...</span>
      ) : (
        value
      )
    ) : (
      <span className="text-gray-500">No Description</span>
    )}
  </span>
);

const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="relative max-w-3xl w-full">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white text-2xl focus:outline-none"
        aria-label="Close"
      >
        &times;
      </button>
      <img src={imageUrl} alt="Full-size" className="w-full h-auto rounded-lg" />
    </div>
  </div>
);

const ImageCell: React.FC<{ value: string | null; onImageClick: (url: string) => void }> = ({
  value,
  onImageClick,
}) => {
  if (!value) return <span className="text-gray-500 text-xs">No Image</span>;
  // Ensure the image URL is absolute by prepending the base URL
  const imageUrl = value.startsWith('http')
    ? value
    : `${axiosInstance.defaults.baseURL?.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
  return (
    <button
      onClick={() => onImageClick(imageUrl)}
      className="focus:outline-none"
      aria-label="View full-size image"
    >
      <img
        src={imageUrl}
        alt="Subcategory"
        className="h-16 w-16 object-cover rounded cursor-pointer hover:opacity-80 transition"
        onError={(e) => {
          e.currentTarget.src = 'https://via.placeholder.com/64x64?text=Error';
        }}
      />
    </button>
  );
};

// --- MAIN COMPONENT ---
const SubCategoryWeDo: React.FC = () => {
  const [data, setData] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchSubCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ subcategories: SubCategory[] }>('/api/subcategories');
      const validData = (response.data.subcategories || []).filter((sub) => sub.what_we_do);
      setData(validData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch subcategories.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubCategories();
  }, [fetchSubCategories]);

  const columns: readonly Column<SubCategory>[] = useMemo(
    () => [
      {
        Header: '#',
        id: 'rowIndex',
        Cell: ({ row, flatRows }: CellProps<SubCategory>) =>
          flatRows.findIndex((flatRow) => flatRow.original.subcategory_id === row.original.subcategory_id) + 1,
      },
      { Header: 'Subcategory', accessor: 'subcategory' },
      { Header: 'Category', accessor: 'what_we_do.category' },
      { Header: 'Description', accessor: 'description', Cell: ({ value }) => <DescriptionCell value={value} /> },
      {
        Header: 'Image',
        accessor: 'img_url',
        Cell: ({ value }) => <ImageCell value={value} onImageClick={setSelectedImage} />,
      },
      {
        Header: 'Web URL',
        accessor: 'web_url',
        Cell: ({ value }) =>
          value ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Visit Link
            </a>
          ) : (
            <span className="text-gray-500 text-xs">No Link</span>
          ),
      },
      {
        Header: 'Created At',
        accessor: 'created_at',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }: CellProps<SubCategory>) => (
          <ActionButtons
            subcategoryId={row.original.subcategory_id}
            onDeletionSuccess={fetchSubCategories}
          />
        ),
      },
    ],
    [fetchSubCategories]
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
  } = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 10 } },
    useGlobalFilter,
    usePagination
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [columns.map((col) => col.Header as string).filter((header) => header !== 'Actions')],
      body: data.map((row) => [
        row.subcategory,
        row.what_we_do.category,
        row.description || 'No Description',
        row.img_url ? 'Image Available' : 'No Image',
        row.web_url || 'No Link',
        new Date(row.created_at).toLocaleDateString(),
      ]),
    });
    doc.save('subcategories.pdf');
  };

  const exportToExcel = () => {
    const wsData = [
      columns.map((col) => col.Header as string).filter((header) => header !== 'Actions'),
      ...data.map((row) => [
        row.subcategory,
        row.what_we_do.category,
        row.description || 'No Description',
        row.img_url || 'No Image',
        row.web_url || 'No Link',
        new Date(row.created_at).toLocaleDateString(),
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Subcategories');
    XLSX.write(wb, 'subcategories.xlsx');
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );

  if (error && data.length === 0)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="text-red-500 text-xl font-semibold mb-4">Error</div>
        <p className="text-gray-700 mb-2">{error}</p>
        <button
          onClick={fetchSubCategories}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Try Again
        </button>
      </div>
    );

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop theme="colored" />
      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Subcategory Management</h2>
          <Link
            to="/subcategories/we-do/add"
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Subcategory
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search entries..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table
            {...getTableProps()}
            className="w-full divide-y divide-gray-200 border border-gray-200 rounded-lg"
          >
            <thead className="bg-gray-50">
              {headerGroups.map((headerGroup) => {
                const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
                return (
                  <tr key={key} {...restHeaderGroupProps}>
                    {headerGroup.headers.map((column) => {
                      const { key: colKey, ...restColumnProps } = column.getHeaderProps();
                      return (
                        <th
                          key={colKey}
                          {...restColumnProps}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column.render('Header')}
                        </th>
                      );
                    })}
                  </tr>
                );
              })}
            </thead>
            <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
              {page.length > 0 ? (
                page.map((row: Row<SubCategory>) => {
                  prepareRow(row);
                  const { key, ...restRowProps } = row.getRowProps();
                  return (
                    <tr
                      key={key}
                      {...restRowProps}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {row.cells.map((cell) => {
                        const { key: cellKey, ...restCellProps } = cell.getCellProps();
                        return (
                          <td
                            key={cellKey}
                            {...restCellProps}
                            className="px-4 py-4 text-sm text-gray-700"
                          >
                            {cell.render('Cell')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-10 text-gray-500"
                  >
                    No subcategories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data.length > 10 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className={`px-4 py-2 rounded-lg ${
                  canPreviousPage
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page{' '}
                <strong>
                  {pageIndex + 1} of {pageOptions.length}
                </strong>
              </span>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className={`px-4 py-2 rounded-lg ${
                  canNextPage
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubCategoryWeDo;