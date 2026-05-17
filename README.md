# KrishiSathi - AI Plant Care System

A full-stack web application for plant disease detection using leaf images.

## Project Structure
- `/ai_engine`: FastAPI server (Python) handling image analysis with VGG16.
- `/server`: Node.js/Express backend handling Auth, History, and Database (MongoDB).
- `/client`: React/Vite frontend with a modern agricultural UI.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (Running on `localhost:27017`)

### 2. AI Engine (Python)
```bash
cd ai_engine
# Install dependencies
pip install fastapi uvicorn tensorflow pillow numpy opencv-python
# Start the engine
python api.py
```
*Runs on http://localhost:8000*

### 3. Backend (Node.js)
```bash
cd server
# Install dependencies
npm install
# Start the server
npm start
```
*Runs on http://localhost:5000*

### 4. Frontend (React)
```bash
cd client
# Install dependencies
npm install
# Start the development server
npm run dev
```
*Runs on http://localhost:5173*

## Key Features
- **User Auth:** Secure Register/Login system.
- **AI Analysis:** VGG16-based disease prediction.
- **Remedies:** Detailed Organic/Chemical treatment suggestions.
- **History:** Dashboard showing all past predictions.
- **Validation:** Automatic rejection of non-leaf or low-confidence images.
