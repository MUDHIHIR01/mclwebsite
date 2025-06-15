// src/components/ContactUsInfo.tsx

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTable, useGlobalFilter, usePagination, Row, Column, CellProps } from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import axiosInstance from '../../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Updated data interface for ContactInfo
interface ContactInfoData {
  contact_info_id: number;
  contactus_id: number;
  phone_one: string;
  phone_two: string | null;
  email_address: string;
  webmail_address: string | null;
  location: string;
  created_at: string;
  contact_us: { // The eager-loaded relationship
    id: number;
    category: string;
  } | null;
}

// Reusable action buttons component
const ActionButtons: React.FC<{ contactInfoId: number; onDeletionSuccess: () => void; }> = ({ contactInfoId, onDeletionSuccess }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/contact-info/${contactInfoId}`);
      toast.success('Contact Info record deleted successfully!', { position: 'top-right' });
      onDeletionSuccess();
    } catch (err) {
      toast.error('Failed to delete record.', { position: 'top-right' });
    }
    setShowConfirm(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      <Link to={`/edit/contact-us/info/${contactInfoId}`} className="p-1 text-blue-500 hover:text-blue-600" aria-label="Edit">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
      </Link>
      <button onClick={() => setShowConfirm(true)} className="p-1 text-red-500 hover:text-red-600" aria-label="Delete">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
      </button>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this info record?</p>
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

export default function ContactUsInfo() {
  const [data, setData] = useState<ContactInfoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContactsInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/contact-info');
      setData(response.data.contact_infos || []);
    } catch (err: any) {
      setError('Failed to fetch contact info records.');
      toast.error('Failed to fetch records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContactsInfo();
  }, [fetchContactsInfo]);

  const columns: readonly Column<ContactInfoData>[] = useMemo(() => [
    { Header: '#', id: 'rowIndex', Cell: ({ row, flatRows }: CellProps<ContactInfoData>) => (flatRows.findIndex(flatRow => flatRow.original === row.original) + 1) },
    { Header: 'Parent Category', accessor: (row: ContactInfoData) => row.contact_us?.category || 'N/A' },
    { Header: 'Primary Phone', accessor: 'phone_one' },
    { Header: 'Email', accessor: 'email_address' },
    { Header: 'Location', accessor: 'location' },
    { Header: 'Created At', accessor: 'created_at', Cell: ({ value }: CellProps<ContactInfoData, string>) => new Date(value).toLocaleDateString() },
    { Header: 'Actions', id: 'actions', Cell: ({ row }: CellProps<ContactInfoData>) => <ActionButtons contactInfoId={row.original.contact_info_id} onDeletionSuccess={fetchContactsInfo} /> },
  ], [fetchContactsInfo]);

  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow, canPreviousPage, canNextPage, pageOptions, nextPage, previousPage, setPageSize, setGlobalFilter, state: { pageIndex, pageSize, globalFilter } } = useTable({ columns, data, initialState: { pageIndex: 0, pageSize: 10 } }, useGlobalFilter, usePagination);
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Contact Info Records', 20, 10);
    autoTable(doc, {
      head: [['#', 'Category', 'Phone', 'Email', 'Location', 'Created At']],
      body: data.map((row, index) => [
        index + 1,
        row.contact_us?.category || 'N/A',
        row.phone_one,
        row.email_address,
        row.location,
        new Date(row.created_at).toLocaleDateString(),
      ]),
    });
    doc.save('contact_info_records.pdf');
    toast.success('PDF exported!');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map((row, index) => ({
      '#': index + 1,
      'Parent Category': row.contact_us?.category || 'N/A',
      'Primary Phone': row.phone_one,
      'Email': row.email_address,
      'Location': row.location,
      'Created At': new Date(row.created_at).toLocaleDateString(),
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact Info');
    XLSX.writeFile(workbook, 'contact_info_records.xlsx');
    toast.success('Excel exported!');
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="text-lg font-semibold">Loading...</div></div>;
  if (error && data.length === 0) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Contact Info Management</h2>
          <Link to="/add/contact-us/info" className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Info Record
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input value={globalFilter || ''} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search entries..." className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none w-full sm:w-64" />
          <div className="flex gap-2">
            <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded-lg">PDF</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg">Excel</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {headerGroups.map(headerGroup => (<tr {...headerGroup.getHeaderGroupProps()}>{headerGroup.headers.map(column => (<th {...column.getHeaderProps()} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{column.render('Header')}</th>))}</tr>))}
            </thead>
            <tbody {...getTableBodyProps()} className="divide-y divide-gray-200">
              {page.length > 0 ? (
                page.map((row: Row<ContactInfoData>) => {
                  prepareRow(row);
                  return (<tr {...row.getRowProps()} className="hover:bg-gray-50">{row.cells.map(cell => (<td {...cell.getCellProps()} className="px-4 py-4 text-sm text-gray-700">{cell.render('Cell')}</td>))}</tr>);
                })
              ) : (
                <tr><td colSpan={columns.length} className="text-center py-10 text-gray-500">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {data.length > 0 && page.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex gap-2">
              <button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">Previous</button>
              <button onClick={() => nextPage()} disabled={!canNextPage} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50">Next</button>
            </div>
            <span className="text-sm text-gray-700">Page {pageIndex + 1} of {pageOptions.length}</span>
            <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg">
              {[5, 10, 20, 50].map(size => (<option key={size} value={size}>Show {size}</option>))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}