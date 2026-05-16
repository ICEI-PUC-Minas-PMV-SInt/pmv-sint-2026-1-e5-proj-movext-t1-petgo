import BottomNav from "@/src/components/layout/bottomNav/BottomNav";
import AppBar from "@/src/components/layout/header/Header";
import { Slot } from "expo-router";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <AppBar />
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      <BottomNav />
    </View>
  );
}
