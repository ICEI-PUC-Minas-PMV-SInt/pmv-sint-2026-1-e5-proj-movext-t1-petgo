import { CardPasseador } from "@/src/components/CardPasseador";
import { authService } from "@/src/services/authService";
import { usuarioService } from "@/src/services/usuarioService";
import { UsuarioResponseDto } from "@/src/types/usuario";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Passeadores() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [passeadores, setPasseadores] = useState<UsuarioResponseDto[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioResponseDto | null>(
    null,
  );

  const carregarDados = async () => {
    try {
      setIsLoading(true);

      const idSalvo = await authService.obterUserId();

      const dadosNoBanco = await usuarioService.listarPasseadores();

      if (idSalvo) {
        const perfil = await usuarioService.buscarPorId(idSalvo);
        setUsuarioLogado(perfil);
        // Regra de Negócio: Não mostrar o próprio usuário na lista de passeadores disponíveis
        const listaFiltrada = dadosNoBanco.filter((p) => p.id !== idSalvo);
        setPasseadores(listaFiltrada);
      } else {
        setPasseadores(dadosNoBanco);
      }
    } catch (error) {
      console.error("Erro ao carregar passeadores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      {!isLoading && usuarioLogado && (
        <View className="px-5 pt-6 pb-2">
          {usuarioLogado.tipo === "Passeador" ? (
            <TouchableOpacity 
              onPress={() => router.push("/passeios")}
              className="bg-orange-50 p-4 rounded-2xl flex-row items-center border border-orange-100 shadow-sm active:scale-[0.98]"
            >
              <View className="bg-orange-500 p-2 rounded-xl">
                <Feather name="calendar" size={20} color="white" />
              </View>
              <View className="ml-3">
                <Text className="text-orange-900 font-bold">
                  Agenda de Trabalho
                </Text>
                <Text className="text-orange-700 text-xs">
                  Passeios que você deve realizar
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => router.push("/passeios")}
              className="bg-blue-50 p-4 rounded-2xl flex-row items-center border border-blue-100 shadow-sm active:scale-[0.98]"
            >
              <View className="bg-[#4A80B4] p-2 rounded-xl">
                <Feather name="map-pin" size={20} color="white" />
              </View>
              <View className="ml-3">
                <Text className="text-blue-900 font-bold">
                  Meus Passeios Agendados
                </Text>
                <Text className="text-blue-700 text-xs">
                  Acompanhe seus pets
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4A80B4" />
        </View>
      ) : (
        <FlatList
          data={passeadores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CardPasseador passeador={item} />}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 40,
          }}
          ListHeaderComponent={
            <View className="mb-6 mt-2">
              <Text className="text-3xl font-bold text-[#4A80B4]">
                Passeadores Disponíveis
              </Text>
              <Text className="text-base text-gray-400 mt-1">
                {usuarioLogado?.tipo === "Passeador"
                  ? "Sua rede de colegas profissionais."
                  : "Profissionais prontos para passear com seu pet!"}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Feather name="info" size={40} color="#D1D5DB" />
              <Text className="text-gray-400 mt-2">
                Nenhum outro passeador disponível.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
