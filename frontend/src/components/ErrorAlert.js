import React from "react";

function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="error-alert">
      <span role="img" aria-label="Error" style={{ marginRight: "0.5em" }}>
        ⚠️
      </span>
      {message}
    </div>
  );
}

export default ErrorAlert;
