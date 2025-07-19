import React from "react";

// Mapping of abbreviations to full class names
const CLASS_NAME_MAP = {
  mel: "Melanoma",
  nv: "Melanocytic Nevus",
  bcc: "Basal Cell Carcinoma",
  akiec: "Actinic Keratoses / Intraepithelial Carcinoma",
  bkl: "Benign Keratosis-like Lesion",
  df: "Dermatofibroma",
  vasc: "Vascular Skin Lesion"
};

function Prediction({ data }) {
  if (!data) return null;

  const { predicted_class, class_probabilities } = data;

  // For label highlighting, try to map the predicted_class using CLASS_NAME_MAP as well
  const displayPredictedClass = CLASS_NAME_MAP[predicted_class] || predicted_class;

  return (
    <div className="prediction-result">
      <h2>Prediction Result</h2>
      <div className="main-result">
        <strong>Predicted Class:</strong>{" "}
        <span className="prediction-label">{displayPredictedClass}</span>
      </div>
      <h3>Class Probabilities</h3>
      <table className="prob-table">
        <thead>
          <tr>
            <th>Class</th>
            <th>Probability (%)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(class_probabilities)
            .sort((a, b) => b[1] - a[1])
            .map(([abbr, prob]) => {
              const fullName = CLASS_NAME_MAP[abbr] || abbr;
              // Highlight the row if it matches the predicted class (mapped)
              const highlight =
                fullName === displayPredictedClass ||
                abbr === predicted_class;
              return (
                <tr key={abbr} className={highlight ? "highlight-row" : ""}>
                  <td>{fullName}</td>
                  <td>{(prob * 100).toFixed(2)}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default Prediction;
