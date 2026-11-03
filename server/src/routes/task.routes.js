const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');
const {
  validateCreate,
  validateUpdate,
  validateId,
  validateQuery,
} = require('../middleware/validate');

const router = express.Router();

router.route('/')
  .post(validateCreate, createTask)
  .get(validateQuery, getTasks);

router.route('/:id')
  .get(validateId, getTaskById)
  .put(validateId, validateUpdate, updateTask)
  .delete(validateId, deleteTask);

module.exports = router;
