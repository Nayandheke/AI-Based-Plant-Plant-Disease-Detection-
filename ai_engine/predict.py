import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image

# Suppress logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

def run_prediction(test_image_path):
    # Update these paths to match your screenshot
    model_path = 'scripts/Mymodel.h5'
    json_path = 'scripts/class_indices.json'

    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}")
        return

    # 1. Load Model and Labels
    model = tf.keras.models.load_model(model_path)
    with open(json_path, 'r') as f:
        indices = json.load(f)
    
    labels = {v: k for k, v in indices.items()}

    # 2. Process Image
    img = image.load_img(test_image_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0

    # 3. Predict
    preds = model.predict(img_array, verbose=0)
    idx = np.argmax(preds[0])
    conf = np.max(preds[0])

    print("\n" + "="*40)
    print(f"IMAGE: {os.path.basename(test_image_path)}")
    print(f"RESULT: {labels[idx]}")
    print(f"CONFIDENCE: {conf*100:.2f}%")
    print("="*40 + "\n")

if __name__ == "__main__":
    # Choose any image from your 'test' folder to verify
    # Example: dataset/test/Tomato___Bacterial_spot/some_image.JPG
    sample_path = 'dataset/test/test/TomatoHealthy4.JPG' 
    
    if os.path.exists(sample_path):
        run_prediction(sample_path)
    else:
        print("Please provide a valid image path in the script!")