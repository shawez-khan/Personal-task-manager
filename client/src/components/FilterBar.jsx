import React from 'react';

const FilterBar = ({
  filterStatus,
  onFilterChange,
  sortBy,
  onSortChange,
  order,
  onOrderChange,
  totalCount,
}) => {
  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Todo', value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Done', value: 'done' },
  ];

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">Filter:</span>
        <div className="filter-tabs" role="tablist">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`filter-tab ${filterStatus === opt.value ? 'active' : ''}`}
              onClick={() => onFilterChange(opt.value)}
              role="tab"
              aria-selected={filterStatus === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sort-group">
        <label htmlFor="sortBySelect" className="sort-label">
          Sort by:
        </label>
        <select
          id="sortBySelect"
          className="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="createdAt">Date Created</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
        </select>

        <button
          type="button"
          className="sort-order-btn"
          onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}
          title={`Order: ${order === 'asc' ? 'Ascending' : 'Descending'} (click to toggle)`}
          aria-label={`Toggle sort order, current: ${order}`}
        >
          {order === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
