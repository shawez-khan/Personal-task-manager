import React from 'react';

const TaskItem = ({ task, onUpdateStatus, onDeleteTask, isMutating }) => {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus !== task.status) {
      onUpdateStatus(task._id, newStatus);
    }
  };

  const handleDelete = () => {
    const confirmed = window.confirm(`Are you sure you want to delete "${task.title}"?`);
    if (confirmed) {
      onDeleteTask(task._id);
    }
  };

  const formattedDueDate = formatDate(task.dueDate);

  return (
    <div className={`task-item-card ${isMutating ? 'item-mutating' : ''}`}>
      <div className="task-item-main">
        <div className="task-item-header">
          <h4 className={`task-title ${task.status === 'done' ? 'title-completed' : ''}`}>
            {task.title}
          </h4>
          <span className={`badge badge-priority badge-priority-${task.priority}`}>
            {task.priority.toUpperCase()}
          </span>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-metadata">
          {formattedDueDate ? (
            <span className="metadata-item metadata-due-date" title="Due Date">
              📅 Due: {formattedDueDate}
            </span>
          ) : (
            <span className="metadata-item metadata-no-due">No due date</span>
          )}
        </div>
      </div>

      <div className="task-item-controls">
        <label htmlFor={`status-${task._id}`} className="visually-hidden">
          Status
        </label>
        <select
          id={`status-${task._id}`}
          className={`status-select status-select-${task.status}`}
          value={task.status}
          onChange={handleStatusChange}
          disabled={isMutating}
          title="Update task status"
        >
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <button
          type="button"
          className="btn btn-delete"
          onClick={handleDelete}
          disabled={isMutating}
          title="Delete task"
          aria-label={`Delete task: ${task.title}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
