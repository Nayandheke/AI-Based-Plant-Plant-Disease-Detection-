import os
import io
import json
import numpy as np
import tensorflow as tf
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import base64

# Initialize FastAPI
app = FastAPI(
    title="Krishi-Sathi AI Engine",
    description="Plant Disease Detection API (Standardized)",
    version="1.1.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. GPU & MODEL SETUP ---
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# --- MONKEYPATCH FOR KERAS 3 FLATTEN BUG ---
from tensorflow.keras.layers import Flatten
if not hasattr(Flatten, '_patched'):
    old_call = Flatten.call
    def new_call(self, inputs, **kwargs):
        if isinstance(inputs, list) and len(inputs) == 1:
            return old_call(self, inputs[0], **kwargs)
        return old_call(self, inputs, **kwargs)
    Flatten.call = new_call

    if hasattr(Flatten, 'compute_output_spec'):
        old_cos = Flatten.compute_output_spec
        def new_cos(self, inputs):
            if isinstance(inputs, list) and len(inputs) == 1:
                return old_cos(self, inputs[0])
            return old_cos(self, inputs)
        Flatten.compute_output_spec = new_cos
    Flatten._patched = True

MODEL_PATH = os.path.join('scripts', 'Mymodel.h5')
CLASS_INDICES_PATH = os.path.join('scripts', 'class_indices.json')

model = None
class_names = None
GATEKEEPER_THRESHOLD = 0.70  # Standard threshold to filter non-leaf images

def load_assets():
    global model, class_names
    try:
        model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        with open(CLASS_INDICES_PATH, 'r') as f:
            indices = json.load(f)
        class_names = {int(v): k for k, v in indices.items()}
        print(f"✅ Assets Loaded: {len(class_names)} classes")
    except Exception as e:
        print(f"❌ Load Error: {e}")
        # If it fails, we try a fallback for certain Keras environments
        try:
             import keras
             model = keras.models.load_model(MODEL_PATH, compile=False)
             print("✅ Assets Loaded via fallback")
        except:
             raise e

@app.on_event("startup")
async def startup_event():
    load_assets()

# --- 2. CORE LOGIC ---
def preprocess_image(image: Image.Image) -> np.ndarray:
    """Standardized preprocessing matching training (simple scaling)"""
    if image.mode != 'RGB':
        image = image.convert('RGB')
    image = image.resize((224, 224))
    img_array = np.array(image) / 255.0
    return np.expand_dims(img_array, axis=0)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return JSONResponse(
            status_code=503, 
            content={"error": "AI Model not loaded on server. Please contact administrator."}
        )
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Run AI
        processed_img = preprocess_image(image)
        preds = model.predict(processed_img, verbose=0)
        
        idx = np.argmax(preds[0])
        confidence = float(preds[0][idx])
        disease_class = class_names[idx]

        # --- GATEKEEPER (Leaf vs Non-Leaf) ---
        # Random objects rarely cross 70% confidence for a specific leaf disease
        if confidence < GATEKEEPER_THRESHOLD:
            return JSONResponse(
                status_code=422,
                content={
                    "error": "Non-Leaf Image Detected",
                    "message": "🚨 The system only accepts leaf images. Please upload a clear image of a supported plant leaf.",
                    "confidence": round(confidence * 100, 2)
                }
            )

        return {
            "prediction": {
                "disease_class": disease_class,
                "confidence": round(confidence * 100, 2)
            },
            "status": "success"
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/health")
async def health():
    return {"status": "online", "model_ready": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
