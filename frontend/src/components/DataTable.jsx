import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  sortBy = '',
  sortOrder = 'ASC',
  onSort = () => {},
  loading = false,
  emptyMessage = 'No records found.'
}) => {
  const getSortIcon = (columnKey) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown size={14} style={{ opacity: 0.4, marginLeft: 4 }} />;
    }
    return sortOrder === 'ASC' ? (
      <ArrowUp size={14} style={{ marginLeft: 4, color: '#818cf8' }} />
    ) : (
      <ArrowDown size={14} style={{ marginLeft: 4, color: '#818cf8' }} />
    );
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : ''}
                onClick={() => col.sortable && onSort(col.key)}
                style={col.width ? { width: col.width } : {}}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {col.title}
                  {col.sortable && getSortIcon(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                <span className="gradient-text" style={{ fontWeight: 600 }}>Loading data...</span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? 'N/A'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
