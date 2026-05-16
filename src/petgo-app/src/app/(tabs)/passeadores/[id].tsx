import { passeioService } from "@/src/services/passeioService";
import { usuarioService } from "@/src/services/usuarioService";
import { passeadorServicoService } from "@/src/services/passeadorServicoService";
import { PasseadorServicoResponseDto } from "@/src/types/passeadorServico";
import { UsuarioResponseDto } from "@/src/types/usuario";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PerfilPasseador() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [passeador, setPasseador] = useState<UsuarioResponseDto | null>(null);
  const [servicosCustomizados, setServicosCustomizados] = useState<PasseadorServicoResponseDto[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<string | null>(null);

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        setIsLoading(true);

        const [passeadorNoBanco, servicosNoBanco] = await Promise.all([
          usuarioService.buscarPorId(id as string),
          passeadorServicoService.listarPorPasseador(id as string)
        ]);

        setPasseador(passeadorNoBanco);
        setServicosCustomizados(servicosNoBanco);
      } catch (error) {
        console.error("Erro ao carregar o perfil do passeador:", error);
        Alert.alert("Ops!", "Não foi possível carregar os dados deste perfil.");
      } finally {
        setIsLoading(false);
      }
    };

    carregarPerfil();
  }, [id]);

  const handleAgendar = () => {
    if (!servicoSelecionado) {
      Alert.alert(
        "Selecione um serviço",
        "Por favor, escolha o tipo de passeio desejado antes de prosseguir.",
      );
      return;
    }

    const servico = servicosCustomizados.find((s) => s.id === servicoSelecionado);

    router.push({
      pathname: "/agendamento",
      params: {
        passeadorId: id as string,
        passeadorNome: passeador?.nome,
        servicoId: servico?.tipoPasseioId, // Passamos o ID global do tipo de passeio
        servicoNome: servico?.nomeTipoPasseio,
        servicoPreco: servico?.precoCustomizado,
        servicoDuracao: servico?.duracaoMinutos,
      },
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4876A8" />
        <Text className="text-gray-500 mt-3 font-medium">Carregando perfil...</Text>
      </View>
    );
  }

  const inicial = passeador?.nome?.charAt(0).toUpperCase() || "?";

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View className="bg-white p-8 items-center rounded-b-[40px] shadow-sm border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="absolute left-6 top-4 p-2">
            <Feather name="arrow-left" size={24} color="#4876A8" />
          </TouchableOpacity>

          {passeador?.fotoUrl ? (
            <Image source={{ uri: passeador.fotoUrl }} className="w-32 h-32 rounded-full border-4 border-blue-50" />
          ) : (
            <View className="w-32 h-32 rounded-full bg-blue-100 items-center justify-center border-4 border-blue-50">
              <Text className="text-5xl font-black text-[#4876A8]">{inicial}</Text>
            </View>
          )}

          <Text className="text-2xl font-bold text-gray-800 mt-4">{passeador?.nome || "Carregando..."}</Text>

          <View className="flex-row items-center mt-1">
            <Feather name="star" size={16} color="#FFB347" fill="#FFB347" />
            <Text className="text-gray-500 ml-1 font-medium">5.0 • Profissional Parceiro</Text>
          </View>
        </View>

        {/* INFO SECTION */}
        <View className="px-6 mt-6">
          <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <Text className="text-gray-800 text-lg font-bold mb-1">Informações do Profissional</Text>
            
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                <Feather name="map-pin" size={18} color="#4876A8" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs uppercase font-bold">Endereço / Região</Text>
                <Text className="text-gray-700 font-medium text-sm">{passeador?.endereco || "Não informado"}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center mr-3">
                <Feather name="phone" size={18} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs uppercase font-bold">Telefone de Contato</Text>
                <Text className="text-gray-700 font-medium text-sm">{passeador?.telefone || "Não informado"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* SERVICES SECTION */}
        <View className="px-6 mt-6 mb-28">
          <Text className="text-gray-800 text-lg font-bold mb-4">Serviços Disponíveis</Text>

          {servicosCustomizados.length === 0 ? (
            <View className="bg-white p-10 rounded-[32px] border border-gray-100 items-center justify-center">
              <MaterialCommunityIcons name="dog-service" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 font-bold mt-4 text-center px-6">Este passeador ainda não configurou seus serviços.</Text>
            </View>
          ) : (
            <View className="flex-col gap-y-3">
              {servicosCustomizados.map((servico) => {
                const isSelected = servicoSelecionado === servico.id;
                return (
                  <TouchableOpacity
                    key={servico.id}
                    onPress={() => setServicoSelecionado(servico.id)}
                    activeOpacity={0.9}
                    className={`p-6 rounded-[32px] flex-row items-center justify-between border-2 ${isSelected ? "bg-[#4876A8] border-[#4876A8]" : "bg-white border-gray-100"}`}
                  >
                    <View className="flex-1 pr-4">
                      <Text className={`text-lg font-black tracking-tighter ${isSelected ? "text-white" : "text-gray-900"}`}>{servico.nomeTipoPasseio}</Text>
                      <View className="flex-row items-center mt-1">
                        <Feather name="clock" size={14} color={isSelected ? "#BFDBFE" : "#9CA3AF"} />
                        <Text className={`text-xs ml-1 font-bold ${isSelected ? "text-blue-100" : "text-gray-400"}`}>{servico.duracaoMinutos} min</Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className={`text-xl font-black ${isSelected ? "text-white" : "text-[#4876A8]"}`}>
                        R$ {servico.precoCustomizado.toFixed(2)}
                      </Text>
                      <Feather name={isSelected ? "check-circle" : "circle"} size={20} color={isSelected ? "white" : "#D1D5DB"} className="mt-2" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FOOTER BUTTON */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-6 border-t border-gray-100 shadow-lg">
        <TouchableOpacity
          onPress={handleAgendar}
          disabled={!servicoSelecionado}
          activeOpacity={0.8}
          className={`py-5 rounded-full items-center justify-center flex-row shadow-md ${servicoSelecionado ? "bg-[#4876A8]" : "bg-gray-300"}`}
        >
          <MaterialCommunityIcons name="calendar-check" size={22} color="white" className="mr-2" />
          <Text className="text-white font-black text-lg uppercase tracking-widest">
            {servicoSelecionado ? "Confirmar e Agendar" : "Escolha um Serviço"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
