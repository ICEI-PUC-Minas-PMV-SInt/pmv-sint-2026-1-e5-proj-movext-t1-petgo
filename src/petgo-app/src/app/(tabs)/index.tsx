import { authService } from "@/src/services/authService";
import { usuarioService } from "@/src/services/usuarioService";
import { UsuarioResponseDto } from "@/src/types/usuario";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MenuDog from "../../../assets/images/menuDog.png";

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [userType, setUserType] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<UsuarioResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const type = await authService.obterUserType();
        setUserType(type);

        const userId = await authService.obterUserId();
        if (userId) {
          const dados = await usuarioService.buscarPorId(userId);
          setPerfil(dados);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#4876A8" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />
      
      {/* 1. Header Premium com Curva */}
      <View className="bg-[#4876A8] pt-16 pb-20 px-8 rounded-b-[60px] shadow-2xl">
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-blue-100 text-lg font-semibold">Olá, {perfil?.nome.split(' ')[0] || 'Humano'}! 👋</Text>
            <Text className="text-white text-3xl font-black tracking-tighter">O que vamos fazer hoje?</Text>
          </View>
          <Pressable onPress={() => router.push("/perfil")} className="w-14 h-14 rounded-2xl bg-white/20 items-center justify-center border border-white/30">
            <Feather name="user" size={26} color="white" />
          </Pressable>
        </View>

        {/* Card de Destaque Rápido */}
        <Pressable 
            onPress={() => router.push(userType === "Passeador" ? "/passeios" : "/passeadores")}
            className="bg-white p-6 rounded-[32px] flex-row items-center shadow-xl shadow-blue-900/20"
        >
          <View className="bg-blue-50 p-4 rounded-2xl">
            <MaterialCommunityIcons 
                name={userType === "Passeador" ? "calendar-clock" : "dog-service"} 
                size={32} 
                color="#4876A8" 
            />
          </View>
          <View className="ml-5 flex-1">
            <Text className="text-gray-900 font-black text-xl tracking-tighter">
                {userType === "Passeador" ? "Minha Agenda" : "Novo Passeio"}
            </Text>
            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">
                {userType === "Passeador" ? "Veja seus horários" : "Agende com um profissional"}
            </Text>
          </View>
          <Feather name="arrow-right" size={20} color="#D1D5DB" />
        </Pressable>
      </View>

      {/* 2. Atalhos Rápidos */}
      <View className="px-8 mt-[-40px]">
        <View className="flex-row justify-between gap-x-4">
            <Pressable 
                onPress={() => router.push("/pets" as any)}
                className="flex-1 bg-white p-5 rounded-[32px] items-center border border-gray-100 shadow-sm"
            >
                <View className="bg-orange-50 p-3 rounded-2xl mb-3">
                    <MaterialCommunityIcons name="paw" size={24} color="#F97316" />
                </View>
                <Text className="text-gray-900 font-black text-xs uppercase tracking-widest">Meus Pets</Text>
            </Pressable>

            <Pressable 
                onPress={() => router.push("/shop" as any)}
                className="flex-1 bg-white p-5 rounded-[32px] items-center border border-gray-100 shadow-sm"
            >
                <View className="bg-green-50 p-3 rounded-2xl mb-3">
                    <MaterialCommunityIcons name="store" size={24} color="#10B981" />
                </View>
                <Text className="text-gray-900 font-black text-xs uppercase tracking-widest">Loja</Text>
            </Pressable>

            <Pressable 
                onPress={() => router.push("/doacoes" as any)}
                className="flex-1 bg-white p-5 rounded-[32px] items-center border border-gray-100 shadow-sm"
            >
                <View className="bg-red-50 p-3 rounded-2xl mb-3">
                    <MaterialCommunityIcons name="heart" size={24} color="#EF4444" />
                </View>
                <Text className="text-gray-900 font-black text-xs uppercase tracking-widest">Doações</Text>
            </Pressable>
        </View>
      </View>

      {/* 3. Seção Informativa / Destaque */}
      <View className="px-8 mt-10 mb-12">
        <Text className="text-gray-900 font-black text-xl mb-5 tracking-tighter">Destaques PetGo</Text>
        
        {/* Pets para Adoção */}
        <View className="mt-6 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
            <View className="flex-row items-center mb-3">
                <MaterialCommunityIcons name="heart" size={20} color="#EF4444" />
                <Text className="text-gray-900 font-black text-xs uppercase tracking-widest ml-2">Pets esperando por você</Text>
            </View>
            <Text className="text-gray-900 font-black text-lg tracking-tighter mb-1">Muitos amiguinhos procuram um lar!</Text>
            <Text className="text-gray-500 font-semibold leading-5 text-sm">
                Que tal conhecer os pets que estão disponíveis para adoção hoje? Eles estão ansiosos para te encontrar.
            </Text>
            <TouchableOpacity onPress={() => router.push("/doacoes")} className="mt-4 bg-white self-start px-6 py-2 rounded-full border border-gray-100">
                <Text className="text-red-500 font-black text-[10px] uppercase tracking-widest">Ver Pets</Text>
            </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
