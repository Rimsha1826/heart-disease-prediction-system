import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  StatusBar,
  Modal,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const GENDER_OPTIONS = ["Male", "Female", "Other"];

export default function PatientInfoScreen({ navigation }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const [nameError, setNameError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [genderError, setGenderError] = useState("");

  // ✅ Real-time name validation handler
  const handleNameChange = (text) => {
    // Only allow letters and spaces — block everything else silently
    const lettersOnly = /^[a-zA-Z\s]*$/;
    if (!lettersOnly.test(text)) {
      // Show error but don't update state with invalid chars
      setNameError("Name should contain only letters (A–Z).");
      return;
    }

    setName(text);

    // Real-time error clearing / setting
    if (text.trim() === "") {
      setNameError(""); // Will be caught on submit
    } else if (text.trim().length < 3) {
      setNameError("Name must be at least 3 characters.");
    } else {
      setNameError(""); // ✅ Valid — clear error immediately
    }
  };

  // ✅ Real-time age validation handler
  const handleAgeChange = (text) => {
    // Only allow digits
    const digitsOnly = text.replace(/[^0-9]/g, "");
    setAge(digitsOnly);

    if (digitsOnly === "") {
      setAgeError(""); // Will be caught on submit
      return;
    }

    const ageNum = parseInt(digitsOnly);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setAgeError("Age must be between 1 and 120.");
    } else {
      setAgeError(""); // ✅ Valid — clear error immediately
    }
  };

  const handleNext = () => {
    // Reset all errors first
    setNameError("");
    setAgeError("");
    setGenderError("");

    let hasError = false;

    // ✅ Final name validation on submit
    if (!name.trim()) {
      setNameError("Please enter patient's full name.");
      hasError = true;
    } else if (name.trim().length < 3) {
      setNameError("Name must be at least 3 characters.");
      hasError = true;
    } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      setNameError("Name should contain only letters (A–Z).");
      hasError = true;
    }

    // ✅ Final age validation on submit
    if (!age.trim()) {
      setAgeError("Please enter age.");
      hasError = true;
    } else {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        setAgeError("Age must be between 1 and 120.");
        hasError = true;
      }
    }

    // ✅ Final gender validation on submit
    if (!gender) {
      setGenderError("Please select gender.");
      hasError = true;
    }

    if (hasError) return;

    navigation.navigate("ImageUpload", {
      patientData: { name: name.trim(), age, gender },
    });
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.heartIcon}>🫀</Text>
            <Text style={styles.appName}>CardioScan</Text>
            <View style={styles.nameRow}>
              <View style={styles.nameLine} />
              <Text style={styles.aiLabel}>AI</Text>
              <View style={styles.nameLine} />
            </View>
            <Text style={styles.pageTitle}>Patient Information</Text>
          </View>

          <View style={styles.form}>
            {/* ✅ Name Field with real-time validation */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View
                style={[styles.inputWrap, nameError && styles.inputWrapError]}
              >
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter patient's full name"
                  placeholderTextColor="#1e3050"
                  value={name}
                  onChangeText={handleNameChange}
                  keyboardType="default"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
              {nameError ? (
                <Text style={styles.errorText}>⚠ {nameError}</Text>
              ) : null}
            </View>

            {/* ✅ Age Field with real-time validation */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Age</Text>
              <View
                style={[styles.inputWrap, ageError && styles.inputWrapError]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Enter age in years"
                  placeholderTextColor="#1e3050"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={handleAgeChange}
                  maxLength={3}
                />
              </View>
              {ageError ? (
                <Text style={styles.errorText}>⚠ {ageError}</Text>
              ) : null}
            </View>

            {/* Gender */}
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <TouchableOpacity
                style={[styles.inputWrap, genderError && styles.inputWrapError]}
                onPress={() => {
                  setShowPicker(true);
                  if (genderError) setGenderError("");
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.inputIcon}>⚥</Text>
                <Text style={[styles.input, !gender && { color: "#1e3050" }]}>
                  {gender || "Select gender"}
                </Text>
                <Text style={styles.dropdownArrow}>▾</Text>
              </TouchableOpacity>
              {genderError ? (
                <Text style={styles.errorText}>⚠ {genderError}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleNext}
            style={styles.btnWrap}
          >
            <LinearGradient
              colors={["#c1303a", "#8b1a22"]}
              style={styles.btn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.btnText}>Continue</Text>
              <Text style={styles.btnArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Gender Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Gender</Text>
            <View style={styles.modalDivider} />

            {GENDER_OPTIONS.map((opt, idx) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.modalOption,
                  idx < GENDER_OPTIONS.length - 1 && styles.modalOptionBorder,
                  gender === opt && styles.modalOptionActive,
                ]}
                onPress={() => {
                  setGender(opt);
                  setGenderError("");
                  setShowPicker(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    gender === opt && styles.modalOptionTextActive,
                  ]}
                >
                  {opt}
                </Text>
                {gender === opt && <Text style={styles.modalCheck}>✓</Text>}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#060b14" },
  scroll: { paddingHorizontal: 28, paddingTop: 100, paddingBottom: 50 },

  // Header
  header: { alignItems: "center", marginBottom: 40 },
  heartIcon: { fontSize: 44, marginBottom: 12 },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#f0f4ff",
    letterSpacing: -0.8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
    width: 160,
  },
  nameLine: { flex: 1, height: 1, backgroundColor: "rgba(193,48,58,0.4)" },
  aiLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#c1303a",
    letterSpacing: 4,
  },
  pageTitle: {
    fontSize: 13,
    color: "#2a4060",
    letterSpacing: 1,
    fontWeight: "500",
    textTransform: "uppercase",
  },

  // Form
  form: { gap: 20 },
  fieldWrap: { gap: 8 },
  fieldLabel: {
    color: "#4a6080",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 16,
    height: 54,
    gap: 12,
  },
  inputWrapError: {
    borderColor: "rgba(239,68,68,0.4)",
    borderWidth: 1.5,
    backgroundColor: "rgba(239,68,68,0.03)",
  },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, color: "#e8f0ff", fontSize: 15, fontWeight: "500" },
  dropdownArrow: { color: "#2a4060", fontSize: 16 },

  errorText: {
    color: "#fca5a5",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    marginLeft: 4,
  },

  // Divider & Button
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 28,
  },
  btnWrap: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#c1303a",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    gap: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  btnArrow: { color: "rgba(255,255,255,0.55)", fontSize: 18 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#0e1a2e",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#4a6080",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 16,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 4,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  modalOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  modalOptionActive: { backgroundColor: "rgba(193,48,58,0.06)" },
  modalOptionText: { fontSize: 16, color: "#7a90a8", fontWeight: "500" },
  modalOptionTextActive: { color: "#f0f4ff", fontWeight: "700" },
  modalCheck: { color: "#c1303a", fontSize: 16, fontWeight: "700" },
  modalCancel: {
    marginTop: 8,
    marginHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  modalCancelText: { color: "#3a5070", fontSize: 15, fontWeight: "600" },
});