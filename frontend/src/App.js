import React, { useState } from "react";
import UploadForm from "./components/UploadForm";
import Prediction from "./components/Prediction";
import ErrorAlert from "./components/ErrorAlert";
import "./styles/main.css";

function App() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  return (
    <div className="app-wrapper">
      <header>
        <h1>Skin Lesion Hybrid Classifier</h1>
      </header>
      <UploadForm setPrediction={setPrediction} setError={setError} />
      {error && <ErrorAlert message={error} />}
      {prediction && <Prediction data={prediction} />}
    </div>
  );
}

export default App;
