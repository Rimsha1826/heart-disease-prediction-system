// ═══════════════════════════════════════════════════════════
// COMPLETE APP.JS - All Screens Navigation
// ═══════════════════════════════════════════════════════════

import React from "react";
import { enableScreens } from "react-native-screens";
enableScreens();

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import SplashScreen from "./src/screens/SplashScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import ProcessingScreen from "./src/screens/ProcessingScreen";
import PatientInfoScreen from "./src/screens/PatientInfoScreen";
import ImageUploadScreen from "./src/screens/ImageUploadScreen";
import PredictionResultsScreen from "./src/screens/PredictionResultsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: { backgroundColor: "#060b14" },
          headerTintColor: "#f0f4ff",
          headerTitleStyle: { fontWeight: "700", fontSize: 15 },
          headerShadowVisible: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false, animation: "fade" }}
        />

        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false, animation: "fade" }}
        />

        <Stack.Screen
          name="PatientInfo"
          component={PatientInfoScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="ImageUpload"
          component={ImageUploadScreen}
          options={{
            title: "ECG Upload",
          }}
        />

        <Stack.Screen
          name="Processing"
          component={ProcessingScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
            animation: "fade",
          }}
        />

        <Stack.Screen
          name="PredictionResult"
          component={PredictionResultsScreen}
          options={{ title: "Results" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}