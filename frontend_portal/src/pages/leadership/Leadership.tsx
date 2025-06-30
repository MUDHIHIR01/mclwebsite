import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, useGlobalFilter, usePagination, Row, Column } from 'react-table';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface LeadershipData {
  leadership_id: number;
  leader_name: string;
  position: string;
  level: string; // Add level
  leader_image: string | null;
  description: string | null;
  created_at: string;
}

interface LeadershipApiResponse {
  leadership: LeadershipData[];
}

interface ActionButtonsProps {
  leadershipId: number;
  onDeletionSuccess: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ leadershipId, onDeletionSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/leadership/${leadershipId}`);
      toast.success('Leadership record deleted successfully!');
      onDeletionSuccess();
    } catch (err) {
      toast.error('Failed to delete leadership record.');
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      <Link to={`/edit-leadership/${leadershipId}`} className="p-1 text-blue-500 hover:text-blue-600">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
      </Link>
      <button onClick={() => setShowConfirm(true)} className="p-1 text-red-500 hover:text-red-600">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this leadership record?</p>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-300 rounded-lg">No</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Leadership() {
  const [data, setData] = useState<LeadershipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeadership = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<LeadershipApiResponse>('/api/leadership');
      setData(response.data.leadership || []);
    } catch (err: any) {
      setError('Failed to fetch leadership records.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeadership();
  }, [fetchLeadership]);

  const columns = useMemo<Column<LeadershipData>[]>(
    () => [
      { Header: '#', id: 'rowIndex', Cell: ({ row }) => <span>{row.index + 1}</span>, },
      { Header: 'Leader Name', accessor: 'leader_name' },
      { Header: 'Position', accessor: 'position' },
      { Header: 'Level', accessor: 'level' }, // Add Level column
      {
        Header: 'Image',
        accessor: 'leader_image',
        Cell: ({ value }: { value: string | null }) => {
          if (!value) return <span className="text-gray-500 text-xs">No Image</span>;
          const baseUrl = axiosInstance.defaults.baseURL || window.location.origin;
          const imageUrl = `${baseUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
          return <img src={imageUrl} alt="Leader" className="h-16 w-16 object-cover rounded" />;
        },
      },
      { Header: 'Created At', accessor: 'created_at', Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString(), },
      { Header: 'Actions', accessor: 'leadership_id', Cell: ({ row }: { row: Row<LeadershipData> }) => (
          <ActionButtons leadershipId={row.original.leadership_id} onDeletionSuccess={fetchLeadership} />
        ),
      },
    ],
    [fetchLeadership]
  );

  const tableInstance = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 10 } },
    useGlobalFilter,
    usePagination
  );

  const {
    getTableProps, getTableBodyProps, headerGroups, page, prepareRow,
    canPreviousPage, canNextPage, pageOptions, nextPage, previousPage,
    setPageSize, setGlobalFilter, state: { pageIndex, pageSize, globalFilter },
  } = tableInstance;

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Leadership Records', 20, 10);
    autoTable(doc, {
      head: [['#', 'Leader Name', 'Position', 'Level', 'Created At']], // Add Level to header
      body: data.map((row, index) => [
        index + 1,
        row.leader_name,
        row.position,
        row.level || 'N/A', // Add Level data
        new Date(row.created_at).toLocaleDateString(),
      ]),
    });
    doc.save('leadership_records.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((row, index) => ({
        '#': index + 1,
        'Leader Name': row.leader_name,
        'Position': row.position,
        'Level': row.level || 'N/A', // Add Level data
        'Created At': new Date(row.created_at).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leadership');
    XLSX.writeFile(workbook, 'leadership_records.xlsx');
  };

  if (loading) return <div className="text-lg font-semibold">Loading...</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Leadership Management</h2>
          <Link to="/add-leadership" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create Leadership</Link>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <div className="flex justify-between items-center mb-6">
          <input
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="px-4 py-2 border rounded-lg w-64"
          />
          <div className="flex gap-2">
            <button onClick={exportToPDF} className="px-4 py-2 bg-red-600 text-white rounded-lg">PDF</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg">Excel</button>
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
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="hover:bg-gray-50">
                      {row.cells.map((cell) => <td {...cell.getCellProps()} className="px-4 py-4 text-sm">{cell.render('Cell')}</td>)}
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={columns.length} className="text-center py-10">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-2">
            <button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">Previous</button>
            <button onClick={() => nextPage()} disabled={!canNextPage} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">Next</button>
          </div>
          <span>Page <strong>{pageIndex + 1} of {pageOptions.length}</strong></span>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="px-3 py-2 border rounded-lg">
            {[10, 20, 50].map((size) => <option key={size} value={size}>Show {size}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}