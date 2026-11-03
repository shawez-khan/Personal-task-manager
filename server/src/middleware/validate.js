const ApiError = require('../utils/ApiError');
const {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
  validateQueryParams,
} = require('../validators/task.schema');

const validateCreate = (req, res, next) => {
  const { isValid, errors } = validateCreateTask(req.body);
  if (!isValid) {
    return next(new ApiError(400, errors[0].message, errors));
  }
  next();
};

const validateUpdate = (req, res, next) => {
  const { isValid, errors } = validateUpdateTask(req.body);
  if (!isValid) {
    return next(new ApiError(400, errors[0].message, errors));
  }
  next();
};

const validateId = (req, res, next) => {
  const { isValid, errors } = validateTaskId(req.params.id);
  if (!isValid) {
    return next(new ApiError(400, errors[0].message, errors));
  }
  next();
};

const validateQuery = (req, res, next) => {
  const { isValid, errors } = validateQueryParams(req.query);
  if (!isValid) {
    return next(new ApiError(400, errors[0].message, errors));
  }
  next();
};

module.exports = {
  validateCreate,
  validateUpdate,
  validateId,
  validateQuery,
};
