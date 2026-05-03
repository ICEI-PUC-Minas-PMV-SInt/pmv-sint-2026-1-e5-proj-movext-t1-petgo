import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const TABS = [
  { name: "Home", icon: "home", route: "/" as Href },
  { name: "Passeadores", icon: "dog-service", route: "/passeadores" as Href },
  { name: "Doações", icon: "heart", route: "/doacoes" as Href },
  { name: "Shop", icon: "cart", route: "/shop" as Href },
  { name: "Perfil", icon: "account", route: "/perfil" as Href },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="flex-row bg-[#4876A8] border-t border-white/20 h-38 pt-4 pb-6 justify-around items-center">
      {TABS.map((tab) => {
        const isActive = pathname === tab.route;

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(tab.route)}
            className="items-center justify-center flex-1"
          >
            <View
              className={`p-1 rounded-full ${isActive ? "border border-white/30" : ""}`}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={32}
                color={isActive ? "#FFFFFF" : "#BDC3C7"}
              />
            </View>

            <Text
              numberOfLines={1}
              className={`text-[11px] mt-1 ${
                isActive ? "text-white font-bold" : "text-[#BDC3C7]"
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
