import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { authService } from "../services/authService";
import { setUnauthorizedHandler } from "../services/api";
import "../styles/global.css";

SplashScreen.preventAutoHideAsync();

function AuthGuard({ fontsLoaded }: { fontsLoaded: boolean }) {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => setIsAuthenticated(false));
  }, []);

  useEffect(() => {
    if (!navigationState?.key) return;

    const checkAuthStatus = async () => {
      try {
        const token = await authService.obterToken();
        const logado = !!token;
        setIsAuthenticated(logado);

        const isInsideAuthGroup = segments[0] === "(auth)";

        if (logado && isInsideAuthGroup) {
          router.replace("/");
        } else if (!logado && !isInsideAuthGroup) {
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
  }, [segments, fontsLoaded, isAuthenticated, navigationState?.key]);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#4876A8" />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
  });

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <AuthGuard fontsLoaded={!!fontsLoaded} />
      </SafeAreaProvider>
    </PaperProvider>
  );
}
