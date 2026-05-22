import os, uuid, cv2, base64, json
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import HRFlowable, KeepTogether
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer,
    Table, TableStyle, Image as RLImage)
from datetime import datetime
from io import BytesIO
import tensorflow as tf
import tensorflow.keras.backend as K
from tensorflow.keras.models import load_model
import google.generativeai as genai
from PIL import Image

# ============================================================
# CONFIG & MODELS
# ============================================================
# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
MODEL_FOLDER  = "."
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Gemini API Key from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    print("⚠️  WARNING: GEMINI_API_KEY not set in .env file")
genai.configure(api_key=GEMINI_API_KEY)

CLASS_NAMES = ['CD', 'HYP', 'MI', 'NORM', 'STTC']
CLASS_FULL  = {
    'CD'  : 'Conduction Disturbance',
    'HYP' : 'Hypertrophy',
    'MI'  : 'Myocardial Infarction',
    'NORM': 'Normal ECG',
    'STTC': 'ST/T Change'
}

# Thresholds from your original logic
CD_THR   = 0.45
HYP_THR  = 0.45
NORM_THR = 0.50
MI_THR   = 0.54
STTC_THR = 0.58

MI_MAIN_MIN   = 0.42
STTC_MAIN_MIN = 0.45

COLOR_RISK = {
    'Low'   : colors.HexColor('#22c55e'),
    'Medium': colors.HexColor('#f97316'),
    'High'  : colors.HexColor('#ef4444')
}
NAVY        = colors.HexColor('#1B2A4A')
OFF_WHITE   = colors.HexColor('#F7F9FC')
BORDER_PDF  = colors.HexColor('#D1D9E6')
TEXT_PDF    = colors.HexColor('#1A202C')
MUTED_PDF   = colors.HexColor('#718096')
RED_PDF     = colors.HexColor('#C53030')
RED_LIGHT   = colors.HexColor('#FFF5F5')
RED_BDR     = colors.HexColor('#FED7D7')
GREEN_PDF   = colors.HexColor('#276749')
GREEN_LIGHT = colors.HexColor('#F0FFF4')
ORANGE_PDF  = colors.HexColor('#C05621')
ORANGE_LT   = colors.HexColor('#FFFAF0')
ACCENT_PDF  = colors.HexColor('#2B6CB0')
DIVIDER_PDF = colors.HexColor('#E2E8F0')
RISK_C_PDF  = {'Low': GREEN_PDF, 'Medium': ORANGE_PDF, 'High': RED_PDF}
RISK_BG_PDF = {'Low': GREEN_LIGHT,'Medium': ORANGE_LT,'High': RED_LIGHT}
RISK_BR_PDF = {'Low': colors.HexColor('#9AE6B4'),
                'Medium': colors.HexColor('#FBD38D'),
                'High': RED_BDR}

# Global Model Variables
main_model = None
mi_model   = None
sttc_model = None

# ============================================================
# CUSTOM LOSS FUNCTIONS
# ============================================================
def weighted_focal_loss(weights_array, gamma=2.0):
    wt = tf.constant(weights_array, dtype=tf.float32)
    def loss(y_true, y_pred):
        eps = K.epsilon()
        y_pred = K.clip(y_pred, eps, 1-eps)
        p_t = (y_true*y_pred + (1-y_true)*(1-y_pred))
        focal = K.pow(1-p_t, gamma)
        bce = -(y_true*K.log(y_pred) + (1-y_true)*K.log(1-y_pred))
        return K.mean(focal*bce*wt)
    return loss

def sttc_focal_loss(gamma=2.5, pos_weight=5.5):
    def loss(y_true, y_pred):
        eps = K.epsilon()
        y_pred = K.clip(y_pred, eps, 1-eps)
        bce = -(pos_weight*y_true*K.log(y_pred) + (1-y_true)*K.log(1-y_pred))
        p_t = (y_true*y_pred + (1-y_true)*(1-y_pred))
        focal = K.pow(1-p_t, gamma)
        return K.mean(focal*bce)
    return loss

loss_sttc = sttc_focal_loss(gamma=2.5, pos_weight=5.5)

