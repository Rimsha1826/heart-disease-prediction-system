import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Polyline } from "react-native-svg";

const { width, height } = Dimensions.get("window");

// ECG path points — realistic looking waveform
const ECG_POINTS = [
  [0, 50],
  [30, 50],
  [38, 50],
  [42, 20],
  [46, 80],
  [50, 50],
  [54, 10],
  [60, 90],
  [66, 50],
  [72, 45],
  [78, 50],
  [90, 50],
  [98, 50],
  [102, 20],
  [106, 80],
  [110, 50],
  [114, 10],
  [120, 90],
  [126, 50],
  [132, 45],
  [138, 50],
  [160, 50],
  [200, 50],
];

// Scale points to screen width
const SCALE = (width - 40) / 200;
const SCALED = ECG_POINTS.map(([x, y]) => [x * SCALE, y]);
const POINTS_STR = SCALED.map(([x, y]) => `${x},${y}`).join(" ");

// Total path segments for animation
const TOTAL_STEPS = SCALED.length;

export default function SplashScreen({ navigation }) {
  const [visiblePoints, setVisiblePoints] = useState(2);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const lineOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const dotX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Show line container
    Animated.timing(lineOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Draw ECG line point by point
    let step = 2;
    const interval = setInterval(() => {
      step++;
      setVisiblePoints(step);
      if (step >= TOTAL_STEPS) {
        clearInterval(interval);
        // After line finishes — show logo
        setTimeout(() => showLogo(), 200);
      }
    }, 55);

    return () => clearInterval(interval);
  }, []);

  const showLogo = () => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Tagline after logo
    setTimeout(() => {
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Navigate after everything
    setTimeout(() => {
      navigation.replace("Welcome");
    }, 2200);
  };

  // Current visible points string
  const currentPoints = SCALED.slice(0, visiblePoints)
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  // Dot position (last visible point)
  const lastPt = SCALED[Math.min(visiblePoints - 1, SCALED.length - 1)];

  return (
    <>
      <StatusBar backgroundColor="#060b14" barStyle="light-content" />
      <View style={styles.container}>
        <LinearGradient
          colors={["#060b14", "#0c1525", "#060b14"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Subtle grid lines */}
        <View style={styles.gridWrap} pointerEvents="none">
          {[...Array(8)].map((_, i) => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>

        {/* ECG Line */}
        <Animated.View style={[styles.ecgWrap, { opacity: lineOpacity }]}>
          <Svg width={width - 40} height={100}>
            {visiblePoints >= 2 && (
              <Polyline
                points={currentPoints}
                fill="none"
                stroke="#c1303a"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Moving dot at tip */}
            {lastPt && (
              <Polyline
                points={`${lastPt[0]},${lastPt[1]} ${lastPt[0]},${lastPt[1]}`}
                fill="none"
                stroke="#ff6b7a"
                strokeWidth="6"
                strokeLinecap="round"
              />
            )}
          </Svg>
        </Animated.View>

        {/* Logo appears after ECG */}
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Icon */}
          <Text style={styles.heartIcon}>🫀</Text>

          {/* App name */}
          <Text style={styles.appName}>CardioScan</Text>
          <View style={styles.nameRow}>
            <View style={styles.nameLine} />
            <Text style={styles.aiLabel}>AI</Text>
            <View style={styles.nameLine} />
          </View>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          Your heart, understood.
        </Animated.Text>

        {/* Version */}
        <Animated.Text style={[styles.version, { opacity: tagOpacity }]}>
          v1.0
        </Animated.Text>
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

  // Subtle background grid
  gridWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "column",
    justifyContent: "space-around",
  },
  gridLine: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.02)",
    width: "100%",
  },

  // ECG
  ecgWrap: {
    position: "absolute",
    top: height * 0.28,
    left: 20,
  },

  // Logo
  logoWrap: {
    alignItems: "center",
    marginTop: -40,
  },
  heartIcon: {
    fontSize: 64,
    marginBottom: 18,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#f0f4ff",
    letterSpacing: -1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 5,
    width: 200,
  },
  nameLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(193,48,58,0.5)",
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#c1303a",
    letterSpacing: 5,
  },

  // Tagline
  tagline: {
    position: "absolute",
    bottom: height * 0.18,
    fontSize: 13,
    color: "#2a3d55",
    letterSpacing: 0.5,
    fontWeight: "500",
  },

  version: {
    position: "absolute",
    bottom: height * 0.06,
    fontSize: 11,
    color: "#1a2535",
    letterSpacing: 1,
  },
});