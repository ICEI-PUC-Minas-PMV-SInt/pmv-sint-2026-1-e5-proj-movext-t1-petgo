import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { authService } from "../services/authService";
import "../styles/global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [fontsLoaded, error] = useFonts({
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await authService.obterToken();
        const logado = !!token;
        setIsAuthenticated(logado);

        const isInsideAuthGroup = segments[0] === "(auth)";

        if (logado && isInsideAuthGroup) {
          router.replace("/");
        } else if (!logado && !isInsideAuthGroup && isAuthenticated !== null) {
          router.replace("/(auth)/login");
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    if (fontsLoaded) {
      checkAuthStatus();
      SplashScreen.hideAsync();
    }
  }, [segments, fontsLoaded, isAuthenticated]);

  if (!fontsLoaded && !error) {
    return null;
  }

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4876A8" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
  );
}
