import React from 'react';

const Loader = ({ message = 'Loading tasks...' }) => {
  return (
    <div className="loader-container" role="status" aria-live="polite">
      <div className="loader-spinner"></div>
      <span className="loader-text">{message}</span>
    </div>
  );
};

export default Loader;
