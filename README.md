# Heart Disease Prediction System

> An AI-powered mobile application for early detection of heart diseases using ECG image analysis with deep learning

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-2.3%2B-black?logo=flask)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61dafb?logo=react)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.13%2B-ff6f00?logo=tensorflow)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Platform](https://img.shields.io/badge/Platform-Android-3ddc84?logo=android)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Folder Structure](#folder-structure)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [System Workflow](#system-workflow)
- [Model Details](#model-details)
- [Performance Metrics](#performance-metrics)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)

---

## 🎯 Overview

The **Heart Disease Prediction System** is a Final Year Project designed to assist medical professionals and individuals in the early detection of heart diseases through ECG image analysis. The system leverages advanced deep learning techniques with CNN-based models to classify ECG images and predict various cardiac conditions.

This mobile-first application allows users to:
- Input patient demographic information
- Upload or capture ECG images
- Receive AI-powered disease predictions with confidence scores
- Generate and share comprehensive PDF reports
- Track prediction history and risk assessment

The system achieves **>80% accuracy** in multi-class ECG classification and can generate predictions within seconds, making it suitable for both clinical and personal health monitoring use cases.

---

## ✨ Key Features

- **📸 Multi-Source Image Upload**: Capture ECG images using device camera or select from gallery
- **🔍 Intelligent Image Validation**: Automatic validation of uploaded ECG images before processing
- **🖼️ Advanced Image Preprocessing**: OpenCV-based preprocessing for optimal model input
- **🤖 AI-Powered Prediction**: ResNet50-based CNN model for accurate disease classification
- **📊 Confidence Scoring**: Displays prediction confidence levels and risk assessment
- **📄 PDF Report Generation**: Generates professional medical reports with ReportLab
- **🔐 Secure Data Handling**: Encrypted image processing and temporary file cleanup
- **❌ Comprehensive Error Handling**: Robust validation and user-friendly error messages
- **📱 Mobile-Optimized UI**: Responsive design with smooth navigation and intuitive UX

---

## 🛠️ Tech Stack

### Frontend
- **React Native** (v0.81) - Cross-platform mobile development
- **Expo** - Development and deployment framework
- **React Navigation** - Stack-based navigation system
- **Expo Image Picker** - Camera and gallery integration
- **Expo Image Manipulator** - Image processing on client-side
- **Expo Linear Gradient** - UI visual enhancements

### Backend
- **Flask** (v2.3+) - RESTful API server
- **Flask-CORS** - Cross-origin resource sharing
- **Python** (v3.8+) - Server-side logic

### AI/Deep Learning
- **TensorFlow** (v2.13+) - Deep learning framework
- **Keras** - High-level API for model building
- **ResNet50** - Pre-trained CNN architecture for ECG classification
- **OpenCV** - Image processing and preprocessing
- **NumPy** - Numerical computations
- **Pillow** - Image manipulation

### Additional Libraries
- **ReportLab** - PDF generation and formatting
- **Google Generative AI** - Optional AI-powered insights
- **python-dotenv** - Environment variable management

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Native App                        │
│              (Android Client - Patient Interface)               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                    REST API Calls
                    (HTTP/JSON)
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                       Flask Backend                             │
│                  (Python REST API Server)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Request Handler  │  │ Image Validation │  │   Routing    │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│         ▼                     ▼                      ▼            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │     OpenCV       │  │   Preprocessing  │  │   Model      │  │
│  │   Processing     │  │                  │  │  Inference   │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│         ▼                     ▼                      ▼            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Trained Keras Models (ResNet50)              │   │
│  │  • best_model.keras                                    │   │
│  │  • mi_binary_model.keras                               │   │
│  │  • sttc_best.keras                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│         ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │    ReportLab PDF Generation & Response Building        │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
heart-disease-prediction-system/
│
├── 📂 backend/
│   ├── app.py                          # Main Flask application
│   ├── requirements.txt                # Python dependencies
│   ├── best_model.keras               # Multi-class ECG classification model
│   ├── mi_binary_model.keras          # Myocardial Infarction detection model
│   ├── sttc_best.keras                # ST/T Change classification model
│   ├── uploads/                        # Temporary directory for uploaded images
│   └── .env                            # Environment variables (API keys, etc.)
│
├── 📂 frontend/
│   ├── App.js                         # Root application component
│   ├── app.json                       # Expo configuration
│   ├── index.js                       # Entry point
│   ├── package.json                   # JavaScript dependencies
│   ├── .env                           # Frontend environment variables
│   │
│   ├── 📂 assets/                     # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   └── 📂 src/
│       ├── 📂 screens/                # Navigation screens
│       │   ├── SplashScreen.js        # App splash/loading screen
│       │   ├── WelcomeScreen.js       # Welcome & login screen
│       │   ├── PatientInfoScreen.js   # Patient data input form
│       │   ├── ImageUploadScreen.js   # Image capture/upload interface
│       │   ├── ProcessingScreen.js    # Loading/processing indicator
│       │   └── PredictionResultsScreen.js  # Results display & report
│       │
│       ├── 📂 services/              # API communication layer
│       │   └── api.js
│       │
│       ├── 📂 components/            # Reusable UI components
│       │   ├── Button.js
│       │   ├── Card.js
│       │   └── ...
│       │
│       ├── 📂 utils/                 # Helper functions
│       │   ├── validators.js
│       │   ├── formatters.js
│       │   └── constants.js
│       │
│       └── 📂 styles/                # Centralized styling
│           └── theme.js
│
├── 📂 models/                         # Model training scripts (optional)
│   ├── training_script.py
│   └── README.md
│
├── 📂 docs/                           # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── SETUP_GUIDE.md
│   ├── DEPLOYMENT.md
│   └── MODEL_TRAINING.md
│
├── 📂 screenshots/                    # Screenshots for README
│   ├── app_screenshots/
│   └── demo_gifs/
│
├── .gitignore                         # Git ignore rules
├── README.md                          # Project documentation (this file)
├── CONTRIBUTING.md                    # Contribution guidelines
├── LICENSE                            # MIT License
└── docker-compose.yml                 # Docker setup (optional)
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Python** 3.8 or higher
- **Node.js** 16+ and npm
- **Android SDK** (for Android development) or **Expo Go** app
- **Git**

### Backend Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/heart-disease-prediction.git
cd heart-disease-prediction/backend
```

#### 2. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
FLASK_ENV=development
FLASK_DEBUG=True
PORT=5000
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
GEMINI_API_KEY=your_api_key_here
```

#### 5. Run Flask Server
```bash
python app.py
```

The backend server will start at `http://localhost:5000`

### Frontend Setup

#### 1. Navigate to Frontend Directory
```bash
cd ../frontend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment Variables
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=30000
```

#### 4. Start Development Server

**Option A: Using Expo (Recommended)**
```bash
# Start Expo development server
npm start

# For Android (requires Android SDK or Expo Go app):
npm run android

# For iOS (macOS only):
npm run ios

# For Web:
npm run web
```

**Option B: Using Expo Go App**
- Download **Expo Go** from Google Play Store or App Store
- Run `npm start`
- Scan the QR code with Expo Go app on your device

### Running Both Backend and Frontend

#### Using Separate Terminals (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS/Linux
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000
```

### Endpoints

#### 1. **Predict Disease from ECG Image**
- **Method**: `POST`
- **Endpoint**: `/predict`
- **Content-Type**: `multipart/form-data`

**Request Parameters:**
```json
{
  "file": "ecg_image.jpg",
  "patient_name": "John Doe",
  "patient_age": 45,
  "patient_gender": "M"
}
```

**Response:**
```json
{
  "success": true,
  "prediction": "MI",
  "prediction_name": "Myocardial Infarction",
  "confidence": 0.87,
  "risk_level": "High",
  "model_used": "best_model.keras",
  "timestamp": "2024-01-15T10:30:45Z",
  "patient_info": {
    "name": "John Doe",
    "age": 45,
    "gender": "M"
  }
}
```

#### 2. **Generate PDF Report**
- **Method**: `POST`
- **Endpoint**: `/generate-report`
- **Content-Type**: `application/json`

**Request Body:**
```json
{
  "patient_name": "John Doe",
  "patient_age": 45,
  "patient_gender": "M",
  "prediction": "MI",
  "confidence": 0.87,
  "risk_level": "High",
  "timestamp": "2024-01-15T10:30:45Z"
}
```

**Response:**
- Returns PDF file as binary data
- Content-Type: `application/pdf`

#### 3. **Health Check**
- **Method**: `GET`
- **Endpoint**: `/health`

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "timestamp": "2024-01-15T10:30:45Z"
}
```

### Error Responses

**400 - Bad Request:**
```json
{
  "success": false,
  "error": "No image file provided"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "error": "Model inference failed"
}
```

---

## 🔄 System Workflow

### Complete User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: User Launches Application                               │
│ ├─ Splash Screen displayed                                      │
│ └─ App initializes and checks internet connectivity             │
└──────────────────────┬──────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Welcome & Authentication                                │
│ ├─ User views welcome screen                                    │
│ └─ User can proceed to patient information form                 │
└──────────────────────┬──────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Patient Information Input                               │
│ ├─ User enters name, age, gender                                │
│ ├─ Optional: Additional medical history                         │
│ └─ User confirms and proceeds                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: ECG Image Capture/Upload                                │
│ ├─ Option 1: Capture using device camera                        │
│ ├─ Option 2: Select from device gallery                         │
│ └─ Image preview & confirmation                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: Client-Side Image Validation                            │
│ ├─ Verify file format (JPG, PNG, JPEG)                          │
│ ├─ Check file size (Max: 16MB)                                  │
│ ├─ Validate image dimensions                                    │
│ └─ Display loading/processing screen                            │
└──────────────────────┬──────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 6: Send to Backend API                                     │
│ ├─ Upload image + patient info to /predict endpoint             │
│ └─ Send via multipart/form-data                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 7: Backend Image Processing                                │
│ ├─ Save uploaded image temporarily                              │
│ ├─ OpenCV-based preprocessing:                                  │
│ │  ├─ Resize to model input size (e.g., 224x224)               │
│ │  ├─ Normalize pixel values [0, 1]                            │
│ │  ├─ Apply histogram equalization                             │
│ │  └─ Convert color space if needed                            │
│ └─ Clean temporary files                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 8: CNN Model Inference                                     │
│ ├─ Load appropriate Keras model                                 │
│ ├─ Run prediction on preprocessed image                         │
│ ├─ Classes: CD, HYP, MI, NORM, STTC                             │
│ └─ Get confidence scores for each class                         │
└──────────────────────┬──────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 9: Post-Processing & Risk Assessment                       │
│ ├─ Determine primary prediction (highest confidence)            │
│ ├─ Apply confidence thresholds:                                 │
│ │  ├─ CD: 45%     HYP: 45%    MI: 54%                           │
│ │  ├─ NORM: 50%   STTC: 58%                                     │
│ ├─ Calculate risk level (Low/Medium/High)                       │
│ └─ Format response with all details                             │
└──────────────────────┬──────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 10: Display Results                                        │
│ ├─ Show prediction with confidence score                        │
│ ├─ Display disease name and description                         │
│ ├─ Show risk level with visual indicator                        │
│ ├─ Provide medical recommendations                              │
│ └─ Offer PDF report generation                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 11: PDF Report Generation (Optional)                       │
│ ├─ User requests PDF report                                     │
│ ├─ Backend generates professional report with:                  │
│ │  ├─ Patient information                                       │
│ │  ├─ Prediction results                                        │
│ │  ├─ Confidence scores                                         │
│ │  ├─ Risk assessment                                           │
│ │  ├─ Medical recommendations                                   │
│ │  └─ Timestamp & disclaimer                                    │
│ └─ Send PDF to frontend                                         │
└──────────────────────┬──────────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 12: Share or Save Results                                  │
│ ├─ User can download PDF                                        │
│ ├─ User can share PDF via email/messaging                       │
│ ├─ Store results locally on device                              │
│ └─ Option to start new prediction                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Model Details

### ResNet50-Based CNN Architecture

**Model Specifications:**
- **Base Architecture**: ResNet50 (Residual Network with 50 layers)
- **Input Shape**: 224 × 224 × 3 (RGB images)
- **Output Classes**: 5 (CD, HYP, MI, NORM, STTC)
- **Framework**: Keras/TensorFlow

**Model Files:**
| Model | Purpose | Accuracy | Threshold |
|-------|---------|----------|-----------|
| `best_model.keras` | Multi-class ECG classification | 82%+ | N/A |
| `mi_binary_model.keras` | Myocardial Infarction detection | 85%+ | 54% |
| `sttc_best.keras` | ST/T Change classification | 80%+ | 58% |

### ECG Classification Classes

| Class | Full Name | Description | Risk Level |
|-------|-----------|-------------|-----------|
| **NORM** | Normal ECG | Healthy heart rhythm | Low |
| **CD** | Conduction Disturbance | Abnormal electrical conduction | Medium |
| **HYP** | Hypertrophy | Heart muscle thickening | Medium |
| **MI** | Myocardial Infarction | Heart attack | High |
| **STTC** | ST/T Change | ECG waveform abnormality | Medium-High |

### Training Dataset
- **Dataset**: ECG image dataset similar to PTB-XL
- **Total Samples**: ~15,000+ annotated ECG images
- **Train/Validation/Test Split**: 70/15/15
- **Augmentation**: Rotation, zoom, horizontal flip, brightness adjustment

---

## 📊 Performance Metrics

### Model Performance
```
┌─────────────────┬──────────────┬────────────┬───────────┐
│ Class           │ Precision    │ Recall     │ F1-Score  │
├─────────────────┼──────────────┼────────────┼───────────┤
│ Normal (NORM)   │ 0.84         │ 0.86       │ 0.85      │
│ Conduction (CD) │ 0.78         │ 0.76       │ 0.77      │
│ Hypertrophy(HYP)│ 0.81         │ 0.80       │ 0.80      │
│ MI              │ 0.87         │ 0.85       │ 0.86      │
│ ST/T (STTC)     │ 0.79         │ 0.82       │ 0.80      │
├─────────────────┼──────────────┼────────────┼───────────┤
│ **Avg**         │ **0.82**     │ **0.82**   │ **0.82**  │
└─────────────────┴──────────────┴────────────┴───────────┘

Overall Accuracy: 82.3%
Overall Loss: 0.52
```

### System Performance
- **Average Prediction Time**: 2-3 seconds
- **Model Loading Time**: 1-2 seconds
- **Image Processing Time**: 0.5-1 second
- **PDF Generation Time**: 2-3 seconds
- **Supported Devices**: Android 8.0+
- **Minimum RAM Required**: 2GB
- **Storage Required**: ~500MB

---

## 📸 Screenshots

### Application Screenshots

> Add screenshots below to showcase your application UI

**Splash & Welcome Screen**
```
[Splash Screen Image]          [Welcome Screen Image]
```

**Patient Information Screen**
```
[Patient Info Form Image]      [Validation Message Image]
```

**Image Upload & Processing**
```
[Image Upload Screen Image]    [Processing Screen Image]
```

**Results & Report**
```
[Prediction Results Image]     [PDF Report Preview Image]
```

### Workflow Diagram
![System Architecture](./docs/architecture-diagram.png)

---

## 🚀 Future Improvements

### Phase 1: Enhanced Features (Q2 2024)
- [ ] **Real-time ECG monitoring** via wearable devices
- [ ] **Multi-language support** (Spanish, French, Chinese)
- [ ] **Dark mode** implementation
- [ ] **Offline prediction capability** with model optimization
- [ ] **Prediction history** with local storage

### Phase 2: Clinical Integration (Q3 2024)
- [ ] **Doctor verification module** for professional review
- [ ] **Electronic Health Records (EHR) integration**
- [ ] **Real-time hospital integration** with alert systems
- [ ] **Patient-to-doctor messaging** feature
- [ ] **Appointment scheduling** system

### Phase 3: Advanced AI (Q4 2024)
- [ ] **Ensemble models** combining multiple CNN architectures
- [ ] **Explainable AI (XAI)** with attention maps visualization
- [ ] **Federated learning** for privacy-preserving model updates
- [ ] **Larger dataset training** (100,000+ images)
- [ ] **Model quantization** for faster inference on edge devices

### Phase 4: Deployment & Scaling (2025)
- [ ] **Web-based deployment** using Flask + React
- [ ] **Cloud deployment** (AWS, Google Cloud, Azure)
- [ ] **Docker containerization** for easy deployment
- [ ] **CI/CD pipeline** with automated testing
- [ ] **Load balancing** for high-traffic scenarios
- [ ] **Database integration** (PostgreSQL/MongoDB)

### Phase 5: Advanced Analytics (2025+)
- [ ] **Statistical analysis dashboard** for researchers
- [ ] **Population-level health insights**
- [ ] **Predictive analytics** for disease progression
- [ ] **Integration with wearable health devices**
- [ ] **Machine learning model improvements** through continuous learning

---

## 🤝 Contributing

Contributions are welcome! To contribute to this project:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/heart-disease-prediction.git
   cd heart-disease-prediction
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow the existing code style and conventions
   - Write clean, documented code
   - Add comments for complex logic

4. **Commit Your Changes**
   ```bash
   git commit -m "Add feature: description of your changes"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear description of your changes
   - Link any related issues
   - Wait for code review and feedback

### Code Style Guidelines
- **Python**: Follow PEP 8 style guide
- **JavaScript**: Follow Airbnb JavaScript style guide
- **Naming**: Use meaningful, descriptive names
- **Comments**: Add comments for non-obvious logic
- **Testing**: Include test cases for new features

### Reporting Issues
Found a bug? Please report it by:
1. Checking if the issue already exists
2. Providing a clear description of the bug
3. Including steps to reproduce
4. Adding any relevant screenshots or logs

---

## 🙏 Acknowledgments

- **TensorFlow & Keras** team for exceptional deep learning tools
- **Flask** community for the robust web framework
- **React Native & Expo** for mobile development capabilities
- **PTB-XL Dataset** creators for the ECG dataset
- **Contributors** and testers who provided valuable feedback

---

## 📚 Additional Resources

- [Keras Documentation](https://keras.io/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Native Documentation](https://reactnative.dev/)
- [ECG Basics](https://www.heart.org/)
- [Deep Learning Papers](https://arxiv.org/)

---

<div align="center">

### Made with ❤️ for cardiac health awareness

**If you found this project helpful, please consider giving it a ⭐ on GitHub!**

[⬆ Back to top](#heart-disease-prediction-system)

</div>
