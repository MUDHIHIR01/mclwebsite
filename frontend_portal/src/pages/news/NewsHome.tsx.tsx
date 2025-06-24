import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, useGlobalFilter, usePagination, Column, CellProps } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- INTERFACES ---
interface NewsHomeData {
  news_home_id: number;
  heading: string | null;
  description: string | null;
  home_img: string | null;
  created_at: string;
}

// --- HELPER FUNCTION ---
const constructFileUrl = (filePath: string | null): string | null => {
  if (!filePath) return null;
  const baseUrl = axiosInstance.defaults.baseURL?.replace(/\/$/, '') || '';
  return `${baseUrl}/${filePath.replace(/^\//, '')}`;
};

// --- SUB-COMPONENTS ---
const ActionButtons: React.FC<{ recordId: number; heading: string | null; onDeletionSuccess: () => void }> = React.memo(({ recordId, heading, onDeletionSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/news-homes/${recordId}`);
      toast.success('Slider deleted successfully!');
      onDeletionSuccess();
    } catch (err) {
      toast.error('Failed to delete slider.');
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link to={`/edit/news/home/${recordId}`} className="p-1 text-blue-500 hover:text-blue-600" aria-label="Edit">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
      </Link>
      <button onClick={() => setShowConfirm(true)} className="p-1 text-red-500 hover:text-red-600" aria-label="Delete">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete the slider "{heading}"?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">No</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const DescriptionCell: React.FC<{ value: string | null }> = ({ value }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!value) return <span className="text-gray-500 text-xs italic">No Description</span>;
  const isLong = value.length > 100;
  const truncatedText = isLong ? `${value.slice(0, 100)}...` : value;
  return (
    <div className="text-sm text-gray-700 max-w-xs">
      {isExpanded ? value : truncatedText}
      {isLong && <button onClick={() => setIsExpanded(!isExpanded)} className="ml-2 text-blue-500 hover:underline text-xs">{isExpanded ? 'Show Less' : 'Show More'}</button>}
    </div>
  );
};

const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
    <div className="relative bg-white rounded-lg p-4 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800" aria-label="Close modal">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <img src={imageUrl} alt="Full-size view" className="w-full h-auto max-h-[80vh] object-contain rounded" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found'; }}/>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const NewsHome: React.FC = () => {
  const [data, setData] = useState<NewsHomeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<NewsHomeData[]>('/api/news-homes');
      setData(response.data || []);
    } catch (err: any) {
      const errorMessage = 'Failed to fetch sliders. ' + (err.response?.data?.error || err.message);
      setError(errorMessage);
      toast.error('Failed to fetch sliders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = useMemo<readonly Column<NewsHomeData>[]>(() => [
      { Header: '#', Cell: ({ row }: CellProps<NewsHomeData>) => <span>{row.index + 1}</span> },
      { Header: 'Heading', accessor: 'heading' },
      { Header: 'Image', accessor: 'home_img', Cell: ({ value }) => {
          const imageUrl = constructFileUrl(value);
          if (!imageUrl) return <span className="text-gray-500 text-xs italic">No Image</span>;
          return <button onClick={() => setSelectedImage(imageUrl)} className="focus:outline-none" aria-label="View full-size image"><img src={imageUrl} alt="Slider thumbnail" className="h-16 w-24 object-cover rounded cursor-pointer" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/96x64?text=Error'; }}/></button>;
      }},
      { Header: 'Description', accessor: 'description', Cell: ({ value }) => <DescriptionCell value={value} /> },
      { Header: 'Created At', accessor: 'created_at', Cell: ({ value }) => new Date(value).toLocaleDateString() },
      { Header: 'Actions', accessor: 'news_home_id', Cell: ({ row }) => <ActionButtons recordId={row.original.news_home_id} heading={row.original.heading} onDeletionSuccess={fetchData} /> },
  ], [fetchData]);

  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow, canPreviousPage, canNextPage, pageOptions, nextPage, previousPage, setPageSize, setGlobalFilter, state: { pageIndex, pageSize, globalFilter } } = useTable({ columns, data, initialState: { pageIndex: 0, pageSize: 10 } }, useGlobalFilter, usePagination);
  
  // --- IMPLEMENTED EXPORT FUNCTIONALITY ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("News Home Sliders", 14, 15);
    
    const tableColumn = ["#", "Heading", "Description", "Created At"];
    const tableRows: (string | null)[][] = [];

    data.forEach((item, index) => {
        const rowData = [
            (index + 1).toString(),
            item.heading || "N/A",
            item.description ? item.description.substring(0, 40) + '...' : "N/A",
            new Date(item.created_at).toLocaleDateString(),
        ];
        tableRows.push(rowData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
    });

    doc.save('NewsHomeSliders.pdf');
    toast.info('Exporting to PDF...');
  };

  const exportToExcel = () => {
    const dataToExport = data.map(item => ({
        Heading: item.heading,
        Description: item.description,
        'Created At': new Date(item.created_at).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "News Sliders");

    XLSX.writeFile(wb, 'NewsHomeSliders.xlsx');
    toast.info('Exporting to Excel...');
  };
  // --- END OF IMPLEMENTATION ---

  if (loading) return <div className="flex justify-center items-center min-h-screen text-lg font-semibold">Loading...</div>;
  if (error && data.length === 0) return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <div className="text-red-500 text-xl font-semibold mb-4">An Error Occurred</div>
        <p className="text-gray-700 mb-4">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Try Again</button>
      </div>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop theme="colored" />
      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">News Home Slider Management</h2>
          <Link to="/add/news/home" className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Slider
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input value={globalFilter || ''} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search sliders..." className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto" />
          <div className="flex gap-2">
            <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Export PDF</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">Export Excel</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full">
            <thead className="bg-gray-50">
              {headerGroups.map((hg) => <tr {...hg.getHeaderGroupProps()}>{hg.headers.map((col) => <th {...col.getHeaderProps()} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.render('Header')}</th>)}</tr>)}
            </thead>
            <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
              {page.length > 0 ? page.map((row) => { prepareRow(row); return <tr {...row.getRowProps()} className="hover:bg-gray-50 transition-colors">{row.cells.map((cell) => <td {...cell.getCellProps()} className="px-4 py-4 align-top">{cell.render('Cell')}</td>)}</tr>; })
               : <tr><td colSpan={columns.length} className="text-center py-10 text-gray-500">No sliders found.</td></tr>}
            </tbody>
          </table>
        </div>
        {data.length > 10 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex gap-2"><button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">Previous</button><button onClick={() => nextPage()} disabled={!canNextPage} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">Next</button></div>
            <div className="text-sm text-gray-700">Page <span className="font-medium">{pageIndex + 1}</span> of <span className="font-medium">{pageOptions.length}</span></div>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {[10, 20, 30, 50].map((size) => <option key={size} value={size}>Show {size}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsHome;