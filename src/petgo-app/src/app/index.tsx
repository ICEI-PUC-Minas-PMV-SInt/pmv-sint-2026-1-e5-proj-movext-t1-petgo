import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import MenuDog from "../../assets/images/menuDog.png";

export default function Index() {
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header/Hero Section - Mais "cheio" e colorido */}
      <View className=" rounded-b-[40px pt-4 px-4 flex-row items-center">
        <Image source={MenuDog} resizeMode="contain" className="h-44 w-44" />
        <View className="flex-1 ml-[-20px]">
          <Text className="text-[#4D5152] text-xl font-light">
            Bem-vindo ao
          </Text>
          <Text className="text-[#4876A8] font-extrabold text-7xl leading-[50px] pt-4">
            PET GO
          </Text>
        </View>
      </View>

      <View className="px-6">
        <Text className="text-gray-800 text-lg font-bold mb-4">
          Serviços Principais
        </Text>

        <View className="flex-col gap-y-3">
          {/* Um card grande em cima */}
          <Pressable
            onPress={() => router.push("/passeadores")}
            className="bg-[#4876A8] p-5 rounded-3xl flex-row items-center justify-between active:opacity-70 active:scale-95"
          >
            <View>
              <Text className="text-white font-bold text-xl">Passeios</Text>
              <Text className="text-blue-100 text-xs">
                Agende um passeio agora
              </Text>
            </View>
            <MaterialCommunityIcons
              name="dog-service"
              size={40}
              color="white"
            />
          </Pressable>

          <View className="flex-row gap-x-3">
            <Pressable
              onPress={() => router.push("/shop")}
              className="flex-1 bg-[#FFB347] p-5 rounded-3xl items-center  active:opacity-70 active:scale-95"
            >
              <MaterialCommunityIcons name="store" size={32} color="white" />
              <Text className="text-white font-bold mt-2">Shop</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/doacoes")}
              className="flex-1 bg-[#EF4444] p-5 rounded-3xl items-center active:opacity-70 active:scale-95"
            >
              <MaterialCommunityIcons name="heart" size={32} color="white" />
              <Text className="text-white font-bold mt-2">Doações</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* 3. Card de Destaque - Dá profundidade ao layout */}
      <View className="px-6 mt-8 mb-10">
        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-gray-400 text-xs uppercase tracking-tighter">
                Destaque do dia
              </Text>
              <Text className="text-[#4876A8] text-xl font-bold">
                Passeadores 5★
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#4876A8"
            />
          </View>
          <Text className="text-gray-500 leading-5">
            Encontre os melhores profissionais para passear com seu amigão hoje
            mesmo!
          </Text>

          <Pressable
            onPress={() => router.push("/passeadores")}
            className="bg-[#4876A8] mt-4 py-3 rounded-xl items-center active:opacity-70 active:scale-95"
          >
            <Text className="text-white font-bold ">VER TODOS</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
