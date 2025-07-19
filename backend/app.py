import os
import torch
from flask import Flask, request, jsonify
import joblib
import numpy as np
from PIL import Image
from flask_cors import CORS

# Import helpers and model definition; ensure utils.py is present and compatible
from utils import (
    get_device, load_model, preprocess_metadata, preprocess_image, predict_class
)

# --- Configuration ---
MODEL_DIR = 'model'
OHE_PATH = os.path.join(MODEL_DIR, 'ohe.joblib')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.joblib')
LABEL_PATH = os.path.join(MODEL_DIR, 'label_classes.npy')
WEIGHTS_PATH = os.path.join(MODEL_DIR, 'skin_lesion_hybrid_best_weights.pth')

# --- Load artifacts ---
ohe = joblib.load(OHE_PATH)
scaler = joblib.load(SCALER_PATH)
label_classes = np.load(LABEL_PATH, allow_pickle=True)
NUM_META_FEATURES = len(ohe.get_feature_names_out(['sex', 'dx_type', 'localization'])) + 1
NUM_CLASSES = len(label_classes)

device = get_device()
model = load_model(NUM_META_FEATURES, NUM_CLASSES, WEIGHTS_PATH, device)

app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=['POST'])
def predict():
    try:
        meta_input = {
            'sex': request.form['sex'],
            'dx_type': request.form['dx_type'],
            'localization': request.form['localization'],
            'age': float(request.form['age'])
        }
        img_file = request.files['image']
        meta_tensor = preprocess_metadata(meta_input, ohe, scaler, device)
        img_tensor = preprocess_image(img_file, device)
        # Inference & Probabilities
        with torch.no_grad():
            output = model(img_tensor, meta_tensor)
            probabilities = torch.softmax(output, dim=1).cpu().numpy()[0]
            pred_idx = output.argmax(dim=1).item()
            pred_label = str(label_classes[pred_idx])
        # "No cancer detected" logic
        if probabilities.max() < 0.5:
            pred_label = "no cancer detected"
        prob_mapping = {str(label_classes[i]): float(prob) for i, prob in enumerate(probabilities)}
        return jsonify({
            "predicted_class": pred_label,
            "class_probabilities": prob_mapping
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
