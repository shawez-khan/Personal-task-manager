const mongoose = require('mongoose');
const { PRIORITY_ENUM, STATUS_ENUM } = require('../models/Task');

const validateCreateTask = (body) => {
  const errors = [];

  // Title validation
  if (!body || body.title === undefined || body.title === null) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title is required and cannot be empty' });
  } else if (body.title.trim().length > 100) {
    errors.push({ field: 'title', message: 'Title cannot exceed 100 characters' });
  }

  // Description validation
  if (body && body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string' });
    } else if (body.description.trim().length > 500) {
      errors.push({ field: 'description', message: 'Description cannot exceed 500 characters' });
    }
  }

  // Priority validation
  if (body && body.priority !== undefined && body.priority !== null) {
    if (!PRIORITY_ENUM.includes(body.priority)) {
      errors.push({
        field: 'priority',
        message: `Priority must be one of: ${PRIORITY_ENUM.join(', ')}`,
      });
    }
  }

  // Status validation
  if (body && body.status !== undefined && body.status !== null) {
    if (!STATUS_ENUM.includes(body.status)) {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${STATUS_ENUM.join(', ')}`,
      });
    }
  }

  // DueDate validation
  if (body && body.dueDate !== undefined && body.dueDate !== null && body.dueDate !== '') {
    const parsedDate = new Date(body.dueDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push({ field: 'dueDate', message: 'Due date must be a valid date' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateUpdateTask = (body) => {
  const errors = [];

  if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'No fields to update' }],
    };
  }

  const allowedFields = ['title', 'description', 'priority', 'status', 'dueDate'];
  const providedFields = Object.keys(body);
  const updatableFields = providedFields.filter((key) => allowedFields.includes(key));

  if (updatableFields.length === 0) {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'No valid updatable fields provided' }],
    };
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title is required and cannot be empty' });
    } else if (body.title.trim().length > 100) {
      errors.push({ field: 'title', message: 'Title cannot exceed 100 characters' });
    }
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string' });
    } else if (body.description.trim().length > 500) {
      errors.push({ field: 'description', message: 'Description cannot exceed 500 characters' });
    }
  }

  if (body.priority !== undefined) {
    if (!PRIORITY_ENUM.includes(body.priority)) {
      errors.push({
        field: 'priority',
        message: `Priority must be one of: ${PRIORITY_ENUM.join(', ')}`,
      });
    }
  }

  if (body.status !== undefined) {
    if (!STATUS_ENUM.includes(body.status)) {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${STATUS_ENUM.join(', ')}`,
      });
    }
  }

  if (body.dueDate !== undefined && body.dueDate !== null && body.dueDate !== '') {
    const parsedDate = new Date(body.dueDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push({ field: 'dueDate', message: 'Due date must be a valid date' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateTaskId = (id) => {
  if (!id || !mongoose.isValidObjectId(id)) {
    return {
      isValid: false,
      errors: [{ field: 'id', message: 'Invalid task id' }],
    };
  }
  return { isValid: true, errors: [] };
};

const validateQueryParams = (query) => {
  const errors = [];
  const allowedSortBy = ['dueDate', 'priority', 'createdAt'];
  const allowedOrder = ['asc', 'desc'];

  if (query.status && !STATUS_ENUM.includes(query.status)) {
    errors.push({
      field: 'status',
      message: `Status must be one of: ${STATUS_ENUM.join(', ')}`,
    });
  }

  if (query.sortBy && !allowedSortBy.includes(query.sortBy)) {
    errors.push({
      field: 'sortBy',
      message: `sortBy must be one of: ${allowedSortBy.join(', ')}`,
    });
  }

  if (query.order && !allowedOrder.includes(query.order)) {
    errors.push({
      field: 'order',
      message: `order must be one of: ${allowedOrder.join(', ')}`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validateQueryParams,
};
