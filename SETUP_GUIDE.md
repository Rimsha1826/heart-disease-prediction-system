# Project Setup Guide

A comprehensive step-by-step guide for setting up the Heart Disease Prediction System on your local machine.

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Initial Setup](#initial-setup)
3. [Backend Setup (Flask)](#backend-setup-flask)
4. [Frontend Setup (React Native)](#frontend-setup-react-native)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Project Structure Explanation](#project-structure-explanation)

---

## 🖥️ System Requirements

### Minimum Requirements

**Hardware:**
- CPU: Dual-core processor or better
- RAM: 4GB (8GB recommended)
- Storage: 5GB free space
- GPU: Optional (NVIDIA CUDA for faster inference)

**Software:**
- Windows 10/11, macOS, or Linux
- Python 3.8 or higher
- Node.js 16 or higher
- npm 7 or higher
- Git

### Verification

```bash
# Check Python version
python --version
# Should output: Python 3.8.x or higher

# Check Node.js version
node --version
# Should output: v16.x or higher

# Check npm version
npm --version
# Should output: 7.x or higher

# Check Git version
git --version
# Should output: git version 2.x or higher
```

---

## 🚀 Initial Setup

### 1. Clone the Repository

```bash
# Clone the project
git clone https://github.com/your-username/heart-disease-prediction.git

# Navigate to project directory
cd heart-disease-prediction

# View project structure
ls  # On macOS/Linux
dir # On Windows
```

### 2. Project Structure Overview

```
heart-disease-prediction/
├── backend/          # Flask API server
├── frontend/         # React Native mobile app
├── docs/            # Documentation files
├── README.md        # Main documentation
├── requirements.txt # Python dependencies
├── .gitignore       # Git ignore rules
├── LICENSE          # MIT License
└── CONTRIBUTING.md  # Contribution guidelines
```

### 3. Create Environment Variables

Create necessary `.env` files:

**Backend `.env`** (`backend/.env`):
```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000

# File Upload
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# API Keys (Optional)
GEMINI_API_KEY=your_api_key_here
```

**Frontend `.env`** (`frontend/.env`):
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=30000

# Other configurations
REACT_APP_DEBUG=true
```

---

## 🔧 Backend Setup (Flask)

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**Verification:**
- You should see `(venv)` prefix in your terminal
- Example: `(venv) PS F:\heart disease prediction classification\backend>`

### Step 3: Install Dependencies

```bash
# Upgrade pip (recommended)
pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt
```

**This will install:**
- Flask (Web framework)
- TensorFlow/Keras (Deep learning)
- OpenCV (Image processing)
- NumPy/SciPy (Mathematics)
- ReportLab (PDF generation)
- And other required packages

**Expected Installation Time:** 5-15 minutes

### Step 4: Verify Models

Check that all Keras model files exist:

```bash
# List model files
ls *.keras  # On macOS/Linux
dir *.keras # On Windows
```

**Should show:**
- `best_model.keras`
- `mi_binary_model.keras`
- `sttc_best.keras`

### Step 5: Run Flask Server

```bash
python app.py
```

**Expected Output:**
```
* Running on http://127.0.0.1:5000
* Debug mode: on
* WARNING in _log_message: "GET / HTTP/1.1" 404 NOT FOUND
```

✅ **Backend is ready!** The server is running on `http://localhost:5000`

### Step 6: Test Backend Health

Open a new terminal:
```bash
# Test if backend is responding
curl http://localhost:5000/health

# Or use Postman:
# GET http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "timestamp": "2024-01-15T10:30:45Z"
}
```

---

## 📱 Frontend Setup (React Native)

### Step 1: Navigate to Frontend Directory

```bash
# From project root directory
cd frontend

# Or if still in backend:
cd ../frontend
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# Or using yarn (if you prefer):
yarn install
```

**Expected Installation Time:** 3-5 minutes

**Packages Installed:**
- React Native (Mobile framework)
- Expo (Development tools)
- React Navigation (Routing)
- Image processing libraries
- And other dependencies

### Step 3: Verify Installation

```bash
# Check if expo is installed globally
expo --version

# If not installed globally, install it:
npm install -g expo-cli
```

### Step 4: Configure API Connection

Edit `frontend/.env`:
```env
# Should point to your backend server
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=30000
```

If you're on a different machine/network:
```env
# Use your computer's IP address instead of localhost
REACT_APP_API_URL=http://192.168.x.x:5000
```

**To find your IP address:**
```bash
# Windows (PowerShell):
ipconfig

# macOS/Linux:
ifconfig
# Look for the local IP address (usually 192.168.x.x or 10.x.x.x)
```

### Step 5: Start Expo Development Server

```bash
npm start
```

**Expected Output:**
```
expo start v[version]
To view your app with live reload, point the Expo app to this QR code.
You can scan this with the Expo app or press the following:

 i  iPhone users can scan the QR code above.
 a  Android users can scan the QR code above.
 w  Open the web version of your app.
 r  Reload app
 m  Toggle device menu
 e  Toggle developer menu
```

---

## 🏃 Running the Application

### Method 1: Development Mode (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Method 2: Using Android Phone/Emulator

#### Option A: With Physical Android Phone

1. **Install Expo Go App:**
   - Open Google Play Store
   - Search "Expo Go"
   - Install and open the app

2. **Run Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Connect:**
   - On your phone, open Expo Go app
   - Scan the QR code displayed in terminal

#### Option B: With Android Emulator

1. **Install Android Studio** and create an emulator

2. **Run Frontend:**
   ```bash
   cd frontend
   npm run android
   ```

### Method 3: Web Version

```bash
cd frontend
npm run web
```

Opens in browser at `http://localhost:19006`

---

## 🐛 Troubleshooting

### Backend Issues

#### Issue: "ModuleNotFoundError: No module named 'flask'"

**Solution:**
```bash
# Make sure virtual environment is activated
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux

# Reinstall dependencies
pip install -r requirements.txt
```

#### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Find process using port 5000
# Windows (PowerShell):
netstat -ano | findstr :5000

# macOS/Linux:
lsof -i :5000

# Kill the process
# Windows:
taskkill /PID <PID> /F

# macOS/Linux:
kill -9 <PID>
```

Or change the port in `backend/.env`:
```env
PORT=5001
```

#### Issue: "Keras model loading error"

**Solution:**
```bash
# Check if model files exist
ls *.keras

# If missing, you need to:
# 1. Train the models (see training documentation)
# 2. Or download pre-trained models

# Reinstall TensorFlow:
pip install --upgrade tensorflow
```

### Frontend Issues

#### Issue: "npm: command not found"

**Solution:**
```bash
# Install Node.js from https://nodejs.org/
# Restart terminal after installation
# Verify:
node --version
npm --version
```

#### Issue: "Expo app can't connect to backend"

**Solution:**
1. **Check API URL in `.env`:**
   ```env
   REACT_APP_API_URL=http://192.168.x.x:5000
   ```

2. **Verify Backend is Running:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Check Network Connection:**
   - Both devices should be on same network
   - Check firewall settings

#### Issue: "Image upload fails"

**Solution:**
```bash
# Check backend uploads folder exists
# In backend directory:
mkdir uploads

# Verify permissions:
chmod 755 uploads  # macOS/Linux
```

### General Issues

#### Issue: "Connection refused"

**Solution:**
```bash
# Restart both servers
# Terminal 1 - Ctrl+C to stop backend
# Terminal 2 - Ctrl+C to stop frontend

# Start backend first, wait 5 seconds
# Then start frontend
```

#### Issue: "CORS error"

**Solution:**
Backend already has CORS enabled. If you still get errors:
```python
# In backend/app.py, check:
from flask_cors import CORS
CORS(app)
```

#### Issue: Slow Performance

**Solution:**
```bash
# Reduce image size in frontend
# Use lower resolution models
# Check system resources (RAM, CPU)

# Clear cache:
# Frontend: npm install clean-install
# Backend: pip cache purge
```

---

## 📁 Project Structure Explanation

### Backend Structure

```
backend/
├── app.py                    # Main Flask application
│   ├── Routes: /health, /predict, /generate-report
│   ├── Image processing logic
│   └── Model inference
│
├── requirements.txt          # Python dependencies
├── .env                      # Environment configuration
│
├── best_model.keras         # Multi-class classification model
├── mi_binary_model.keras    # MI detection model
├── sttc_best.keras          # ST/T Change model
│
└── uploads/                 # Temporary uploaded images
    └── [temporary image files]
```

### Frontend Structure

```
frontend/
├── App.js                   # Root component
├── app.json                 # Expo configuration
├── index.js                 # Entry point
├── package.json             # Dependencies
├── .env                     # Environment variables
│
├── assets/                  # Static files
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── src/
    ├── screens/             # Navigation screens
    │   ├── SplashScreen.js
    │   ├── WelcomeScreen.js
    │   ├── PatientInfoScreen.js
    │   ├── ImageUploadScreen.js
    │   ├── ProcessingScreen.js
    │   └── PredictionResultsScreen.js
    │
    ├── services/            # API calls
    │   └── api.js
    │
    ├── components/          # Reusable components
    │   └── [component files]
    │
    ├── utils/               # Helper functions
    │   └── [utility files]
    │
    └── styles/              # Styling
        └── theme.js
```

---

## ✅ Verification Checklist

### Backend Checklist
- [ ] Python 3.8+ installed
- [ ] Virtual environment created and activated
- [ ] All dependencies installed (`pip list` shows all packages)
- [ ] `.env` file created with correct values
- [ ] Model files exist (`.keras` files present)
- [ ] Backend runs without errors
- [ ] `/health` endpoint responds

### Frontend Checklist
- [ ] Node.js 16+ installed
- [ ] npm dependencies installed
- [ ] `.env` file created with correct API URL
- [ ] Expo CLI installed globally
- [ ] `npm start` runs without errors
- [ ] Can scan QR code with Expo Go

### Integration Checklist
- [ ] Backend and frontend both running
- [ ] Frontend can communicate with backend
- [ ] Can upload image and get prediction
- [ ] PDF generation works
- [ ] No console errors in either application

---

## 🎉 Next Steps

Once setup is complete:

1. **Explore the Application:**
   - Test all screens
   - Try uploading different ECG images
   - Generate PDF reports

2. **Read Documentation:**
   - Check `docs/` folder for detailed guides
   - Review API documentation
   - Understand model architecture

3. **Make Contributions:**
   - Check `CONTRIBUTING.md` for guidelines
   - Look for "good first issue" labels
   - Submit pull requests

4. **Deployment (Optional):**
   - See `docs/DEPLOYMENT.md` for cloud deployment
   - Docker setup available in `docker-compose.yml`

---

## 📞 Need Help?

- **GitHub Issues:** Report bugs or ask questions
- **GitHub Discussions:** Join community discussions
- **Email:** your.email@example.com
- **Documentation:** Check `README.md` and `docs/` folder

---

**Happy Development! 🚀**
