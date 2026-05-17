import streamlit as st
import tensorflow as tf
import numpy as np
import json
import os
from PIL import Image

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

# --- 2. PREPROCESSING ---
def preprocess_image(image: Image.Image):
    if image.mode != 'RGB':
        image = image.convert('RGB')
    image = image.resize((224, 224))
    img_array = np.array(image) / 255.0
    return np.expand_dims(img_array, axis=0)

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
                # Predict
                processed_data = preprocess_image(image)
                preds = model.predict(processed_data, verbose=0)
            
            idx = np.argmax(preds[0])
            confidence = float(preds[0][idx])
            result = labels[idx].replace('___', ' ').replace('_', ' ')

            # --- GATEKEEPER ---
            THRESHOLD = 0.70
            
            if confidence >= THRESHOLD:
                st.success(f"### Diagnosis: {result}")
                st.progress(confidence)
                st.write(f"**Confidence Level:** {confidence*100:.1f}%")
                
                st.info("💡 **Next Steps:** Check the main dashboard for detailed remedies and treatment plans.")
            else:
                st.error("🚨 **Non-Leaf Image Detected**")
                st.warning("The system is not confident that this is a supported leaf image.")
                st.info("Tips:\n1. Ensure the leaf is the main subject.\n2. Use good lighting.\n3. Make sure the plant is in our 38 supported classes.")

st.markdown("---")
st.caption("KrishiSathi AI System v1.1.0 | Standardized Preprocessing Enabled")