# ============================================================
# INITIALIZATION
# ============================================================
def initialize_models():
    global main_model, mi_model, sttc_model
    try:
        dummy = np.ones(5, dtype=np.float32)
        loss_fn = weighted_focal_loss(dummy)
        
        main_model = load_model(
            os.path.join(MODEL_FOLDER, "best_model.keras"),
            custom_objects={'weighted_focal_loss': loss_fn, 'loss': loss_fn})
        
        mi_model = load_model(os.path.join(MODEL_FOLDER, "mi_binary_model.keras"))
        
        sttc_model = load_model(
            os.path.join(MODEL_FOLDER, "sttc_best.keras"),
            custom_objects={'sttc_focal_loss': loss_sttc, 'loss': loss_sttc})
        
        print("✅ All 3 Models Loaded Successfully!")
    except Exception as e:
        print(f"❌ Model Load Failed: {e}")

# ============================================================
# HELPERS & PREPROCESSING
# ============================================================
def save_upload(fs):
    ext = os.path.splitext(fs.filename)[1].lower() or ".png"
    path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}{ext}")
    fs.save(path)
    return path
# Add this function after line 144 (after save_upload function)

def validate_file_type(filename):
    """
    Validate uploaded file type
    Returns: (is_valid: bool, message: str)
    """
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
    
    ext = os.path.splitext(filename)[1].lower()
    
    if not ext:
        return False, "No file extension found"
    
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Invalid file type '{ext}'. Only JPG, PNG, WEBP, BMP, and TIFF are allowed."
    
    return True, "Valid file type"

