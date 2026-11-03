import React, { useState } from 'react';

const TaskForm = ({ onAddTask, isCreating }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [validationError, setValidationError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDueDate('');
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Task title is required.');
      return;
    }

    if (trimmedTitle.length > 100) {
      setValidationError('Title cannot exceed 100 characters.');
      return;
    }

    setValidationError('');

    const taskPayload = {
      title: trimmedTitle,
      description: description.trim(),
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    const result = await onAddTask(taskPayload);
    if (result.success) {
      resetForm();
      setIsOpen(false);
    }
  };

  return (
    <div className="task-form-card">
      {!isOpen ? (
        <div className="task-form-collapsed">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsOpen(true)}
          >
            + Create New Task
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="task-form" noValidate>
          <div className="task-form-header">
            <h3>New Task</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                resetForm();
                setIsOpen(false);
              }}
              disabled={isCreating}
            >
              Cancel
            </button>
          </div>

          {validationError && (
            <div className="form-error-message" role="alert">
              {validationError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="taskTitle">
              Title <span className="required-star">*</span>
            </label>
            <input
              id="taskTitle"
              type="text"
              className={`form-input ${validationError ? 'input-error' : ''}`}
              placeholder="e.g. Prepare client onboarding deck"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError && e.target.value.trim()) {
                  setValidationError('');
                }
              }}
              maxLength={100}
              disabled={isCreating}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="taskDescription">Description (optional)</label>
            <textarea
              id="taskDescription"
              className="form-textarea"
              placeholder="Add key context, links, or notes..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              disabled={isCreating}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="taskPriority">Priority</label>
              <select
                id="taskPriority"
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isCreating}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="taskStatus">Status</label>
              <select
                id="taskStatus"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isCreating}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="taskDueDate">Due Date (optional)</label>
              <input
                id="taskDueDate"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isCreating}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                resetForm();
                setIsOpen(false);
              }}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
            >
              {isCreating ? 'Creating Task...' : 'Save Task'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaskForm;
