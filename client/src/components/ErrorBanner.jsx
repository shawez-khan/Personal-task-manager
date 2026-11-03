import React from 'react';

const ErrorBanner = ({ error, onDismiss, onRetry }) => {
  if (!error) return null;

  return (
    <div className="error-banner" role="alert">
      <div className="error-content">
        <span className="error-icon" aria-hidden="true">⚠️</span>
        <span className="error-message">{error}</span>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button type="button" className="error-retry-btn" onClick={onRetry}>
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="error-dismiss-btn"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
