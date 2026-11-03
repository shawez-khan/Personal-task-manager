import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../api/tasksApi';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Clear error manually
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch tasks based on active filter and sort
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tasksApi.getTasks({
        status: filterStatus,
        sortBy,
        order,
      });
      setTasks(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load tasks. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, sortBy, order]);

  // Initial and reactive fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create a new task
  const addTask = async (taskData) => {
    setIsCreating(true);
    setError(null);
    try {
      const response = await tasksApi.createTask(taskData);
      const newTask = response.data;

      // Re-fetch so the list respects the active sort order instead of always prepending
      await fetchTasks();
      return { success: true, data: newTask };
    } catch (err) {
      setError(err.message || 'Failed to create task');
      return { success: false, error: err.message };
    } finally {
      setIsCreating(false);
    }
  };

  // Update task status with optimistic update and rollback
  const updateTaskStatus = async (id, newStatus) => {
    setMutatingId(id);
    setError(null);

    // Snapshot previous tasks for rollback
    const previousTasks = [...tasks];

    // Optimistically update local state
    setTasks((prev) => {
      // If a filter is active and the new status does not match the filter,
      // the task should leave the list immediately per requirements!
      if (filterStatus !== 'all' && newStatus !== filterStatus) {
        return prev.filter((t) => t._id !== id);
      }
      return prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t));
    });

    try {
      const response = await tasksApi.updateTask(id, { status: newStatus });
      // Sync with updated document from server
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? response.data : t))
      );
      return { success: true };
    } catch (err) {
      // Rollback to previous state on failure
      setTasks(previousTasks);
      setError(`Failed to update task status: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setMutatingId(null);
    }
  };

  // Delete a task
  const removeTask = async (id) => {
    setMutatingId(id);
    setError(null);

    const previousTasks = [...tasks];
    // Optimistically remove
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      await tasksApi.deleteTask(id);
      return { success: true };
    } catch (err) {
      // Rollback on failure
      setTasks(previousTasks);
      setError(`Failed to delete task: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setMutatingId(null);
    }
  };

  return {
    tasks,
    loading,
    mutatingId,
    isCreating,
    error,
    clearError,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    order,
    setOrder,
    fetchTasks,
    addTask,
    updateTaskStatus,
    removeTask,
  };
};
