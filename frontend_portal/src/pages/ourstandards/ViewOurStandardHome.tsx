import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, useGlobalFilter, usePagination, Row, Column, CellProps } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface for the data structure
interface OurStandardHomeData {
  id: number;
  heading: string;
  description: string | null;
  home_img: string | null;
  created_at: string;
}

// Component for action buttons (Edit, Delete)
const ActionButtons: React.FC<{ id: number; onDeletionSuccess: () => void }> = ({ id, onDeletionSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      // API call to delete a record by its ID
      await axiosInstance.delete(`/api/our-standard-home/${id}`);
      toast.success('Record deleted successfully!', { position: 'top-right' });
      onDeletionSuccess(); // Refresh the data table
    } catch (err) {
      toast.error('Failed to delete record.', { position: 'top-right' });
      console.error("Delete error:", err);
    }
    setShowConfirm(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Link to the edit page, which will be matched by the route /edit/our-standard/:standardid */}
      <Link to={`/edit/our-standard/${id}`} className="p-1 text-blue-500 hover:text-blue-600" aria-label="Edit">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
      </Link>
      <button onClick={() => setShowConfirm(true)} className="p-1 text-red-500 hover:text-red-600" aria-label="Delete">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
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
};

// Component to render image thumbnails in the table
const ImageCell: React.FC<{ value: string | null }> = ({ value }) => {
  if (!value) return <span className="text-gray-500 text-xs">No Image</span>;
  const baseUrl = axiosInstance.defaults.baseURL || window.location.origin;
  const imageUrl = `${baseUrl.replace(/\/$/, '')}/${value}`;

  return (
    <img
      src={imageUrl}
      alt="Thumbnail"
      className="h-12 w-16 object-cover rounded border"
      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/64x48?text=Error'; }}
    />
  );
};


export default function ViewOurStandardHome() {
  const [data, setData] = useState<OurStandardHomeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/our-standard-home');
      setData(response.data.data.our_standard_homes || []);
    } catch (err: any) {
      const errorMessage = 'Failed to fetch records. ' + (err.response?.data?.message || err.message);
      setError(errorMessage);
      toast.error('Failed to fetch records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: readonly Column<OurStandardHomeData>[] = useMemo(
    () => [
      { Header: '#', id: 'rowIndex', Cell: ({ row }: CellProps<OurStandardHomeData>) => <span>{row.index + 1}</span> },
      { Header: 'Heading', accessor: 'heading' },
      { Header: 'Description', accessor: 'description', Cell: ({ value }) => value ? <span className="text-sm">{value.slice(0, 50)}{value.length > 50 ? '...' : ''}</span> : <span className="text-gray-500 text-xs">None</span> },
      { Header: 'Image', accessor: 'home_img', Cell: ({ value }) => <ImageCell value={value} /> },
      { Header: 'Created At', accessor: 'created_at', Cell: ({ value }) => new Date(value).toLocaleDateString() },
      {
        Header: 'Actions',
        accessor: 'id',
        Cell: ({ row }: CellProps<OurStandardHomeData>) => (
          <ActionButtons id={row.original.id} onDeletionSuccess={fetchData} />
        ),
      },
    ],
    [fetchData]
  );

  const tableInstance = useTable({ columns, data }, useGlobalFilter, usePagination);
  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow, setGlobalFilter, state: { globalFilter } } = tableInstance;

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Our Standards Home Records', 20, 10);
    autoTable(doc, {
      head: [['#', 'Heading', 'Description', 'Created At']],
      body: data.map((row, index) => [
        index + 1,
        row.heading,
        row.description || 'None',
        new Date(row.created_at).toLocaleDateString(),
      ]),
    });
    doc.save('our_standards_home.pdf');
    toast.success('PDF exported successfully!');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, index) => ({
        '#': index + 1,
        'Heading': row.heading,
        'Description': row.description || 'None',
        'Created At': new Date(row.created_at).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OurStandardsHome');
    XLSX.writeFile(workbook, 'our_standards_home.xlsx');
    toast.success('Excel exported successfully!');
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Our Standards Home</h2>
          <Link to="/add/our-standards/home" className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md">
            Create New Entry
          </Link>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search records..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none w-full sm:w-64"
          />
          <div className="flex gap-2">
            <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Export PDF</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Export Excel</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full">
            <thead className="bg-gray-50">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => <th {...column.getHeaderProps()} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{column.render('Header')}</th>)}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
              {page.length > 0 ? (
                page.map((row: Row<OurStandardHomeData>) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="hover:bg-gray-50">
                      {row.cells.map((cell) => <td {...cell.getCellProps()} className="px-4 py-4 text-sm">{cell.render('Cell')}</td>)}
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={columns.length} className="text-center py-10 text-gray-500">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* You can add pagination controls here if desired */}
      </div>
    </div>
  );
}