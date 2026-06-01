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
import cv2

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

def verify_leaf(image: Image.Image) -> tuple[bool, str]:
    """
    Advanced Gatekeeper: Uses Computer Vision to verify if the image is likely a leaf.
    Returns (is_leaf, reason)
    """
    # Convert PIL to OpenCV (BGR)
    img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    
    # 1. Color Check (HSV)
    # Leaves are mostly Green, Yellow, or Brown
    hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
    
    # Ranges
    lower_green = np.array([30, 20, 20])
    upper_green = np.array([90, 255, 255])
    
    lower_brown = np.array([10, 20, 20])
    upper_brown = np.array([30, 255, 255])
    
    mask_g = cv2.inRange(hsv, lower_green, upper_green)
    mask_b = cv2.inRange(hsv, lower_brown, upper_brown)
    leaf_mask = cv2.bitwise_or(mask_g, mask_b)
    
    leaf_pixels = cv2.countNonZero(leaf_mask)
    total_pixels = img_cv.shape[0] * img_cv.shape[1]
    leaf_ratio = leaf_pixels / total_pixels
    
    # 2. Texture/Complexity Check (Laplacian Variance)
    # Screenshots of UI/Text often have very low or very specific high variance
    # Natural leaf photos have a balanced organic texture
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # Thresholds
    if leaf_ratio < 0.15: # Less than 15% of the image is leaf-colored
        return False, "Low leaf-color density detected. Please ensure the leaf is clearly visible."
    
    if laplacian_var < 10: # Very flat image (like a screenshot of a white page)
        return False, "Image lacks natural texture. Please upload a clear photo of a plant leaf."

    return True, "Leaf verified"

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
        
        # --- IMPROVED GATEKEEPER (CV Layer) ---
        is_leaf, reason = verify_leaf(image)
        
        # Run AI Prediction anyway to get confidence
        processed_img = preprocess_image(image)
        preds = model.predict(processed_img, verbose=0)
        
        idx = np.argmax(preds[0])
        confidence = float(preds[0][idx])
        disease_class = class_names[idx]

        # Combine CV check and Confidence check
        # Rejection logic:
        # 1. CV check fails OR
        # 2. Confidence is extremely low (< 40%) OR
        # 3. Confidence is medium-low (< 70%) AND CV check was barely passing
        
        is_rejected = False
        error_msg = ""

        if not is_leaf:
            is_rejected = True
            error_msg = reason
        elif confidence < 0.40:
            is_rejected = True
            error_msg = "🚨 Unrecognized patterns. This does not look like any supported plant leaf."
        elif confidence < GATEKEEPER_THRESHOLD and is_leaf:
            # If CV thinks it's a leaf but AI is unsure, we still reject to avoid false diagnosis
            is_rejected = True
            error_msg = "🚨 Low confidence diagnosis. Please provide a clearer, more centered image of the leaf."

        if is_rejected:
            return JSONResponse(
                status_code=422,
                content={
                    "error": "Non-Leaf Image Detected",
                    "message": error_msg,
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

