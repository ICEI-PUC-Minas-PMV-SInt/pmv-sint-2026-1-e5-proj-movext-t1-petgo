import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { View } from "react-native";
import BottomNav from "../components/layout/bottomNav/BottomNav";
import AppBar from "../components/layout/header/Header";
import "../styles/global.css";

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    // O nome que você der aqui é o que usará no fontFamily
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
  });

  if (!fontsLoaded && !error) return null;
  return (
    <View className="flex-1 bg-gray-50">
      <AppBar />
      <View className="flex-1">
        <Slot />
      </View>
      <BottomNav />
    </View>
  );
}
