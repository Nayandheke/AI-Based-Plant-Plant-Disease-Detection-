# KrishiSathi - AI Plant Care System

A full-stack web application for plant disease detection using leaf images.

## Project Structure

- /ai_engine: FastAPI server (Python) handling image analysis with VGG16.
- /server: Node.js/Express backend handling API routing and remedy mapping.
- /client: React/Vite frontend with a modern agricultural UI.

## Algorithm and Logic

The system utilizes a Deep Learning approach for image classification:

- Model Architecture: Convolutional Neural Network (CNN) based on the VGG16 architecture.
- AI Gatekeeper: A preliminary Computer Vision layer using OpenCV that verifies color (HSV ranges) and texture (Laplacian variance) to ensure the uploaded image is a leaf before running the AI prediction.
- Validation: Rejects non-leaf images or low-confidence predictions to maintain diagnostic accuracy.

## Setup Instructions

### 1. Prerequisites

- Node.js (v18+)
- Python (3.9+)

### 2. AI Engine (Python)

```bash
cd ai_engine
# Install dependencies
pip install fastapi uvicorn tensorflow pillow numpy opencv-python
# Start the engine
python api.py
```
Runs on http://localhost:8000

### 3. Backend (Node.js)

```bash
cd server
# Install dependencies
npm install
# Start the server
npm start
```
Runs on http://localhost:5000

### 4. Frontend (React)

```bash
cd client
# Install dependencies
npm install
# Start the development server
npm run dev
```
Runs on http://localhost:5173

## Key Features

- AI Analysis: VGG16-based disease prediction with high accuracy.
- Gatekeeper Layer: Automatic rejection of non-leaf or low-quality images.
- Remedies: Detailed organic and chemical treatment suggestions for identified diseases.
- Modern Interface: Responsive dashboard built with React and Tailwind CSS.
