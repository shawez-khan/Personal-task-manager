import React from 'react';
import TaskItem from './TaskItem';
import Loader from './Loader';

const TaskList = ({
  tasks,
  loading,
  mutatingId,
  onUpdateStatus,
  onDeleteTask,
  filterStatus,
}) => {
  if (loading && tasks.length === 0) {
    return <Loader message="Loading tasks..." />;
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="empty-state-icon">📋</div>
        <h3>No tasks found</h3>
        <p>
          {filterStatus === 'all'
            ? 'You have no tasks yet. Use the form above to add your first task.'
            : `There are currently no tasks with "${filterStatus.replace('_', ' ')}" status.`}
        </p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onUpdateStatus={onUpdateStatus}
          onDeleteTask={onDeleteTask}
          isMutating={mutatingId === task._id}
        />
      ))}
    </div>
  );
};

export default TaskList;
