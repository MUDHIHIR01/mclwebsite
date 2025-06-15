import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  useTable,
  useGlobalFilter,
  usePagination,
  Column,
  UseTableRowProps,
  TableInstance,
} from 'react-table';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Define the shape of your data
interface TableData {
  name: string;
  phone: string;
  address: string;
  date_of_birth: string;
  created_at: string;
}

// Define props for the component
interface BasicTablesProps {
  data: TableData[];
}

export default function BasicTables({ data }: BasicTablesProps) {
  // Define columns with TypeScript typing
  const columns = useMemo<Column<TableData>[]>(
    () => [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Phone', accessor: 'phone' },
      { Header: 'Address', accessor: 'address' },
      { Header: 'Date of Birth', accessor: 'date_of_birth' },
      { Header: 'Created At', accessor: 'created_at' },
    ],
    []
  );

  // Table instance with proper typing for pagination and global filter
  const tableInstance: TableInstance<TableData> = useTable<TableData>(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    usePagination
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
  } = tableInstance;

  // Export functions
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Table Data', 20, 10);
    autoTable(doc, {
      head: [columns.map(col => col.Header as string)],
      body: data.map(row => columns.map(col => row[col.accessor as keyof TableData])),
    });
    doc.save('table_data.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'table_data.xlsx');
  };

  // Add button handler (placeholder, implement as needed)
  const handleAddClick = () => {
    console.log('Add button clicked!');
    // Add your logic here (e.g., open a modal, add a row, etc.)
  };

  return (
    <div className="tailtable p-4 w-full mx-auto">
      {/* Card Container with Full Width */}
      <div className="bg-white rounded-xl shadow-lg p-6 w-full">
        {/* Header Section with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Table Data</h2>
          <button
            onClick={handleAddClick}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shadow-md"
          >
            {/* Plus Icon (SVG) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add
          </button>
        </div>

        {/* Search and Export Controls */}
        <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4 w-full">
          <input
            value={globalFilter || ''}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search table..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 shadow-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
            >
              Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Table with Full Width */}
        <div className="overflow-x-auto w-full">
          <table
            {...getTableProps()}
            className="w-full divide-y divide-gray-200 bg-white rounded-lg table-auto"
          >
            <thead className="bg-gray-50">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps()}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody
              {...getTableBodyProps()}
              className="divide-y divide-gray-200"
            >
              {page.map((row: UseTableRowProps<TableData>) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="hover:bg-gray-50 transition">
                    {row.cells.map(cell => (
                      <td
                        {...cell.getCellProps()}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 w-full">
          <div className="flex gap-2">
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600 transition shadow-md"
            >
              Previous
            </button>
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600 transition shadow-md"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-700">
            Page{' '}
            <span className="font-medium">
              {pageIndex + 1} of {pageOptions.length}
            </span>
          </div>
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className="px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            {[5, 10, 20, 30, 50].map(size => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// PropTypes
BasicTables.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      phone: PropTypes.string,
      address: PropTypes.string,
      date_of_birth: PropTypes.string,
      created_at: PropTypes.string,
    })
  ).isRequired,
};

// Default props
BasicTables.defaultProps = {
  data: [],
};