// src/api/predict.js

import axios from "axios";

// /**
//  * Sends form data (image + metadata) to the Flask backend for prediction.
//  * @param {Object} form - The form fields:
//  * @returns {Promise<Object>} - The backend response: { predicted_class, class_probabilities }
//  */
const API_URL = "http://localhost:5000/predict"; // Adjust if backend runs elsewhere.

export default async function predict(form) {
  const formData = new FormData();
  formData.append("sex", form.sex);
  formData.append("dx_type", form.dx_type);
  formData.append("localization", form.localization);
  formData.append("age", form.age);
  formData.append("image", form.image);

  const response = await axios.post(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
}
