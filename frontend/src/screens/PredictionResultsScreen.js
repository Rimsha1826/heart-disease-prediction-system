import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

const { width, height } = Dimensions.get("window");
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Disease Mapping ──
const DISEASE_FRIENDLY = {
  MI: {
    simple: "Heart Attack",
    technical: "Myocardial Infarction",
    description:
      "Blood flow to part of the heart is blocked, which may cause damage to the heart muscle.",
  },
  CD: {
    simple: "Heart Signal Problem",
    technical: "Conduction Disturbance",
    description:
      "The electrical signals that control the heartbeat are not working as they should.",
  },
  STTC: {
    simple: "ECG Abnormality",
    technical: "ST/T Wave Change",
    description:
      "An unusual pattern was found in the ECG that may need further evaluation by a doctor.",
  },
  HYP: {
    simple: "Heart Muscle Thickening",
    technical: "Cardiac Hypertrophy",
    description:
      "The heart muscle appears thicker than normal, meaning the heart may be working harder than usual.",
  },
  NORM: {
    simple: "Normal",
    technical: "Normal Sinus Rhythm",
    description: "No major heart problem detected. The ECG looks normal.",
  },
};

const CLASS_FULL = {
  CD: "Conduction Disturbance",
  HYP: "Hypertrophy",
  MI: "Myocardial Infarction",
  NORM: "Normal ECG",
  STTC: "ST/T Change",
};

const RISK_CONFIG = {
  Low: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
    label: "Low Risk",
  },
  Medium: {
    color: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.2)",
    label: "Medium Risk",
  },
  High: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    label: "High Risk",
  },
};

async function imageToBase64(uri) {
  try {
    const b64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" });
    return `data:image/jpeg;base64,${b64}`;
  } catch {
    return null;
  }
}