def preprocess_image(img_path, size=(224, 224)):
    img = cv2.imread(img_path)
    if img is None: return None
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.morphologyEx(gray, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    gray = cv2.bilateralFilter(gray, 5, 50, 50)
    gray = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
    gray = cv2.resize(gray, size)
    rgb  = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
    rgb  = (rgb/255.0).astype(np.float32)
    return np.expand_dims(rgb, axis=0)

# ============================================================
# GEMINI VALIDATION (THE NEW PART)
# ============================================================
def is_ecg_image_gemini(img_path):
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        img = Image.open(img_path)
        prompt = (
            "Is this a medical ECG/EKG graph or strip? "
            "Reply strictly in this JSON format: "
            '{"is_ecg": true, "confidence": 95.5, "message": "Valid ECG detected"}'
        )
        response = model.generate_content([prompt, img])
        text = response.text.strip()
        
        if '```' in text:
            text = text.split('```')[1].replace('json', '').strip()
        
        data = json.loads(text)
        return bool(data.get('is_ecg')), float(data.get('confidence', 0)), str(data.get('message', ""))
    except Exception as e:
        print(f"Gemini Error: {e}")
        return True, 50.0, "Validation bypassed due to error"

# ============================================================
# PREDICTION LOGIC
# ============================================================
def predict_ecg(img_input):
    main_preds = main_model.predict(img_input, verbose=0)[0]
    mp = {cls: float(main_preds[i]) for i, cls in enumerate(CLASS_NAMES)}
    mi_p   = float(mi_model.predict(img_input, verbose=0)[0][0])
    sttc_p = float(sttc_model.predict(img_input, verbose=0)[0][0])

    def out(det, risk, status):
        probs = {'CD': mp['CD'], 'HYP': mp['HYP'], 'MI': mi_p, 'NORM': mp['NORM'], 'STTC': sttc_p}
        thrs = {'CD': CD_THR, 'HYP': HYP_THR, 'MI': MI_THR, 'NORM': NORM_THR, 'STTC': STTC_THR}
        return {
            "detected": det, "probabilities": probs, "risk_level": risk, "overall_status": status,
            "classes": [{"class": c, "full_name": CLASS_FULL[c], "probability": round(probs[c]*100, 2),
                         "threshold": round(thrs[c]*100, 0), "detected": c in det} for c in CLASS_NAMES]
        }

    def get_prob(c):
        return mi_p if c == 'MI' else (sttc_p if c == 'STTC' else mp[c])

    # NORM check
    if mp['NORM'] >= NORM_THR:
        return out(['NORM'], "Low", "ECG appears Normal.")

    detected = []
    if mp['CD'] >= CD_THR: detected.append('CD')
    if mp['HYP'] >= HYP_THR: detected.append('HYP')
    
    mi_det = (mi_p >= MI_THR and mp['MI'] >= MI_MAIN_MIN)
    sttc_det = (sttc_p >= STTC_THR and mp['STTC'] >= STTC_MAIN_MIN)

    # MI/STTC Logic
    if mi_det and sttc_det:
        if sttc_p >= mi_p or (mp['MI'] - mp['STTC'] <= 0.08): detected.append('STTC')
        else: detected.append('MI')
    elif mi_det:
        if (mp['MI'] - mp['STTC'] <= 0.08 and sttc_p >= 0.50): detected.append('STTC')
        else: detected.append('MI')
    elif sttc_det:
        detected.append('STTC')

    # Single best result selection
    if len(detected) > 1:
        detected = [max(detected, key=get_prob)]

    # Fallback/Risk calculation
    if not detected:
        candidates = {'CD': mp['CD'], 'HYP': mp['HYP'], 'MI': mi_p, 'STTC': sttc_p}
        top = max(candidates, key=candidates.get)
        if candidates[top] >= 0.35:
            return out([top], "Low", f"Possible {CLASS_FULL[top]} — review needed")
        return out(['NORM'], "Low", "ECG appears Normal.")

    dis = detected[0]
    p = get_prob(dis)
    risk = "High" if p >= 0.70 else "Medium"
    status = f"{'High probability of ' if p >= 0.70 else ''}{CLASS_FULL[dis]} detected"
    return out(detected, risk, status)

# ============================================================
# PDF REPORT GENERATION
# ============================================================


def build_pdf(patient, prediction, ecg_base64=None):
    

    # Colors
    NAVY        = colors.HexColor('#1B2A4A')
    WHITE       = colors.white
    OFF_WHITE   = colors.HexColor('#F7F9FC')
    BORDER      = colors.HexColor('#D1D9E6')
    TEXT        = colors.HexColor('#1A202C')
    MUTED       = colors.HexColor('#718096')
    RED         = colors.HexColor('#C53030')
    RED_LIGHT   = colors.HexColor('#FFF5F5')
    RED_BORDER  = colors.HexColor('#FED7D7')
    GREEN       = colors.HexColor('#276749')
    GREEN_LIGHT = colors.HexColor('#F0FFF4')
    ORANGE      = colors.HexColor('#C05621')
    ORANGE_LT   = colors.HexColor('#FFFAF0')
    ACCENT      = colors.HexColor('#2B6CB0')
    DIVIDER     = colors.HexColor('#E2E8F0')

    RISK_C  = {'Low': GREEN,       'Medium': ORANGE,    'High': RED}
    RISK_BG = {'Low': GREEN_LIGHT, 'Medium': ORANGE_LT, 'High': RED_LIGHT}
    RISK_BR = {
        'Low'   : colors.HexColor('#9AE6B4'),
        'Medium': colors.HexColor('#FBD38D'),
        'High'  : RED_BORDER,
    }
    CLASS_FULL_PDF = {
        'CD'  : 'Conduction Disturbance',
        'HYP' : 'Hypertrophy',
        'MI'  : 'Myocardial Infarction',
        'NORM': 'Normal ECG',
        'STTC': 'ST/T Change',
    }

    def _ps(name, font='Helvetica', size=10, color=None,
            align=TA_LEFT, leading=13):
        return ParagraphStyle(name, fontName=font, fontSize=size,
            textColor=color or TEXT, alignment=align, leading=leading)

    buf       = BytesIO()
    now       = datetime.now()
    report_id = f"RPT-{now.strftime('%Y%m%d%H%M%S')}"
    risk      = prediction.get('risk_level', 'Low')
    rc        = RISK_C.get(risk, GREEN)
    rb        = RISK_BG.get(risk, GREEN_LIGHT)
    rbr       = RISK_BR.get(risk, colors.HexColor('#9AE6B4'))
    detected  = prediction.get('detected', ['NORM'])
    classes   = prediction.get('classes', [])
    det_class = detected[0] if detected else 'NORM'
    det_full  = CLASS_FULL_PDF.get(det_class, det_class)
    det_info  = next((c for c in classes if c['class'] == det_class), None)
    det_prob  = det_info['probability'] if det_info else 0
    status    = prediction.get('overall_status', '')
    p_name    = patient.get('name',   'N/A')
    p_age     = str(patient.get('age', 'N/A'))
    p_gender  = patient.get('gender', 'N/A')

    doc = SimpleDocTemplate(buf, pagesize=A4,
        rightMargin=1.5*cm, leftMargin=1.5*cm,
        topMargin=1.0*cm,   bottomMargin=1.0*cm)
    story = []

    # ── HEADER ──────────────────────────────────────────────
    hdr = Table([[
        Table([
            [Paragraph('<b>CardioScan AI</b>', ParagraphStyle('logo',
                fontName='Helvetica-Bold', fontSize=18,
                textColor=NAVY, leading=22))],
            [Paragraph('Automated Electrocardiogram Analysis',
                _ps('sub', size=8, color=MUTED))],
            [HRFlowable(width=8*cm, thickness=1.2,
                color=ACCENT, spaceAfter=0)],
            
        ], colWidths=[9*cm]),
        Table([
            [Paragraph('ELECTROCARDIOGRAM ANALYSIS REPORT',
                ParagraphStyle('rtt', fontName='Helvetica-Bold', fontSize=8,
                textColor=NAVY, leading=11, alignment=TA_RIGHT))],
            [Spacer(1, 4)],
            [Table([
                [Paragraph('Report No.', _ps('rl', size=7,
                    color=MUTED, font='Helvetica-Bold')),
                 Paragraph(f'<b>{report_id}</b>',
                    _ps('rv', font='Helvetica-Bold', size=7,
                    color=NAVY, align=TA_RIGHT))],
                [Paragraph('Date', _ps('dl', size=7,
                    color=MUTED, font='Helvetica-Bold')),
                 Paragraph(now.strftime('%d %B %Y'),
                    _ps('dv', size=7, color=TEXT, align=TA_RIGHT))],
                [Paragraph('Time', _ps('tl', size=7,
                    color=MUTED, font='Helvetica-Bold')),
                 Paragraph(now.strftime('%I:%M %p'),
                    _ps('tv', size=7, color=TEXT, align=TA_RIGHT))],
            ], colWidths=[2.2*cm, 5.2*cm],
               style=[
                ('TOPPADDING',    (0,0),(-1,-1), 3),
                ('BOTTOMPADDING', (0,0),(-1,-1), 3),
                ('LEFTPADDING',   (0,0),(-1,-1), 0),
                ('RIGHTPADDING',  (0,0),(-1,-1), 0),
                ('LINEBELOW',     (0,0),(-1,-2), 0.4, DIVIDER),
            ])],
        ], colWidths=[7.9*cm]),
    ]], colWidths=[9.2*cm, 8.2*cm])
    hdr.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), WHITE),
        ('TOPPADDING',    (0,0),(-1,-1), 10),
        ('BOTTOMPADDING', (0,0),(-1,-1), 10),
        ('LEFTPADDING',   (0,0),(0,0),   16),
        ('RIGHTPADDING',  (1,0),(1,0),   16),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
        ('BOX',           (0,0),(-1,-1), 0.8, BORDER),
    ]))
    story.append(hdr)
    story.append(Table([['']], colWidths=[17.4*cm],
        style=[('BACKGROUND',(0,0),(-1,-1), NAVY),
               ('TOPPADDING',(0,0),(-1,-1), 2),
               ('BOTTOMPADDING',(0,0),(-1,-1), 2)]))
    story.append(Spacer(1, 0.2*cm))

    # ── PATIENT DEMOGRAPHICS ────────────────────────────────
    story.append(Paragraph('▌  PATIENT DEMOGRAPHICS',
        ParagraphStyle('sec', fontName='Helvetica-Bold', fontSize=8,
        textColor=NAVY, leading=10, spaceAfter=3)))

    demo = Table([[
        Table([
            [Paragraph('Patient Name', _ps('fl', size=7,
                color=MUTED, font='Helvetica-Bold'))],
            [Paragraph(f'<b>{p_name}</b>', ParagraphStyle('fn',
                fontName='Helvetica-Bold', fontSize=12,
                textColor=TEXT, leading=15))],
        ], colWidths=[6.5*cm]),
        Table([
            [Paragraph('Age', _ps('al', size=7,
                color=MUTED, font='Helvetica-Bold'))],
            [Paragraph(f'<b>{p_age} Years</b>', ParagraphStyle('av',
                fontName='Helvetica-Bold', fontSize=11,
                textColor=TEXT, leading=14))],
        ], colWidths=[4*cm]),
        Table([
            [Paragraph('Gender', _ps('gl', size=7,
                color=MUTED, font='Helvetica-Bold'))],
            [Paragraph(f'<b>{p_gender}</b>', ParagraphStyle('gv',
                fontName='Helvetica-Bold', fontSize=11,
                textColor=TEXT, leading=14))],
        ], colWidths=[6.4*cm]),
    ]], colWidths=[6.5*cm, 4*cm, 6.4*cm])
    demo.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), WHITE),
        ('TOPPADDING',    (0,0),(-1,-1), 8),
        ('BOTTOMPADDING', (0,0),(-1,-1), 8),
        ('LEFTPADDING',   (0,0),(-1,-1), 12),
        ('RIGHTPADDING',  (0,0),(-1,-1), 12),
        ('BOX',           (0,0),(-1,-1), 0.8, BORDER),
        ('LINEAFTER',     (0,0),(1,0),   0.5, DIVIDER),
        ('VALIGN',        (0,0),(-1,-1), 'MIDDLE'),
    ]))
    story.append(demo)
    story.append(Spacer(1, 0.2*cm))

    # ── CLINICAL FINDINGS ───────────────────────────────────
    story.append(Paragraph('▌  CLINICAL FINDINGS',
        ParagraphStyle('sec2', fontName='Helvetica-Bold', fontSize=8,
        textColor=NAVY, leading=10, spaceAfter=3)))

    # Diagnosis card
    diag_card = Table([
        [Paragraph('PRIMARY DIAGNOSIS', ParagraphStyle('pdl',
            fontName='Helvetica-Bold', fontSize=7,
            textColor=ACCENT, leading=9))],
        [Spacer(1,3)],
        [Paragraph(f'<b>{det_full}</b>', ParagraphStyle('pdn',
            fontName='Helvetica-Bold', fontSize=14,
            textColor=rc, leading=17))],
        [Paragraph(status, _ps('pds', size=7, color=MUTED))],
        [Spacer(1,5)],
        [Table([
            [Paragraph('Condition', _ps('icdl', size=7,
                color=MUTED, font='Helvetica-Bold')),
             Paragraph(f'<b>{det_class}</b>', ParagraphStyle('icdv',
                fontName='Helvetica-Bold', fontSize=8,
                textColor=TEXT, leading=11, alignment=TA_RIGHT))],
            [Paragraph('Confidence', _ps('aicl', size=7,
                color=MUTED, font='Helvetica-Bold')),
             Paragraph(f'<b>{det_prob:.1f}%</b>', ParagraphStyle('aicv',
                fontName='Helvetica-Bold', fontSize=8,
                textColor=rc, leading=11, alignment=TA_RIGHT))],
            
        ], colWidths=[2.5*cm, 3*cm],
           style=[
            ('TOPPADDING',    (0,0),(-1,-1), 3),
            ('BOTTOMPADDING', (0,0),(-1,-1), 3),
            ('LEFTPADDING',   (0,0),(-1,-1), 0),
            ('RIGHTPADDING',  (0,0),(-1,-1), 0),
            ('LINEBELOW',     (0,0),(-1,-2), 0.4, DIVIDER),
        ])],
    ], colWidths=[6.2*cm])
    diag_card.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), WHITE),
        ('TOPPADDING',    (0,0),(-1,-1), 10),
        ('BOTTOMPADDING', (0,0),(-1,-1), 10),
        ('LEFTPADDING',   (0,0),(-1,-1), 12),
        ('RIGHTPADDING',  (0,0),(-1,-1), 12),
        ('BOX',           (0,0),(-1,-1), 0.8, BORDER),
        ('LINEBEFORE',    (0,0),(0,-1),  4,   rc),
    ]))

    # Risk card
    risk_card = Table([
        [Paragraph('RISK ASSESSMENT', ParagraphStyle('ral',
            fontName='Helvetica-Bold', fontSize=7,
            textColor=rc, leading=9, alignment=TA_CENTER))],
        [Spacer(1,4)],
        [Paragraph(risk.upper(), ParagraphStyle('rav',
            fontName='Helvetica-Bold', fontSize=26,
            textColor=rc, leading=30, alignment=TA_CENTER))],
        [Paragraph('RISK', ParagraphStyle('rar',
            fontName='Helvetica-Bold', fontSize=9,
            textColor=rc, leading=12, alignment=TA_CENTER))],
        [Spacer(1,4)],
        [HRFlowable(width=3.5*cm, thickness=1, color=rbr, spaceAfter=4)],
        [Paragraph('Cardiology consult<br/>recommended',
            ParagraphStyle('rann', fontName='Helvetica', fontSize=7,
            textColor=rc, leading=9, alignment=TA_CENTER))],
    ], colWidths=[5*cm])
    risk_card.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), rb),
        ('TOPPADDING',    (0,0),(-1,-1), 10),
        ('BOTTOMPADDING', (0,0),(-1,-1), 10),
        ('LEFTPADDING',   (0,0),(-1,-1), 6),
        ('RIGHTPADDING',  (0,0),(-1,-1), 6),
        ('BOX',           (0,0),(-1,-1), 0.8, rbr),
        ('ALIGN',         (0,0),(-1,-1), 'CENTER'),
    ]))

    # ECG image card
    if ecg_base64:
        try:
            raw = (ecg_base64.split(',', 1)[1]
                   if ',' in ecg_base64 else ecg_base64)
            rl  = RLImage(BytesIO(base64.b64decode(raw)),
                          width=5.4*cm, height=4.2*cm)
            ecg_card = Table([
                [Paragraph('ECG WAVEFORM', ParagraphStyle('ewl',
                    fontName='Helvetica-Bold', fontSize=7,
                    textColor=ACCENT, leading=9))],
                [Spacer(1,3)],
                [rl],
                [Paragraph('12-Lead Recording',
                    _ps('ecgs', size=7, color=MUTED, align=TA_CENTER))],
            ], colWidths=[5.8*cm])
            ecg_card.setStyle(TableStyle([
                ('BACKGROUND',    (0,0),(-1,-1), OFF_WHITE),
                ('TOPPADDING',    (0,0),(-1,-1), 8),
                ('BOTTOMPADDING', (0,0),(-1,-1), 8),
                ('LEFTPADDING',   (0,0),(-1,-1), 10),
                ('RIGHTPADDING',  (0,0),(-1,-1), 10),
                ('BOX',           (0,0),(-1,-1), 0.8, BORDER),
                ('ALIGN',         (0,2),(0,2),   'CENTER'),
                ('ALIGN',         (0,3),(0,3),   'CENTER'),
            ]))
        except Exception:
            ecg_card = Table([[Paragraph('ECG unavailable',
                _ps('na', size=7, color=MUTED, align=TA_CENTER))]],
                colWidths=[5.8*cm])
            ecg_card.setStyle(TableStyle([
                ('BACKGROUND',    (0,0),(-1,-1), OFF_WHITE),
                ('TOPPADDING',    (0,0),(-1,-1), 30),
                ('BOTTOMPADDING', (0,0),(-1,-1), 30),
                ('BOX',           (0,0),(-1,-1), 0.8, BORDER),
                ('ALIGN',         (0,0),(-1,-1), 'CENTER'),
            ]))
    else:
        ecg_card = Table([[Paragraph('No ECG image provided',
            _ps('na2', size=7, color=MUTED, align=TA_CENTER))]],
            colWidths=[5.8*cm])
        ecg_card.setStyle(TableStyle([
            ('BACKGROUND',    (0,0),(-1,-1), OFF_WHITE),
            ('TOPPADDING',    (0,0),(-1,-1), 30),
            ('BOTTOMPADDING', (0,0),(-1,-1), 30),
            ('BOX',           (0,0),(-1,-1), 0.8, BORDER),
            ('ALIGN',         (0,0),(-1,-1), 'CENTER'),
        ]))

    three_col = Table([[diag_card, risk_card, ecg_card]],
        colWidths=[6.4*cm, 5.2*cm, 5.8*cm])
    three_col.setStyle(TableStyle([
        ('LEFTPADDING',   (0,0),(-1,-1), 0),
        ('RIGHTPADDING',  (0,0),(-1,-1), 0),
        ('TOPPADDING',    (0,0),(-1,-1), 0),
        ('BOTTOMPADDING', (0,0),(-1,-1), 0),
        ('VALIGN',        (0,0),(-1,-1), 'TOP'),
    ]))
    story.append(three_col)
    story.append(Spacer(1, 0.2*cm))

    # ── DISCLAIMER ──────────────────────────────────────────
    disc = Table([[
        Paragraph(
            '<b>CLINICAL DISCLAIMER: </b>'
            '<font size=7>This report is generated by CardioScan AI for clinical '
            'assistance only. All findings must be reviewed by a qualified '
            'cardiologist before any clinical decision. '
            'CardioScan AI does not replace professional medical judgment.</font>',
            ParagraphStyle('discb', fontName='Helvetica-Bold', fontSize=7,
            textColor=GREEN, leading=11, alignment=TA_JUSTIFY))
    ]], colWidths=[17.4*cm])
    disc.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),(-1,-1), GREEN_LIGHT),
        ('TOPPADDING',    (0,0),(-1,-1), 7),
        ('BOTTOMPADDING', (0,0),(-1,-1), 7),
        ('LEFTPADDING',   (0,0),(-1,-1), 12),
        ('RIGHTPADDING',  (0,0),(-1,-1), 12),
        ('BOX',           (0,0),(-1,-1), 0.8, colors.HexColor('#9AE6B4')),
        ('LINEBEFORE',    (0,0),(0,-1),  3, GREEN),
    ]))
    story.append(disc)
    story.append(Spacer(1, 0.15*cm))

    # ── FOOTER ──────────────────────────────────────────────
    story.append(HRFlowable(width='100%', thickness=0.5,
        color=BORDER, spaceAfter=4))
    story.append(Table([[
        
        Paragraph(f'Generated: {now.strftime("%d %b %Y, %I:%M %p")}',
            _ps('fr', size=7, color=MUTED, align=TA_RIGHT)),
    ]], colWidths=[9*cm, 8.4*cm],
       style=[
        ('LEFTPADDING',  (0,0),(-1,-1), 0),
        ('RIGHTPADDING', (0,0),(-1,-1), 0),
        ('TOPPADDING',   (0,0),(-1,-1), 0),
        ('BOTTOMPADDING',(0,0),(-1,-1), 0),
    ]))

    doc.build(story)
    buf.seek(0)
    return buf

