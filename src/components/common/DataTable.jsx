import React from 'react';
import Loader from './Loader';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({ 
  columns, 
  data, 
  isLoading, 
  onRowClick,
  pagination = null, // { onNext, onPrev, hasNext, hasPrev, currentPage }
  emptyMessage = "No data found"
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-semibold">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className={`px-6 py-4 ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  <Loader className="mx-auto" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr 
                  key={row.id || rowIndex} 
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`group transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50/50' : ''}`}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className={`px-6 py-4 text-sm ${column.cellClassName || ''}`}
                    >
                      {column.render ? column.render(row, rowIndex) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="text-sm text-gray-500">
            Page <span className="font-medium text-gray-900">{pagination.currentPage}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={pagination.onPrev}
              disabled={!pagination.hasPrev || isLoading}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={pagination.onNext}
              disabled={!pagination.hasNext || isLoading}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
