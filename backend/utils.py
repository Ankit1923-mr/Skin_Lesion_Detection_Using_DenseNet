# utils.py
import torch
import numpy as np
import pandas as pd
from PIL import Image
from torchvision import transforms
import torch.nn as nn
from torchvision import models

def get_device():
    return torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Model definition from your architecture
class HybridCNN(nn.Module):
    def __init__(self, num_meta_features, num_classes):
        super().__init__()
        self.densenet = models.densenet121(pretrained=False)
        self.densenet.classifier = nn.Identity()
        self.meta_net = nn.Sequential(
            nn.Linear(num_meta_features,128),
            nn.ReLU(), nn.BatchNorm1d(128), nn.Dropout(0.4),
            nn.Linear(128,128),
            nn.ReLU(), nn.BatchNorm1d(128), nn.Dropout(0.3),
            nn.Linear(128,64),
            nn.ReLU(), nn.BatchNorm1d(64), nn.Dropout(0.2)
        )
        self.classifier = nn.Sequential(
            nn.Linear(1024 + 64,1024), nn.ReLU(), nn.BatchNorm1d(1024), nn.Dropout(0.5),
            nn.Linear(1024,512), nn.ReLU(), nn.BatchNorm1d(512), nn.Dropout(0.5),
            nn.Linear(512,128), nn.ReLU(), nn.BatchNorm1d(128), nn.Dropout(0.5),
            nn.Linear(128,128), nn.ReLU(), nn.BatchNorm1d(128), nn.Dropout(0.5),
            nn.Linear(128,num_classes)
        )
    def forward(self, img, meta):
        img_feat = self.densenet(img)
        meta_feat = self.meta_net(meta)
        return self.classifier(torch.cat([img_feat, meta_feat], dim=1))

def load_model(num_meta_features, num_classes, weights_path, device):
    model = HybridCNN(num_meta_features, num_classes)
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model.to(device)
    model.eval()
    return model

def preprocess_metadata(meta_input, ohe, scaler, device):
    categorical_cols = ['sex', 'dx_type', 'localization']
    # Input should match expected values (case-sensitive)
    meta_df = pd.DataFrame([meta_input])
    ohe_features = ohe.transform(meta_df[categorical_cols])
    processed_input = np.hstack([ohe_features, meta_df[['age']]])
    scaled_input = scaler.transform(processed_input)
    meta_tensor = torch.tensor(scaled_input, dtype=torch.float32).to(device)
    return meta_tensor

def preprocess_image(img_file, device):
    image_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    img = Image.open(img_file).convert("RGB")
    img_tensor = image_transform(img).unsqueeze(0).to(device)  # Shape: (1, 3, 224, 224)
    return img_tensor

def predict_class(model, img_tensor, meta_tensor, label_classes):
    with torch.no_grad():
        output = model(img_tensor, meta_tensor)
        pred_idx = output.argmax(dim=1).item()
        pred_label = str(label_classes[pred_idx])
        probabilities = torch.softmax(output, dim=1).cpu().numpy()[0]
        prob_mapping = {str(label_classes[i]): float(prob) for i, prob in enumerate(probabilities)}
    return pred_label, prob_mapping