# ============================================================
# API ROUTES
# ============================================================
@app.route("/validate-ecg", methods=["POST"])
def validate_ecg_route():
    """Validate ECG using Gemini AI only"""
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image provided", "is_valid": False}), 400
        
        file = request.files["image"]
        if not file.filename:
            return jsonify({"error": "Empty filename", "is_valid": False}), 400
        
        # ✅ NEW: File type validation
        is_valid_type, type_msg = validate_file_type(file.filename)
        if not is_valid_type:
            print(f"[VALIDATE] ❌ {type_msg}")
            return jsonify({
                "error": type_msg,
                "is_valid": False,
                "confidence": 0,
                "message": type_msg
            }), 400
        
        path = save_upload(file)
        print(f"\n[VALIDATE] Processing: {os.path.basename(path)}")
        
        # ✅ File size check
        file_size = os.path.getsize(path) / (1024 * 1024)  # MB
        if file_size > 10:  # 10MB limit
            if os.path.exists(path):
                os.remove(path)
            return jsonify({
                "error": f"File too large ({file_size:.1f}MB). Maximum 10MB allowed.",
                "is_valid": False,
                "confidence": 0,
                "message": "File size exceeds limit"
            }), 400
        
        # ✅ Empty file check
        if file_size < 0.001:  # Less than 1KB
            if os.path.exists(path):
                os.remove(path)
            return jsonify({
                "error": "File is empty or corrupted",
                "is_valid": False,
                "confidence": 0,
                "message": "Empty file detected"
            }), 400
        
        # Continue with Gemini validation
        is_valid, confidence, message = is_ecg_image_gemini(path)
        
        # Clean up uploaded file
        if os.path.exists(path):
            os.remove(path)
        
        if is_valid:
            print(f"[VALIDATE] ✅ Valid ECG (confidence: {confidence}%)")
            return jsonify({
                "is_valid": True,
                "confidence": confidence,
                "message": message
            }), 200
        else:
            print(f"[VALIDATE] ❌ Invalid (confidence: {confidence}%)")
            return jsonify({
                "is_valid": False,
                "confidence": confidence,
                "message": message
            }), 400
            
    except Exception as e:
        print(f"[VALIDATE] ❌ Route Error: {e}")
        return jsonify({
            "error": str(e),
            "is_valid": False,
            "confidence": 0,
            "message": "Server error during validation"
        }), 500

@app.route("/predict", methods=["POST"])
def predict_route():
    try:
        file = request.files["image"]
        path = save_upload(file)
        img = preprocess_image(path)
        if os.path.exists(path): os.remove(path)
        result = predict_ecg(img)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/generate-report", methods=["POST"])
def report_route():
    try:
        data = request.json
        buf = build_pdf(data.get("patient", {}), data.get("prediction", {}), data.get("ecg_base64"))
        return send_file(buf, as_attachment=True, download_name=f"Report_{uuid.uuid4()}.pdf", mimetype="application/pdf")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    initialize_models()
    app.run(debug=True, host="0.0.0.0", port=5000)