const mongoose = require('mongoose');
const { PRIORITY_ENUM, STATUS_ENUM } = require('../models/Task');

// Shared field validators — used by both create and update
const fieldValidators = {
  title(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return 'Title is required and cannot be empty';
    }
    if (value.trim().length > 100) {
      return 'Title cannot exceed 100 characters';
    }
  },
  description(value) {
    if (value !== undefined && value !== null) {
      if (typeof value !== 'string') return 'Description must be a string';
      if (value.trim().length > 500) return 'Description cannot exceed 500 characters';
    }
  },
  priority(value) {
    if (!PRIORITY_ENUM.includes(value)) {
      return `Priority must be one of: ${PRIORITY_ENUM.join(', ')}`;
    }
  },
  status(value) {
    if (!STATUS_ENUM.includes(value)) {
      return `Status must be one of: ${STATUS_ENUM.join(', ')}`;
    }
  },
  dueDate(value) {
    if (value !== undefined && value !== null && value !== '') {
      if (isNaN(new Date(value).getTime())) {
        return 'Due date must be a valid date';
      }
    }
  },
};

const toError = (field, message) => ({ field, message });

const validateCreateTask = (body) => {
  const errors = [];

  if (!body || body.title === undefined || body.title === null) {
    errors.push(toError('title', 'Title is required'));
  } else {
    const msg = fieldValidators.title(body.title);
    if (msg) errors.push(toError('title', msg));
  }

  for (const field of ['description', 'priority', 'status', 'dueDate']) {
    if (body && body[field] !== undefined) {
      const msg = fieldValidators[field](body[field]);
      if (msg) errors.push(toError(field, msg));
    }
  }

  return { isValid: errors.length === 0, errors };
};

const validateUpdateTask = (body) => {
  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return {
      isValid: false,
      errors: [toError('body', 'No fields to update')],
    };
  }

  const allowedFields = ['title', 'description', 'priority', 'status', 'dueDate'];
  const updatableFields = Object.keys(body).filter((k) => allowedFields.includes(k));

  if (updatableFields.length === 0) {
    return {
      isValid: false,
      errors: [toError('body', 'No valid updatable fields provided')],
    };
  }

  const errors = [];
  for (const field of updatableFields) {
    const msg = fieldValidators[field](body[field]);
    if (msg) errors.push(toError(field, msg));
  }

  return { isValid: errors.length === 0, errors };
};

const validateTaskId = (id) => {
  if (!id || !mongoose.isValidObjectId(id)) {
    return {
      isValid: false,
      errors: [toError('id', 'Invalid task id')],
    };
  }
  return { isValid: true, errors: [] };
};

const validateQueryParams = (query) => {
  const errors = [];
  const allowedSortBy = ['dueDate', 'priority', 'createdAt'];
  const allowedOrder = ['asc', 'desc'];

  if (query.status && !STATUS_ENUM.includes(query.status)) {
    errors.push(toError('status', `Status must be one of: ${STATUS_ENUM.join(', ')}`));
  }
  if (query.sortBy && !allowedSortBy.includes(query.sortBy)) {
    errors.push(toError('sortBy', `sortBy must be one of: ${allowedSortBy.join(', ')}`));
  }
  if (query.order && !allowedOrder.includes(query.order)) {
    errors.push(toError('order', `order must be one of: ${allowedOrder.join(', ')}`));
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validateQueryParams,
};