export default function PredictionResultScreen({ route, navigation }) {
  const { patientData, ecgImageUri, prediction } = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!prediction) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#060b14",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>
          No prediction data found.
        </Text>
      </View>
    );
  }

  const risk = prediction?.risk_level ?? "Low";
  const riskCfg = RISK_CONFIG[risk] ?? RISK_CONFIG.Low;
  const detected = prediction?.detected ?? [];
  const detectedClass = detected[0] ?? "NORM";
  const detectedFull = CLASS_FULL[detectedClass] ?? detectedClass;
  const disease = DISEASE_FRIENDLY[detectedClass];
  const topProb = Array.isArray(prediction?.classes)
    ? (prediction.classes.find((c) => c.class === detectedClass)?.probability ??
      0)
    : 0;

  const handlePDF = async () => {
    setDownloading(true);
    try {
      const ecg_base64 = ecgImageUri ? await imageToBase64(ecgImageUri) : null;
      const response = await fetch(`${API_URL}/generate-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient: patientData, prediction, ecg_base64 }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }
      const blob = await response.blob();
      const pdfBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const safeName = (patientData?.name ?? "Patient").replace(/\s+/g, "_");
      const filename = `ECG_Report_${safeName}_${Date.now()}.pdf`;
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: "base64",
      });
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: "Save or Share ECG Report",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      Alert.alert("Error", error.message || "Could not generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handleNewAnalysis = () => {
    Alert.alert("New Analysis", "Start a new ECG analysis?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: () => navigation.navigate("PatientInfo") },
    ]);
  };

  return (
    <>
      <StatusBar backgroundColor="#060b14" barStyle="light-content" />
      <View style={styles.container}>
        <LinearGradient
          colors={["#060b14", "#0c1525", "#060b14"]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* ── Header ── */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Analysis Report</Text>
                <Text style={styles.headerSub}>
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <View style={styles.heartBadge}>
                <Text style={styles.heartBadgeIcon}>🫀</Text>
              </View>
            </View>

            {/* ── Patient Info ── */}
            <View style={styles.patientCard}>
              <View style={styles.patientRow}>
                <View style={styles.patientAvatar}>
                  <Text style={styles.patientAvatarText}>
                    {(patientData?.name ?? "P")[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>
                    {patientData?.name ?? "—"}
                  </Text>
                  <Text style={styles.patientMeta}>
                    {patientData?.age} yrs · {patientData?.gender}
                  </Text>
                </View>
                <View
                  style={[
                    styles.riskPill,
                    {
                      backgroundColor: riskCfg.bg,
                      borderColor: riskCfg.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.riskPillDot,
                      { backgroundColor: riskCfg.color },
                    ]}
                  />
                  <Text style={[styles.riskPillText, { color: riskCfg.color }]}>
                    {riskCfg.label}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Diagnosis Card ── */}
            <View
              style={[styles.diagnosisCard, { borderColor: riskCfg.border }]}
            >
              <View
                style={[styles.diagnosisBg, { backgroundColor: riskCfg.bg }]}
              />

              {/* Section label */}
              <Text style={styles.diagnosisLabel}>DETECTED CONDITION</Text>

              {/* ✅ Primary row: MI — Heart Attack */}
              <View style={styles.labelRow}>
                <Text style={[styles.techLabel, { color: riskCfg.color }]}>
                  {detectedClass}
                </Text>
                <Text style={[styles.labelSep, { color: riskCfg.color }]}>
                  —
                </Text>
                <Text style={styles.friendlyName}>
                  {disease?.simple || detectedFull}
                </Text>
              </View>

              {/* ✅ Full technical name: Myocardial Infarction */}
              <Text style={styles.technicalFullName}>
                {disease?.technical || detectedFull}
              </Text>

              {/* ✅ Thin divider */}
              <View style={styles.divider} />

              {/* ✅ Short calm one-line description */}
              <Text style={styles.diseaseDescription}>
                {disease?.description || prediction?.overall_status}
              </Text>

              {/* ✅ Confidence bar */}
              <View style={styles.confSection}>
                <View style={styles.confHeader}>
                  <Text style={styles.confLabel}>AI Confidence Level</Text>
                  <Text style={[styles.confPercent, { color: riskCfg.color }]}>
                    {topProb.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.confBarBg}>
                  <View
                    style={[
                      styles.confBarFill,
                      {
                        width: `${Math.min(topProb, 100)}%`,
                        backgroundColor: riskCfg.color,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* ── ECG Image ── */}
            {ecgImageUri && (
              <View style={styles.ecgCard}>
                <Text style={styles.sectionLabel}>ECG WAVEFORM</Text>
                <Image source={{ uri: ecgImageUri }} style={styles.ecgImage} />
              </View>
            )}

            {/* ── Disclaimer ── */}
            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerIcon}>⚠️</Text>
              <Text style={styles.disclaimerText}>
                AI-generated result for clinical assistance only. Must be
                reviewed by a qualified cardiologist before any decision.
              </Text>
            </View>

            {/* ── Buttons ── */}
            <TouchableOpacity
              style={[styles.pdfBtn, downloading && { opacity: 0.7 }]}
              onPress={handlePDF}
              disabled={downloading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#1a4a8a", "#0f2d5c"]}
                style={styles.btnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {downloading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.btnIcon}>📄</Text>
                    <Text style={styles.btnText}>Download Report</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newBtn}
              onPress={handleNewAnalysis}
              activeOpacity={0.8}
            >
              <Text style={styles.newBtnText}>↺ New Analysis</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#060b14" },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 60 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f0f4ff",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 12,
    color: "#2a4060",
    marginTop: 3,
    fontWeight: "500",
  },
  heartBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(193,48,58,0.08)",
    borderWidth: 1,
    borderColor: "rgba(193,48,58,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartBadgeIcon: { fontSize: 22 },

  // Patient card
  patientCard: {
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
    marginBottom: 14,
  },
  patientRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(193,48,58,0.12)",
    borderWidth: 1,
    borderColor: "rgba(193,48,58,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  patientAvatarText: { fontSize: 18, fontWeight: "800", color: "#c1303a" },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 15, fontWeight: "700", color: "#f0f4ff" },
  patientMeta: {
    fontSize: 12,
    color: "#2a4060",
    marginTop: 2,
    fontWeight: "500",
  },
  riskPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  riskPillDot: { width: 6, height: 6, borderRadius: 3 },
  riskPillText: { fontSize: 11, fontWeight: "700" },

  // Diagnosis card
  diagnosisCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 14,
    overflow: "hidden",
    position: "relative",
  },
  diagnosisBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  diagnosisLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2a4060",
    letterSpacing: 2,
    marginBottom: 12,
  },

  // ✅ MI — Heart Attack row
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  techLabel: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  labelSep: {
    fontSize: 22,
    fontWeight: "300",
    opacity: 0.6,
  },
  friendlyName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#c8d8f0",
    letterSpacing: -0.2,
    flexShrink: 1,
  },

  // ✅ Full technical name below — e.g. "Myocardial Infarction"
  technicalFullName: {
    fontSize: 13,
    color: "#3a5878",
    fontWeight: "500",
    fontStyle: "italic",
    letterSpacing: 0.2,
    marginBottom: 16,
  },

  // ✅ Divider between label row and description
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 14,
  },

  // ✅ Short calm description
  diseaseDescription: {
    fontSize: 13,
    color: "#6a8aaa",
    fontWeight: "400",
    lineHeight: 20,
    marginBottom: 22,
  },

  // ✅ Confidence section
  confSection: { gap: 8 },
  confHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confLabel: {
    fontSize: 11,
    color: "#2a4060",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  confPercent: {
    fontSize: 15,
    fontWeight: "800",
  },
  confBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  confBarFill: { height: 6, borderRadius: 3 },

  // ECG card
  ecgCard: {
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2a4060",
    letterSpacing: 2,
    marginBottom: 12,
  },
  ecgImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    borderRadius: 10,
  },

  // Disclaimer
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(251,191,36,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.1)",
    padding: 14,
    marginBottom: 24,
  },
  disclaimerIcon: { fontSize: 14, marginTop: 1 },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: "#4a5568",
    lineHeight: 18,
    fontWeight: "500",
  },

  // Buttons
  pdfBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  btnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    gap: 8,
  },
  btnIcon: { fontSize: 18 },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  newBtn: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  newBtnText: { color: "#3a5878", fontSize: 15, fontWeight: "600" },
});