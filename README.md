# 🛡️ SafeBite AI

### Real-time AI-Powered Kitchen Hygiene & Compliance Monitoring System

SafeBite AI is a full-stack, state-of-the-art solution designed to bridge the trust gap between food delivery consumers and commercial kitchens. By leveraging computer vision and automated auditing, SafeBite AI provides real-time compliance tracking of kitchen staff safety gear (caps/hairnets, aprons, and gloves). This score is directly displayed to consumers on a food delivery interface (simulated Swiggy viewport), incentivizing merchants to maintain pristine sanitation conditions.

---

## 🚀 Key Features

*   **YOLOv8 Computer Vision Engine**: Real-time object detection targeting essential kitchen safety gear (cap, apron, gloves) with bounding-box analysis using [ml-engine/main.py](./ml-engine/main.py).
*   **Dual Mode ML/Simulation**: If the YOLOv8 model cannot be loaded, the system automatically falls back to a smart Computer Vision Simulation/Heuristics engine to remain functional.
*   **Dynamic Score Degradation**: Encourages continuous merchant auditing. If a kitchen fails to upload a fresh snapshot within **30 minutes**, its hygiene score degrades progressively by 5 points every 10 minutes down to a minimum score of 10.
*   **Unified Flexible Database**: Implemented in [backend/db.js](./backend/db.js), it automatically connects to MongoDB but falls back to a local, file-based JSON DB (`backend/data/db.json`) if MongoDB is unavailable.
*   **Vite-Powered React Dashboard**:
    *   **Consumer Viewport**: Simulated Swiggy-like delivery application displaying the live hygiene badge and details.
    *   **Merchant Console**: Interface for merchants to upload camera snapshots, check real-time compliance results, and view active alerts.
    *   **Compliance Timeline**: Comprehensive interactive log showing visual overlays of detected gear and past violations.
    *   **District Analytics Panel**: Aggregated live charts, average compliance index, violation breakdowns, and a merchant leaderboard.

---

## 📂 Project Architecture

```
safe-biteAI/
├── backend/                       # Node.js/Express Backend Gateway
│   ├── data/                      # Local JSON Database storage directory
│   ├── uploads/                   # Uploaded kitchen snapshots
│   ├── db.js                      # Database interface (Mongoose + JSON fallback)
│   ├── server.js                  # Gateway server hosting APIs & upload endpoints
│   ├── test_connection.js         # Integration checks for the database layer
│   ├── test_integration.js        # E2E integration test (Gateway + ML Engine)
│   └── test_live_upload.js        # Live upload verification script
├── frontend/                      # React / Vite Client Application
│   ├── src/
│   │   ├── components/            # Reusable UI widgets
│   │   │   ├── ComplianceTimeline.jsx # Historical violations timeline & canvas drawer
│   │   │   ├── LiveCCTVStream.jsx     # CCTV feed stream handler
│   │   │   ├── MerchantConsole.jsx    # Upload snapshots & merchant telemetry
│   │   │   └── SwiggyViewport.jsx     # Food delivery frontend mockup
│   │   ├── App.jsx                # Main Application Container & Analytics Panel
│   │   ├── index.css              # Glassmorphic Dark-mode stylesheet
│   │   └── main.jsx               # React DOM Entrypoint
│   └── vite.config.js             # Vite proxy and port configurations
├── ml-engine/                     # Python FastAPI Computer Vision Microservice
│   ├── main.py                    # YOLOv8 inference endpoints
│   ├── requirements.txt           # Python packages
│   └── test_ml.py                 # FastAPI Endpoint unit testing suite
└── yolov8n.pt                     # Pre-trained YOLOv8 Nano weights file
```

---

## 🛠️ Getting Started

Follow the steps below to set up and run the entire suite locally.

### 1. Pre-requisites
*   **Node.js** (v16+)
*   **Python 3.8+**
*   **MongoDB** (Optional, falls back automatically to local file database)

---

### 2. ML Engine Setup (Python/FastAPI)

1. Navigate to the `ml-engine` directory:
   ```bash
   cd ml-engine
   ```
2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies listed in [ml-engine/requirements.txt](./ml-engine/requirements.txt):
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   python main.py
   ```
   The service will boot on `http://127.0.0.1:8000`. You can inspect the interactive docs at `/docs`.

---

### 3. Backend Gateway Setup (Node.js/Express)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies listed in [backend/package.json](./backend/package.json):
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   The server will start on `http://127.0.0.1:5000`. It will attempt to connect to MongoDB; if not found, it gracefully initiates local JSON DB mode.

---

### 4. Frontend Dashboard Setup (React/Vite)

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies listed in [frontend/package.json](./frontend/package.json):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your web browser. The frontend is configured via [frontend/vite.config.js](./frontend/vite.config.js) to proxy requests to `/api` and `/uploads` straight to the Node.js backend.

---

## 🧪 Testing and Verification

The project includes built-in verification scripts to quickly validate operations.

### ML Engine Endpoint Tests
To run unit tests for the ML FastAPI router, execute:
```bash
cd ml-engine
python test_ml.py
```
This tests both clean kitchen and dirty kitchen images (triggers mock/live YOLO inferences) and confirms scores.

### Express Database Connection Test
To test the backend connection status, run:
```bash
cd backend
node test_connection.js
```

### End-to-End Integration Verification
To verify the full integration (spins up both FastAPI and Express automatically, uploads a test image, runs the prediction pipelines, and updates the score):
```bash
cd backend
node test_integration.js
```

---

## 📊 Score Calculation Logic

The compliance engine scores a kitchen snapshot out of **100 points** based on the presence of three mandatory hygiene markers:
*   **Cap / Hairnet**: `30 points`
*   **Apron**: `40 points`
*   **Gloves**: `30 points`

If any item is missing, a violation is added (e.g., `Missing Gloves`), and the respective weight is deducted. The overall restaurant score is computed as the moving average of all uploaded snapshots.
