const mongoose = require('mongoose');

const PRIORITY_ENUM = ['low', 'medium', 'high'];
const STATUS_ENUM = ['todo', 'in_progress', 'done'];

const PRIORITY_RANK = {
  high: 3,
  medium: 2,
  low: 1,
};

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    priority: {
      type: String,
      enum: {
        values: PRIORITY_ENUM,
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: STATUS_ENUM,
        message: 'Status must be todo, in_progress, or done',
      },
      default: 'todo',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    priorityRank: {
      type: Number,
      default: 2, // medium
    },
  },
  {
    timestamps: true,
  }
);

// Keep priorityRank in sync with priority before saving
TaskSchema.pre('save', function (next) {
  if (this.isModified('priority')) {
    this.priorityRank = PRIORITY_RANK[this.priority] || 2;
  }
  next();
});

// Indexes for fast status filtering and compound sorting
TaskSchema.index({ status: 1, dueDate: 1 });
TaskSchema.index({ status: 1, priorityRank: -1 });

module.exports = {
  Task: mongoose.model('Task', TaskSchema),
  PRIORITY_ENUM,
  STATUS_ENUM,
  PRIORITY_RANK,
};
