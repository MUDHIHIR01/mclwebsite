import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, useGlobalFilter, usePagination, Column, CellProps } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// =================================================================================
// TYPES
// =================================================================================
interface EarlyCareerData {
  early_career_id: number;
  category: string;
  description: string | null;
  img_file: string | null;
  video_file: string | null;
  created_at: string;
}

// =================================================================================
// UTILITY FUNCTIONS
// =================================================================================
const getFileUrl = (filePath: string | null): string => {
  if (!filePath) return '';
  // Ensure we don't have double slashes in the URL
  const baseUrl = (axiosInstance.defaults.baseURL || window.location.origin).replace(/\/$/, '');
  return `${baseUrl}/${filePath.replace(/^\//, '')}`;
};

// =================================================================================
// SUB-COMPONENTS (Memoized for performance)
// =================================================================================

/**
 * Renders Edit and Delete buttons, with a confirmation modal for deletion.
 */
const ActionButtons: React.FC<{ recordId: number; onDelete: () => void }> = React.memo(({ recordId, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/early-careers/${recordId}`);
      toast.success('Record deleted successfully!', { position: 'top-right' });
      onDelete(); // Refresh the data in the parent component
    } catch (err) {
      toast.error('Failed to delete record.', { position: 'top-right' });
    }
    setShowConfirm(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Link to={`/edit/early-career/${recordId}`} className="p-1 text-blue-500 hover:text-blue-600" aria-label="Edit">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
      </Link>
      <button onClick={() => setShowConfirm(true)} className="p-1 text-red-500 hover:text-red-600" aria-label="Delete">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this record?</p>
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

/**
 * Renders long descriptions with a "Read More/Less" toggle.
 */
const DescriptionCell: React.FC<{ value: string | null }> = React.memo(({ value }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100;

  if (!value) return <span className="text-gray-500 text-xs italic">No Description</span>;

  const truncatedText = value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

  return (
    <div className="text-sm text-gray-700 max-w-xs">
      {isExpanded ? value : truncatedText}
      {value.length > maxLength && (
        <button onClick={() => setIsExpanded(!isExpanded)} className="ml-2 text-blue-500 hover:text-blue-600 text-xs font-medium">
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  );
});

/**
 * Displays a full-size image in a modal overlay.
 */
const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = React.memo(({ imageUrl, onClose }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
    <div className="relative bg-white rounded-lg p-4 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800" aria-label="Close modal">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <img src={imageUrl} alt="Full-size preview" className="w-full h-auto max-h-[80vh] object-contain rounded" />
    </div>
  </div>
));

// =================================================================================
// MAIN COMPONENT
// =================================================================================
const EarlyCareers: React.FC = () => {
  const [data, setData] = useState<EarlyCareerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<{ early_careers: EarlyCareerData[] }>('/api/early-careers');
      setData(response.data.early_careers);
    } catch (err: any) {
      const errorMessage = `Failed to fetch records: ${err.response?.data?.message || err.message}`;
      setError(errorMessage);
      toast.error('Failed to fetch records.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: readonly Column<EarlyCareerData>[] = useMemo(
    () => [
      { Header: '#', Cell: ({ row }: CellProps<EarlyCareerData>) => row.index + 1, },
      { Header: 'Category', accessor: 'category' },
      { Header: 'Description', accessor: 'description', Cell: ({ value }) => <DescriptionCell value={value} /> },
      {
        Header: 'Image',
        accessor: 'img_file',
        Cell: ({ value }: CellProps<EarlyCareerData, string | null>) =>
          value ? (
            <button onClick={() => setSelectedImage(getFileUrl(value))} className="focus:outline-none" aria-label="View image">
              <img src={getFileUrl(value)} alt="Career" className="h-16 w-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" />
            </button>
          ) : (
            <span className="text-gray-500 text-xs italic">No Image</span>
          ),
      },
      {
        Header: 'Video',
        accessor: 'video_file',
        Cell: ({ value }: CellProps<EarlyCareerData, string | null>) =>
          value ? (
            <a href={getFileUrl(value)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm font-medium">View Video</a>
          ) : (
            <span className="text-gray-500 text-xs italic">No Video</span>
          ),
      },
      { Header: 'Created At', accessor: 'created_at', Cell: ({ value }: CellProps<EarlyCareerData, string>) => new Date(value).toLocaleDateString() },
      { Header: 'Actions', accessor: 'early_career_id', Cell: ({ row }) => <ActionButtons recordId={row.original.early_career_id} onDelete={fetchData} /> },
    ],
    [fetchData]
  );

  const {
    getTableProps, getTableBodyProps, headerGroups, page, prepareRow,
    canPreviousPage, canNextPage, pageOptions, nextPage, previousPage,
    setPageSize, setGlobalFilter, state: { pageIndex, pageSize, globalFilter },
  } = useTable({ columns, data, initialState: { pageSize: 10 } }, useGlobalFilter, usePagination);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.text('Early Careers Records', 20, 10);
    autoTable(doc, {
      head: [['#', 'Category', 'Description', 'Created At']],
      body: data.map((row, index) => [
        index + 1,
        row.category,
        row.description || 'N/A',
        new Date(row.created_at).toLocaleDateString(),
      ]),
    });
    doc.save('early_careers_records.pdf');
    toast.success('PDF exported successfully!', { position: 'top-right' });
  }, [data]);

  const exportToExcel = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, index) => ({
        '#': index + 1,
        Category: row.category,
        Description: row.description || 'N/A',
        'Created At': new Date(row.created_at).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'EarlyCareers');
    XLSX.writeFile(workbook, 'early_careers_records.xlsx');
    toast.success('Excel exported successfully!', { position: 'top-right' });
  }, [data]);

  if (loading) return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading...</div>;
  if (error && !data.length) return (
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
          <h2 className="text-2xl font-semibold text-gray-800">Early Careers Management</h2>
          <Link to="/add/early-career" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Record
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search records..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
          <div className="flex gap-2">
            <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">PDF</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Excel</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full border-collapse">
            <thead className="bg-gray-50">
              {headerGroups.map((hg) => (
                <tr {...hg.getHeaderGroupProps()}>
                  {hg.headers.map((col) => <th {...col.getHeaderProps()} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{col.render('Header')}</th>)}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.length ? page.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="hover:bg-gray-50 border-b border-gray-200">
                    {row.cells.map((cell) => <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap">{cell.render('Cell')}</td>)}
                  </tr>
                );
              }) : (
                <tr><td colSpan={columns.length} className="text-center py-10 text-gray-500">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        {data.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex gap-2">
              <button onClick={previousPage} disabled={!canPreviousPage} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600">Previous</button>
              <button onClick={nextPage} disabled={!canNextPage} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600">Next</button>
            </div>
            <span className="text-sm text-gray-700">Page <span className="font-medium">{pageIndex + 1}</span> of <span className="font-medium">{pageOptions.length}</span></span>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              {[10, 20, 30, 50].map((size) => <option key={size} value={size}>Show {size}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarlyCareers;