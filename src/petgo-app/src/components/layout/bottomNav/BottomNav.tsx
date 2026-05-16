import { authService } from "@/src/services/authService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const loadUserType = async () => {
      const type = await authService.obterUserType();
      setUserType(type);
    };
    loadUserType();
  }, []);

  const TABS = [
    { name: "Home", icon: "home", route: "/" as Href, visible: true },
    { name: "Passeios", icon: "calendar-clock", route: "/passeios" as Href, visible: true },
    { 
      name: "Passeadores", 
      icon: "dog-service", 
      route: "/passeadores" as Href, 
      visible: userType !== "Passeador" 
    },
    { name: "Shop", icon: "cart", route: "/shop" as Href, visible: true },
    { name: "Doações", icon: "heart", route: "/doacoes" as Href, visible: true },
    { name: "Perfil", icon: "account", route: "/perfil" as Href, visible: true },
  ].filter(tab => tab.visible);

  return (
    <View className="flex-row bg-[#4876A8] h-24 pt-4 pb-6 justify-around items-center border-t border-white/10">
      {TABS.map((tab) => {
        const isActive = pathname === tab.route;

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(tab.route)}
            className="items-center justify-center flex-1"
          >
            <MaterialCommunityIcons
                name={tab.icon as any}
                size={28}
                color={isActive ? "#FFFFFF" : "#BDC3C7"}
            />

            <Text
              numberOfLines={1}
              className={`text-[10px] mt-1.5 font-bold ${
                isActive ? "text-white" : "text-[#BDC3C7]"
              }`}
            >
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
