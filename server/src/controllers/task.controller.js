const { Task } = require('../models/Task');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Public
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, status, dueDate } = req.body;

  const taskData = {
    title: title.trim(),
    description: description ? description.trim() : '',
    priority: priority || 'medium',
    status: status || 'todo',
    dueDate: dueDate ? new Date(dueDate) : null,
  };

  const task = await Task.create(taskData);

  res.status(201).json({
    success: true,
    data: task,
  });
});

// @desc    Get all tasks with filtering and sorting
// @route   GET /api/tasks
// @access  Public
const getTasks = asyncHandler(async (req, res) => {
  const { status, sortBy = 'createdAt', order } = req.query;

  const pipeline = [];

  // Filter by status if provided
  if (status) {
    pipeline.push({ $match: { status } });
  }

  // Handle sorting logic
  if (sortBy === 'dueDate') {
    // Tasks without due date should always appear last
    const sortDir = order === 'desc' ? -1 : 1;
    pipeline.push({
      $addFields: {
        hasDueDate: {
          $cond: [{ $and: [{ $ne: ['$dueDate', null] }, { $ne: ['$dueDate', ''] }] }, 1, 0],
        },
      },
    });
    pipeline.push({
      $sort: {
        hasDueDate: -1, // Due dates first (1), null/empty last (0)
        dueDate: sortDir,
        createdAt: -1,
      },
    });
    pipeline.push({
      $project: {
        hasDueDate: 0,
      },
    });
  } else if (sortBy === 'priority') {
    // Priority sort: high (3) > medium (2) > low (1)
    // Default order for priority is desc (high to low) unless asc requested
    const sortDir = order === 'asc' ? 1 : -1;
    pipeline.push({
      $sort: {
        priorityRank: sortDir,
        createdAt: -1,
      },
    });
  } else {
    // Default sortBy is createdAt (newest first unless asc specified)
    const sortDir = order === 'asc' ? 1 : -1;
    pipeline.push({
      $sort: {
        createdAt: sortDir,
      },
    });
  }

  const tasks = await Task.aggregate(pipeline);

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Public
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

// @desc    Update a task by ID (partial or full update)
// @route   PUT /api/tasks/:id
// @access  Public
const updateTask = asyncHandler(async (req, res) => {
  const allowedUpdates = ['title', 'description', 'priority', 'status', 'dueDate'];
  const updateData = {};

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'title' || field === 'description') {
        updateData[field] = req.body[field].trim();
      } else if (field === 'dueDate') {
        updateData[field] = req.body[field] ? new Date(req.body[field]) : null;
      } else {
        updateData[field] = req.body[field];
      }
    }
  });

  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  task.set(updateData);
  await task.save();

  res.status(200).json({
    success: true,
    data: task,
  });
});

// @desc    Delete a task by ID
// @route   DELETE /api/tasks/:id
// @access  Public
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: { id: task._id },
  });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
