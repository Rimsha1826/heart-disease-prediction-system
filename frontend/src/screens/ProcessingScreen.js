import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function ProcessingScreen() {
  const heartScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.2)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.6)).current;
  const ring2Opacity = useRef(new Animated.Value(0.3)).current;
  const dotAnim1 = useRef(new Animated.Value(0.3)).current;
  const dotAnim2 = useRef(new Animated.Value(0.3)).current;
  const dotAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Heartbeat
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartScale, {
          toValue: 1.18,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(heartScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(600),
      ]),
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.7,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.2,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Ring 1 expand
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ring1Scale, {
            toValue: 1.6,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(ring1Scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ring1Opacity, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(ring1Opacity, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();

    // Ring 2 expand (offset)
    setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ring2Scale, {
              toValue: 1.6,
              duration: 1800,
              useNativeDriver: true,
            }),
            Animated.timing(ring2Scale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(ring2Opacity, {
              toValue: 0,
              duration: 1800,
              useNativeDriver: true,
            }),
            Animated.timing(ring2Opacity, {
              toValue: 0.3,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    }, 600);

    // Loading dots
    const dotDelay = (anim, delay) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.delay(400),
          ]),
        ).start();
      }, delay);
    };
    dotDelay(dotAnim1, 0);
    dotDelay(dotAnim2, 200);
    dotDelay(dotAnim3, 400);
  }, []);

  return (
    <>
      <StatusBar backgroundColor="#060b14" barStyle="light-content" />
      <View style={styles.container}>
        <LinearGradient
          colors={["#060b14", "#0c1525", "#060b14"]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
          {/* Heart with rings */}
          <View style={styles.heartWrap}>
            {/* Glow */}
            <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

            {/* Expanding rings */}
            <Animated.View
              style={[
                styles.ring,
                { opacity: ring1Opacity, transform: [{ scale: ring1Scale }] },
              ]}
            />
            <Animated.View
              style={[
                styles.ring,
                { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] },
              ]}
            />

            {/* Heart */}
            <Animated.Text
              style={[styles.heart, { transform: [{ scale: heartScale }] }]}
            >
              🫀
            </Animated.Text>
          </View>

          {/* Text */}
          <Text style={styles.title}>Analyzing ECG</Text>
          <Text style={styles.subtitle}>AI model is processing your scan</Text>

          {/* Loading dots */}
          <View style={styles.dotsRow}>
            <Animated.View style={[styles.dot, { opacity: dotAnim1 }]} />
            <Animated.View style={[styles.dot, { opacity: dotAnim2 }]} />
            <Animated.View style={[styles.dot, { opacity: dotAnim3 }]} />
          </View>

          {/* Bottom note */}
          <Text style={styles.note}>This may take a few seconds</Text>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060b14",
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    alignItems: "center",
    paddingHorizontal: 40,
  },

  // Heart area
  heartWrap: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  glow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(193,48,58,0.15)",
  },
  ring: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "rgba(193,48,58,0.4)",
  },
  heart: { fontSize: 72 },

  // Text
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#f0f4ff",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#2a4060",
    fontWeight: "500",
    marginBottom: 36,
    textAlign: "center",
  },

  // Dots
  dotsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 48,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#c1303a",
  },

  note: {
    fontSize: 12,
    color: "#1a2d42",
    letterSpacing: 0.3,
    fontWeight: "500",
  },
});