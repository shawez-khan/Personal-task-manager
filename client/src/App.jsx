import React from 'react';
import { useTasks } from './hooks/useTasks';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import ErrorBanner from './components/ErrorBanner';
import './App.css';

function App() {
  const {
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
  } = useTasks();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-brand">
          <h1>Personal Task Manager</h1>
          <p className="header-subtitle">
            Organize, track, and manage your daily priorities
          </p>
        </div>
        <div className="header-stats">
          <span className="stat-badge">
            <strong>{totalTasks}</strong> {totalTasks === 1 ? 'task' : 'tasks'}
            {filterStatus === 'all' && totalTasks > 0 && (
              <span className="stat-sub">({completedTasks} completed)</span>
            )}
          </span>
        </div>
      </header>

      <main className="app-main">
        <ErrorBanner
          error={error}
          onDismiss={clearError}
          onRetry={fetchTasks}
        />

        <TaskForm onAddTask={addTask} isCreating={isCreating} />

        <FilterBar
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          sortBy={sortBy}
          onSortChange={setSortBy}
          order={order}
          onOrderChange={setOrder}
          totalCount={totalTasks}
        />

        <TaskList
          tasks={tasks}
          loading={loading}
          mutatingId={mutatingId}
          onUpdateStatus={updateTaskStatus}
          onDeleteTask={removeTask}
          filterStatus={filterStatus}
        />
      </main>

      <footer className="app-footer">
        <p>Personal Task Manager • MERN Assessment</p>
      </footer>
    </div>
  );
}

export default App;
