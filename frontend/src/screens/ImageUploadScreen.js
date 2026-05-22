import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Animated,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import ProcessingScreen from "./ProcessingScreen";

const { width, height } = Dimensions.get("window");
const API_URL = "http://192.168.100.5:5000";

export default function ImageUploadScreen({ route }) {
  const navigation = useNavigation();
  const { patientData } = route.params;

  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState("idle");
  const [validationOk, setValidationOk] = useState(false);
  const [validationFail, setValidationFail] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);

  // ✅ NEW: File type error state
  const [imageError, setImageError] = useState("");

  // ✅ NEW: Permission error states for gallery and camera
  const [galleryPermError, setGalleryPermError] = useState("");
  const [cameraPermError, setCameraPermError] = useState("");

  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const msgFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const showMsg = () => {
    msgFade.setValue(0);
    Animated.timing(msgFade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  // ✅ NEW: Inline file type validation (no Alert — UI friendly)
  const validateFileType = (uri) => {
    const allowedExtensions = [".png", ".jpg", ".jpeg"];
    const ext = uri.toLowerCase().substring(uri.lastIndexOf("."));
    if (!allowedExtensions.includes(ext)) {
      setImageError("Only PNG, JPG, and JPEG formats are allowed.");
      return false;
    }
    setImageError(""); // ✅ Clear error if valid
    return true;
  };

  const pickImage = async () => {
    // ✅ ENHANCED: Full runtime permission handling for gallery
    setGalleryPermError("");
    setCameraPermError("");

    // Step 1: Check current permission status first (don't ask yet)
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();

    let finalStatus = current.status;
    let finalCanAskAgain = current.canAskAgain;

    // Step 2: Only request if not already granted
    if (current.status !== "granted") {
      const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
      finalStatus = requested.status;
      finalCanAskAgain = requested.canAskAgain;
    }

    // Step 3: Handle denied cases with inline messages
    if (finalStatus !== "granted") {
      if (!finalCanAskAgain) {
        // Permanently denied — show Settings link
        setGalleryPermError(
          "Gallery access is permanently denied. Please enable it from Settings.",
        );
      } else {
        // Denied this time
        setGalleryPermError("Permission is required to access the gallery.");
      }
      return;
    }

    // ✅ Permission granted — proceed normally
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (!validateFileType(uri)) return;
      setSelectedImage(uri);
      resetState();
    }
  };

  const takePhoto = async () => {
    // ✅ ENHANCED: Full runtime permission handling for camera
    setCameraPermError("");
    setGalleryPermError("");

    const { status, canAskAgain } =
      await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      if (!canAskAgain) {
        // Permanently denied — guide user to Settings
        setCameraPermError(
          "Camera access is permanently denied. Please enable it from Settings.",
        );
      } else {
        // Denied this time — show inline message
        setCameraPermError("Camera access is required to capture images.");
      }
      return;
    }

    // ✅ Permission granted — proceed normally
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (!validateFileType(uri)) return;
      setSelectedImage(uri);
      resetState();
    }
  };

  const resetState = () => {
    setStep("idle");
    setValidationOk(false);
    setValidationFail(false);
    setValidationMsg("");
    setPredictionResult(null);
    setProcessing(false);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageError(""); // ✅ Clear file type error
    setGalleryPermError(""); // ✅ Clear gallery permission error
    setCameraPermError(""); // ✅ Clear camera permission error
    resetState();
  };

  const buildFormData = (uri) => {
    const fileType = uri.split(".").pop();
    const fd = new FormData();
    fd.append("image", {
      uri,
      type: `image/${fileType}`,
      name: `ecg.${fileType}`,
    });
    return fd;
  };

  // ── Step 1: Validate ──
  const validateECG = async () => {
    if (!selectedImage) return;
    setUploading(true);
    setValidationFail(false);
    setValidationOk(false);
    setValidationMsg("");
    try {
      const response = await fetch(`${API_URL}/validate-ecg`, {
        method: "POST",
        body: buildFormData(selectedImage),
      });
      const data = await response.json();
      if (data.is_valid) {
        setStep("validated");
        setValidationOk(true);
        setValidationFail(false);
        setValidationMsg("ECG image verified.");
        showMsg();
      } else {
        setStep("idle");
        setValidationOk(false);
        setValidationFail(true);
        setValidationMsg("Invalid image. Please upload an ECG image.");
        showMsg();
      }
    } catch {
      setValidationFail(true);
      setValidationMsg("Connection error. Please check your network.");
      showMsg();
    } finally {
      setUploading(false);
    }
  };

  // ── Step 2: Predict ──
  const predictDisease = async () => {
    if (!selectedImage) return;
    setProcessing(true);
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: buildFormData(selectedImage),
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setProcessing(false);
        Alert.alert("Server Error", text.slice(0, 200));
        return;
      }
      if (!data || !data.risk_level) {
        setProcessing(false);
        Alert.alert("Prediction Failed", data?.error || "Invalid response.");
        return;
      }
      setPredictionResult(data);
      setStep("predicted");
    } catch {
      setProcessing(false);
      Alert.alert("Connection Error", "Could not connect to backend.");
    } finally {
      setProcessing(false);
    }
  };

  const goToResults = () => {
    navigation.navigate("PredictionResult", {
      patientData,
      ecgImageUri: selectedImage,
      prediction: predictionResult,
    });
  };

  if (processing) return <ProcessingScreen />;

  // ── Smart button logic ──
  const getBtn = () => {
    if (step === "idle" && selectedImage)
      return {
        label: "Validate ECG",
        colors: ["#1a4a8a", "#0f2d5c"],
        action: validateECG,
        loading: uploading,
      };
    if (step === "validated")
      return {
        label: "Analyze Disease",
        colors: ["#c1303a", "#8b1a22"],
        action: predictDisease,
        loading: false,
      };
    if (step === "predicted")
      return {
        label: "View Results",
        colors: ["#14532d", "#0f3d20"],
        action: goToResults,
        loading: false,
        arrow: true,
      };
    return null;
  };

  const btn = getBtn();

  return (
    <>
      <StatusBar backgroundColor="#060b14" barStyle="light-content" />
      <View style={styles.container}>
        <LinearGradient
          colors={["#060b14", "#0c1525", "#060b14"]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>ECG Analysis</Text>
                <Text style={styles.headerSub}>
                  {patientData?.name || "Patient"} · {patientData?.age} yrs ·{" "}
                  {patientData?.gender}
                </Text>
              </View>
              <View style={styles.heartBadge}>
                <Text style={styles.heartBadgeIcon}>🫀</Text>
              </View>
            </View>

            {/* Image Card */}
            <View style={styles.cardOuter}>
              <Animated.View
                style={[
                  styles.glowRing,
                  {
                    opacity: glowAnim,
                    borderColor: validationOk
                      ? "#22c55e"
                      : validationFail
                        ? "#ef4444"
                        : "rgba(193,48,58,0.4)",
                  },
                ]}
              />
              <View
                style={[
                  styles.imageCard,
                  validationOk && styles.imageCardOk,
                  validationFail && styles.imageCardFail,
                ]}
              >
                {selectedImage ? (
                  <>
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.image}
                    />
                    <LinearGradient
                      colors={["rgba(0,0,0,0.45)", "transparent"]}
                      style={styles.imageTopOverlay}
                    />
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={removeImage}
                    >
                      <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                    {validationOk && (
                      <View style={styles.verifiedBadge}>
                        <View
                          style={[
                            styles.badgeDot,
                            { backgroundColor: "#22c55e" },
                          ]}
                        />
                        <Text style={styles.verifiedText}>ECG Verified</Text>
                      </View>
                    )}
                    {validationFail && (
                      <View style={[styles.verifiedBadge, styles.failBadge]}>
                        <View
                          style={[
                            styles.badgeDot,
                            { backgroundColor: "#ef4444" },
                          ]}
                        />
                        <Text style={styles.failText}>Invalid Image</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.placeholder}>
                    <Animated.View
                      style={[
                        styles.pulseRing,
                        styles.ring1,
                        { opacity: glowAnim },
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.pulseRing,
                        styles.ring2,
                        { opacity: glowAnim },
                      ]}
                    />
                    <View style={styles.placeholderCore}>
                      <Text style={styles.placeholderEmoji}>🫀</Text>
                    </View>
                    <Text style={styles.placeholderTitle}>
                      Upload ECG Image
                    </Text>
                    <Text style={styles.placeholderSub}>
                      12-lead ECG · JPG · PNG · JPEG
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* ✅ NEW: Inline file type error message — same style as existing msgBar */}
            {imageError !== "" && (
              <View style={[styles.msgBar, styles.msgBarFail]}>
                <Text style={styles.msgIcon}>✕</Text>
                <Text style={[styles.msgText, styles.msgTextFail]}>
                  {imageError}
                </Text>
              </View>
            )}

            {/* Inline validation message */}
            {validationMsg !== "" && (
              <Animated.View
                style={[
                  styles.msgBar,
                  validationOk && styles.msgBarOk,
                  validationFail && styles.msgBarFail,
                  { opacity: msgFade },
                ]}
              >
                <Text style={styles.msgIcon}>{validationOk ? "✓" : "✕"}</Text>
                <Text
                  style={[
                    styles.msgText,
                    validationOk && styles.msgTextOk,
                    validationFail && styles.msgTextFail,
                  ]}
                >
                  {validationMsg}
                </Text>
              </Animated.View>
            )}

            {/* ✅ NEW: Gallery permission error bar */}
            {galleryPermError !== "" && (
              <View style={[styles.msgBar, styles.msgBarWarn]}>
                <Text style={styles.msgIcon}>🔒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.msgText, styles.msgTextWarn]}>
                    {galleryPermError}
                  </Text>
                  {galleryPermError.includes("permanently") && (
                    <TouchableOpacity onPress={() => Linking.openSettings()}>
                      <Text style={styles.settingsLink}>Open Settings →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* ✅ NEW: Camera permission error bar */}
            {cameraPermError !== "" && (
              <View style={[styles.msgBar, styles.msgBarWarn]}>
                <Text style={styles.msgIcon}>🔒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.msgText, styles.msgTextWarn]}>
                    {cameraPermError}
                  </Text>
                  {cameraPermError.includes("permanently") && (
                    <TouchableOpacity onPress={() => Linking.openSettings()}>
                      <Text style={styles.settingsLink}>Open Settings →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Gallery / Camera */}
            <View style={styles.uploadRow}>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={pickImage}
                disabled={uploading}
                activeOpacity={0.75}
              >
                <Text style={styles.uploadText}>Gallery</Text>
              </TouchableOpacity>
              <View style={styles.uploadSep} />
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={takePhoto}
                disabled={uploading}
                activeOpacity={0.75}
              >
                <Text style={styles.uploadText}>Camera</Text>
              </TouchableOpacity>
            </View>

            {/* Smart single button */}
            {btn && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={btn.action}
                disabled={btn.loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={btn.colors}
                  style={styles.primaryBtnGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {btn.loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>{btn.label}</Text>
                      {btn.arrow && (
                        <Text style={styles.primaryBtnArrow}>→</Text>
                      )}
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}

            <Text style={styles.footNote}>
              AI analysis · Clinical assistance only
            </Text>
          </ScrollView>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#060b14" },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 50 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
    marginTop: 4,
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

  cardOuter: { marginBottom: 14, position: "relative" },
  glowRing: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  imageCard: {
    height: height * 0.38,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.025)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCardOk: { borderColor: "rgba(34,197,94,0.2)" },
  imageCardFail: { borderColor: "rgba(239,68,68,0.2)" },
  image: { width: "100%", height: "100%", resizeMode: "contain" },
  imageTopOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  removeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  removeBtnText: { color: "#fff", fontSize: 11, fontWeight: "800" },

  verifiedBadge: {
    position: "absolute",
    bottom: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(20,83,45,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.25)",
  },
  failBadge: {
    backgroundColor: "rgba(127,29,29,0.9)",
    borderColor: "rgba(239,68,68,0.25)",
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  verifiedText: { color: "#86efac", fontSize: 12, fontWeight: "700" },
  failText: { color: "#fca5a5", fontSize: 12, fontWeight: "700" },

  placeholder: { alignItems: "center", justifyContent: "center" },
  pulseRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(193,48,58,0.25)",
  },
  ring1: { width: 110, height: 110 },
  ring2: { width: 145, height: 145 },
  placeholderCore: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(193,48,58,0.08)",
    borderWidth: 1,
    borderColor: "rgba(193,48,58,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  placeholderEmoji: { fontSize: 30 },
  placeholderTitle: {
    color: "#2a4060",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  placeholderSub: { color: "#1a2d42", fontSize: 11, letterSpacing: 0.3 },

  // Inline message bar
  msgBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  msgBarOk: {
    backgroundColor: "rgba(20,83,45,0.12)",
    borderColor: "rgba(34,197,94,0.15)",
  },
  msgBarFail: {
    backgroundColor: "rgba(127,29,29,0.12)",
    borderColor: "rgba(239,68,68,0.15)",
  },
  msgIcon: { fontSize: 14, fontWeight: "800", color: "#fff" },
  msgText: { flex: 1, fontSize: 13, fontWeight: "600" },
  msgTextOk: { color: "#86efac" },
  msgTextFail: { color: "#fca5a5" },

  // ✅ NEW: Permission warning styles (amber tone)
  msgBarWarn: {
    backgroundColor: "rgba(120,80,0,0.15)",
    borderColor: "rgba(234,179,8,0.2)",
  },
  msgTextWarn: { color: "#fde68a" },
  settingsLink: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
    letterSpacing: 0.3,
  },

  uploadRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 14,
    overflow: "hidden",
  },
  uploadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  uploadSep: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 12,
  },
  uploadIcon: { fontSize: 17 },
  uploadText: { color: "#3a5878", fontSize: 14, fontWeight: "600" },

  primaryBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    gap: 8,
  },
  primaryBtnIcon: { fontSize: 18 },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  primaryBtnArrow: { color: "rgba(255,255,255,0.45)", fontSize: 18 },

  footNote: {
    textAlign: "center",
    color: "#1a2d42",
    fontSize: 11,
    letterSpacing: 0.3,
    marginTop: 8,
  },
});