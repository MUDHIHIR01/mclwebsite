import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, useGlobalFilter, usePagination, Row, Column, CellProps } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../axios';

interface GivingBackData {
  giving_id: number;
  givingBack_category: string;
  description: string | null;
  weblink: string | null;
  image_slider: string | null;
  created_at: string;
  updated_at?: string;
}

interface ApiResponse {
  giving_back: GivingBackData[];
}

interface ActionButtonsProps {
  givingId: number;
  onDeletionSuccess: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = React.memo(({ givingId, onDeletionSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/giving-backs/${givingId}`);
      toast.success('Record deleted successfully!', { position: 'top-right' });
      onDeletionSuccess();
    } catch {
      toast.error('Failed to delete record.', { position: 'top-right' });
    }
    setShowConfirm(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      <Link
        to={`/edit-giving-backs/${givingId}`}
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
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this record?</p>
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
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-blue-500 hover:text-blue-600 text-xs font-medium"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
});

const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = React.memo(({ imageUrl, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="relative bg-white rounded-lg p-4 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={imageUrl}
          alt="Image"
          className="w-full h-auto max-h-[80vh] object-contain rounded"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Error';
            (e.currentTarget as HTMLImageElement).alt = 'Image load error';
          }}
        />
      </div>
    </div>
  );
});

const GivingBack: React.FC = () => {
  const [data, setData] = useState<GivingBackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchGivingBack = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: responseData } = await axiosInstance.get<ApiResponse>('/api/giving-backs');
      setData(responseData.giving_back || []);
    } catch {
      setError('Failed to fetch records.');
      toast.error('Failed to fetch records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGivingBack();
  }, [fetchGivingBack]);

  const columns: readonly Column<GivingBackData>[] = useMemo(
    () => [
      {
        Header: '#',
        id: 'rowIndex',
        Cell: ({ row, flatRows }: CellProps<GivingBackData>) => {
          const rowIndex = flatRows.findIndex((flatRow) => flatRow.original === row.original);
          return <span>{rowIndex + 1}</span>;
        },
      },
      { Header: 'Category', accessor: 'givingBack_category' },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ value }: CellProps<GivingBackData, string | null>) => <DescriptionCell value={value} />,
      },
      {
        Header: 'Web Link',
        accessor: 'weblink',
        Cell: ({ value }: CellProps<GivingBackData, string | null>) =>
          value ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {value}
            </a>
          ) : (
            <span className="text-gray-500 text-xs">No Link</span>
          ),
      },
      {
        Header: 'Images',
        accessor: 'image_slider',
        Cell: ({ value }: CellProps<GivingBackData, string | null>) => {
          if (!value) return <span className="text-gray-500 text-xs">No Images</span>;
          let images: string[] = [];
          try {
            images = JSON.parse(value) as string[];
          } catch {
            return <span className="text-gray-500 text-xs">Invalid Image Data</span>;
          }
          const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
          return (
            <div className="flex gap-2">
              {images.map((image, index) => {
                const cleanPath = image.startsWith('/') ? image.slice(1) : image;
                const imageUrl = `${baseUrl}/${cleanPath}`;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(imageUrl)}
                    className="focus:outline-none"
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="h-16 w-16 object-cover rounded cursor-pointer hover:opacity-80"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=Error';
                        (e.currentTarget as HTMLImageElement).alt = 'Image load error';
                      }}
                    />
                  </button>
                );
              })}
            </div>
          );
        },
      },
      {
        Header: 'Created At',
        accessor: 'created_at',
        Cell: ({ value }: CellProps<GivingBackData, string>) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Actions',
        accessor: 'giving_id',
        Cell: ({ row }: CellProps<GivingBackData>) => (
          <ActionButtons givingId={row.original.giving_id} onDeletionSuccess={fetchGivingBack} />
        ),
      },
    ],
    [fetchGivingBack]
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
  } = useTable<GivingBackData>(
    { columns, data, initialState: { pageIndex: 0, pageSize: 10 } },
    useGlobalFilter,
    usePagination
  );

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.text('Giving Back Records', 20, 10);
    autoTable(doc, {
      head: [['#', 'Category', 'Description', 'Web Link', 'Created At']],
      body: data.map((row, index) => [
        index + 1,
        row.givingBack_category,
        row.description || 'None',
        row.weblink || 'None',
        new Date(row.created_at).toLocaleDateString(),
      ]),
    });
    doc.save('giving_back_records.pdf');
    toast.success('PDF exported successfully!');
  }, [data]);

  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, index) => ({
        '#': index + 1,
        Category: row.givingBack_category,
        Description: row.description || 'None',
        'Web Link': row.weblink || 'None',
        'Created At': new Date(row.created_at).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GivingBack');
    XLSX.writeFile(workbook, 'giving_back_records.xlsx');
    toast.success('Excel exported successfully!');
  }, [data]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error && !data.length) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchGivingBack}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">Giving Back Management</h2>
          <Link
            to="/add-giving-backs"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Record
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border-red-300 border">{error}</div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search entries..."
            className="px-4 py-2 border rounded w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full border rounded divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps()}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
              {page.length ? (
                page.map((row: Row<GivingBackData>) => {
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
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data.length && page.length ? (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex gap-2">
              <button
                onClick={previousPage}
                disabled={!canPreviousPage}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={!canNextPage}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
              >
                Next
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Page <span className="font-semibold">{pageIndex + 1}</span> of{' '}
              <span className="font-semibold">{pageOptions.length}</span>
            </div>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[5, 10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size} rows
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default React.memo(GivingBack);