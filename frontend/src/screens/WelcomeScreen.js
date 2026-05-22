import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  const heartScale = useRef(new Animated.Value(0.85)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const fadeContent = useRef(new Animated.Value(0)).current;
  const slideContent = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heartOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeContent, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideContent, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);
  }, []);

  return (
    <>
      <StatusBar backgroundColor="#060b14" barStyle="light-content" />
      <View style={styles.container}>
        <LinearGradient
          colors={["#060b14", "#0a1220", "#060b14"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Glow circles */}
        <Animated.View style={[styles.glowCircle, { opacity: glowOpacity }]} />
        <Animated.View
          style={[styles.glowCircleInner, { opacity: glowOpacity }]}
        />

        {/* Decorative rings */}
        <View style={styles.ring1} />
        <View style={styles.ring2} />

        {/* Giant Heart */}
        <Animated.View
          style={[
            styles.heartWrap,
            {
              opacity: heartOpacity,
              transform: [{ scale: heartScale }],
            },
          ]}
        >
          <Text style={styles.heartEmoji}>🫀</Text>
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomContent,
            {
              opacity: fadeContent,
              transform: [{ translateY: slideContent }],
            },
          ]}
        >
          <Text style={styles.appName}>CardioScan</Text>

          <View style={styles.nameRow}>
            <View style={styles.nameLine} />
            <Text style={styles.aiLabel}>AI</Text>
            <View style={styles.nameLine} />
          </View>

          <Text style={styles.tagline}>Your heart, understood.</Text>

          <View style={styles.divider} />

          <Text style={styles.disclaimer}>
            Clinical assistance only · Always consult a cardiologist
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate("PatientInfo")}
            style={styles.btnWrap}
          >
            <LinearGradient
              colors={["#c1303a", "#8b1a22"]}
              style={styles.btn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.btnText}>Begin</Text>
              <Text style={styles.btnArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#060b14",
  },

  glowCircle: {
    position: "absolute",
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.425,
    backgroundColor: "rgba(180,30,45,0.07)",
    top: height * 0.1,
    alignSelf: "center",
  },
  glowCircleInner: {
    position: "absolute",
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width * 0.275,
    backgroundColor: "rgba(180,30,45,0.1)",
    top: height * 0.17,
    alignSelf: "center",
  },

  ring1: {
    position: "absolute",
    width: width * 0.78,
    height: width * 0.78,
    borderRadius: width * 0.39,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    top: height * 0.12,
    alignSelf: "center",
  },
  ring2: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
    top: height * 0.18,
    alignSelf: "center",
  },

  heartWrap: {
    position: "absolute",
    top: height * 0.1,
    alignSelf: "center",
  },
  heartEmoji: {
    fontSize: width * 0.54,
  },

  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingBottom: 50,
    paddingTop: 28,
    backgroundColor: "rgba(6,11,20,0.97)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },

  appName: {
    fontSize: 34,
    fontWeight: "800",
    color: "#f0f4ff",
    letterSpacing: -1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    marginBottom: 14,
    width: "100%",
  },
  nameLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(193,48,58,0.4)",
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#c1303a",
    letterSpacing: 5,
  },

  tagline: {
    fontSize: 15,
    color: "#3d5470",
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 20,
  },

  divider: {
    width: 36,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginBottom: 14,
  },

  disclaimer: {
    fontSize: 10,
    color: "#1e2e42",
    textAlign: "center",
    letterSpacing: 0.4,
    marginBottom: 24,
  },

  btnWrap: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#c1303a",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
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
  btnArrow: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 18,
  },
});