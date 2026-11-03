const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      (data?.error?.details && data.error.details.length > 0
        ? data.error.details.map((d) => d.message).join(', ')
        : `Request failed with status ${response.status}`);
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const tasksApi = {
  // Fetch tasks with optional status filter and sorting
  async getTasks({ status, sortBy, order } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (sortBy && sortBy !== 'createdAt') params.append('sortBy', sortBy);
    if (order) params.append('order', order);

    const queryString = params.toString();
    const url = `${BASE_URL}/tasks${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url);
    return handleResponse(res);
  },

  // Create a new task
  async createTask(taskData) {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  // Update a task (e.g. status change or full update)
  async updateTask(id, updateData) {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    return handleResponse(res);
  },

  // Delete a task by ID
  async deleteTask(id) {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};
