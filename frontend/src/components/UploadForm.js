import React, { useState } from "react";
import predict from "../api/predict";

const SEX_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unknown", label: "Unknown" }
];

const DX_TYPE_OPTIONS = [
  { value: "confocal", label: "Confocal" },
  { value: "consensus", label: "Consensus" },
  { value: "follow_up", label: "Follow-up" },
  { value: "histo", label: "Histopathology" }
];

const LOCALIZATION_OPTIONS = [
  "abdomen", "acral", "back", "chest", "ear", "face", "foot", "genital",
  "hand", "lower extremity", "neck", "scalp", "trunk", "unknown", "upper extremity"
];

function UploadForm({ setPrediction, setError }) {
  const [form, setForm] = useState({
    sex: "",
    dx_type: "",
    localization: "",
    age: "",
    image: null
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, files } = e.target;
    setPrediction(null);
    setError(null);
    if (name === "image") {
      const file = files[0];
      setForm({ ...form, image: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      // Validate fields
      if (
        !form.sex ||
        !form.dx_type ||
        !form.localization ||
        !form.age ||
        !form.image
      ) {
        setError("All fields are required.");
        setLoading(false);
        return;
      }
      if (isNaN(form.age) || form.age <= 0) {
        setError("Please enter a valid age.");
        setLoading(false);
        return;
      }
      // Send to backend
      const result = await predict(form);
      setPrediction(result);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Prediction failed. Please try again or check your input."
      );
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <div>
        <label>
          Image:
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
          />
        </label>
        {preview && (
          <img src={preview} alt="Preview" className="preview-image" />
        )}
      </div>

      <div>
        <label>
          Sex:
          <select name="sex" value={form.sex} onChange={handleChange} required>
            <option value="">Select Sex</option>
            {SEX_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          Dx Type:
          <select name="dx_type" value={form.dx_type} onChange={handleChange} required>
            <option value="">Select Type</option>
            {DX_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          Localization:
          <select
            name="localization"
            value={form.localization}
            onChange={handleChange}
            required
          >
            <option value="">Select Localization</option>
            {LOCALIZATION_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          Age:
          <input
            type="number"
            name="age"
            min="1"
            max="120"
            value={form.age}
            onChange={handleChange}
            required
            placeholder="Enter age"
          />
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Predicting..." : "Predict"}
      </button>
    </form>
  );
}

export default UploadForm;
