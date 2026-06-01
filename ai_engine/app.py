import streamlit as st
import tensorflow as tf
import numpy as np
import json
import os
from PIL import Image
import cv2

# --- 1. SETUP ---
st.set_page_config(page_title="KrishiSathi AI Portal", layout="centered", page_icon="🌱")

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

@st.cache_resource
def load_assets():
    model_path = os.path.join('scripts', 'Mymodel.h5')
    json_path = os.path.join('scripts', 'class_indices.json')
    
    # Load model with compile=False to avoid most custom layer issues
    model = tf.keras.models.load_model(model_path, compile=False)
    with open(json_path, 'r') as f:
        indices = json.load(f)
    labels = {v: k for k, v in indices.items()}
    return model, labels

try:
    model, labels = load_assets()
except Exception as e:
    st.error(f"Critical Error Loading Model: {e}")

# --- 2. CORE LOGIC ---
def preprocess_image(image: Image.Image):
    if image.mode != 'RGB':
        image = image.convert('RGB')
    image = image.resize((224, 224))
    img_array = np.array(image) / 255.0
    return np.expand_dims(img_array, axis=0)

def verify_leaf(image: Image.Image) -> tuple[bool, str]:
    """Uses Computer Vision to verify if the image is likely a leaf."""
    img_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    
    # 1. Color Check
    hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
    lower_green = np.array([30, 20, 20])
    upper_green = np.array([90, 255, 255])
    lower_brown = np.array([10, 20, 20])
    upper_brown = np.array([30, 255, 255])
    
    mask_g = cv2.inRange(hsv, lower_green, upper_green)
    mask_b = cv2.inRange(hsv, lower_brown, upper_brown)
    leaf_ratio = cv2.countNonZero(cv2.bitwise_or(mask_g, mask_b)) / (img_cv.shape[0] * img_cv.shape[1])
    
    # 2. Texture Check
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    if leaf_ratio < 0.15:
        return False, "Low leaf-color density detected. This doesn't look like a plant leaf."
    if laplacian_var < 10:
        return False, "Image lacks natural texture (likely a digital screenshot)."
    
    return True, "Leaf verified"

# --- 3. UI ---
st.title("🌱 KrishiSathi: AI Disease Portal")
st.markdown("---")

uploaded_file = st.file_uploader("Choose a leaf image...", type=["jpg", "png", "jpeg", "webp"])

if uploaded_file is not None:
    image = Image.open(uploaded_file)
    st.image(image, caption='Uploaded Image', use_container_width=True)
    
    if st.button("🔍 Run AI Diagnosis", use_container_width=True):
        if model is None or labels is None:
            st.error("AI Model not loaded. Please check logs and refresh.")
        else:
            with st.spinner("Analyzing plant patterns..."):
                # 1. CV Verification
                is_leaf, reason = verify_leaf(image)
                
                # 2. AI Prediction
                processed_data = preprocess_image(image)
                preds = model.predict(processed_data, verbose=0)
            
            idx = np.argmax(preds[0])
            confidence = float(preds[0][idx])
            result = labels[idx].replace('___', ' ').replace('_', ' ')

            # Final Decision Logic
            GATEKEEPER_THRESHOLD = 0.70
            
            if not is_leaf:
                st.error(f"🚨 **Non-Leaf Image Detected**")
                st.warning(reason)
            elif confidence < 0.40:
                st.error("🚨 **Unrecognized Patterns**")
                st.info("The AI could not identify any known disease patterns in this leaf.")
            elif confidence < GATEKEEPER_THRESHOLD:
                st.error("🚨 **Low Confidence**")
                st.warning("The AI is not certain about this diagnosis. Please upload a clearer image.")
            else:
                st.success(f"### Diagnosis: {result}")
                st.progress(confidence)
                st.write(f"**Confidence Level:** {confidence*100:.1f}%")
                st.info("💡 **Next Steps:** Check the main dashboard for detailed remedies.")

st.markdown("---")
st.caption("KrishiSathi AI System v1.1.1 | Advanced Leaf Verification Enabled")

