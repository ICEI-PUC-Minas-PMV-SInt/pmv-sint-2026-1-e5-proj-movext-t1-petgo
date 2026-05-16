import { petService } from "@/src/services/petService";
import { passeioService } from "@/src/services/passeioService";
import { maskDate, maskTime } from "@/src/utils/masks";
import { PetResponseDto } from "@/src/types/pet";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../services/authService";
import { usuarioService } from "../services/usuarioService";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Agendamento() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { passeadorId, passeadorNome, servicoId, servicoNome, servicoPreco, servicoDuracao } = params;

  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [pets, setPets] = useState<PetResponseDto[]>([]);
  const [petSelecionado, setPetSelecionado] = useState<string | null>(null);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [enderecoBusca, setEnderecoBusca] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [petsData, userId] = await Promise.all([
          petService.listarMeusPets(),
          authService.obterUserId()
        ]);
        
        setPets(petsData);
        if (petsData.length > 0) {
          setPetSelecionado(petsData[0].id);
        }

        if (userId) {
          const user = await usuarioService.buscarPorId(userId);
          setEnderecoBusca(user?.endereco || "");
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleConfirmar = async () => {
    if (!petSelecionado || !data || !hora || !enderecoBusca) {
      Alert.alert("Atenção", "Por favor, preencha o pet, data, horário e endereço de busca.");
      return;
    }

    try {
      setScheduling(true);
      
      const [dia, mes, ano] = data.split("/");
      const isoString = `${ano}-${mes}-${dia}T${hora}:00Z`;

      const descricaoFinal = `📍 ENDEREÇO DE BUSCA: ${enderecoBusca}\n⏱️ DURAÇÃO: ${servicoDuracao} minutos\n\n📝 OBSERVAÇÕES: ${observacoes || "Nenhuma"}`;

      await passeioService.criarPasseio({
        passeadorId: passeadorId as string,
        tipoPasseioId: servicoId as string,
        petId: petSelecionado,
        dataHoraPasseio: isoString,
        descricaoPasseio: descricaoFinal,
      });

      Alert.alert("Sucesso!", "Seu passeio foi agendado com sucesso.", [
        { text: "OK", onPress: () => router.replace("/passeios") }
      ]);
    } catch (error: any) {
      Alert.alert("Erro ao Agendar", error.message || "Não foi possível confirmar o agendamento.");
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4876A8" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-6" 
        style={{ paddingTop: insets.top + 10 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center mb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="#4876A8" />
          </TouchableOpacity>
          <Text className="text-2xl font-black text-[#4876A8] tracking-tighter">Agendamento</Text>
        </View>

        {/* Resumo do Serviço */}
        <View className="bg-blue-50 p-6 rounded-[32px] mb-8 border border-blue-100 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="bg-[#4876A8] p-3 rounded-2xl">
              <MaterialCommunityIcons name="dog-service" size={24} color="white" />
            </View>
            <View className="ml-4">
              <Text className="text-blue-900 font-bold text-lg">{servicoNome}</Text>
              <Text className="text-[#4876A8] text-sm font-medium">Passeador: {passeadorNome}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-4 ml-1">
             <Feather name="clock" size={14} color="#4876A8" />
             <Text className="text-[#4876A8] text-xs font-bold ml-2">Duração: {servicoDuracao} minutos</Text>
          </View>

          <View className="border-t border-blue-100 pt-4 flex-row justify-between items-center">
            <Text className="text-blue-700 font-bold uppercase text-[10px] tracking-widest">Valor do Serviço</Text>
            <Text className="text-[#4876A8] font-black text-xl">R$ {servicoPreco}</Text>
          </View>
        </View>

        {/* Seleção de Pet */}
        <View className="mb-6">
          <Text className="text-gray-800 font-bold mb-3 ml-1">Para qual Pet?</Text>
          {pets.length === 0 ? (
            <TouchableOpacity onPress={() => router.push("/pets" as any)} className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
               <Text className="text-orange-700 text-sm font-medium">Você ainda não tem pets cadastrados. Toque aqui para cadastrar.</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-x-3">
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  onPress={() => setPetSelecionado(pet.id)}
                  className={`px-6 py-4 rounded-3xl border-2 flex-row items-center ${
                    petSelecionado === pet.id ? "bg-[#4876A8] border-[#4876A8]" : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <MaterialCommunityIcons name="dog" size={20} color={petSelecionado === pet.id ? "white" : "#D1D5DB"} />
                  <Text className={`ml-2 font-bold ${petSelecionado === pet.id ? "text-white" : "text-gray-400"}`}>
                    {pet.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Data e Hora */}
        <View className="flex-row gap-x-4 mb-6">
          <View className="flex-1">
            <Text className="text-gray-800 font-bold mb-3 ml-1">Data</Text>
            <View className="flex-row items-center px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50">
              <Feather name="calendar" size={18} color="#D1D5DB" />
              <TextInput
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#D1D5DB"
                value={data}
                onChangeText={(t) => setData(maskDate(t))}
                keyboardType="numeric"
                maxLength={10}
                className="ml-3 text-gray-900 font-medium flex-1"
              />
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-gray-800 font-bold mb-3 ml-1">Horário</Text>
            <View className="flex-row items-center px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50">
              <Feather name="clock" size={18} color="#D1D5DB" />
              <TextInput
                placeholder="HH:MM"
                placeholderTextColor="#D1D5DB"
                value={hora}
                onChangeText={(t) => setHora(maskTime(t))}
                keyboardType="numeric"
                maxLength={5}
                className="ml-3 text-gray-900 font-medium flex-1"
              />
            </View>
          </View>
        </View>

        {/* Endereço de Busca */}
        <View className="mb-6">
          <Text className="text-gray-800 font-bold mb-3 ml-1">Onde buscar o pet?</Text>
          <View className="flex-row items-center px-4 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50">
            <Feather name="map-pin" size={18} color="#D1D5DB" />
            <TextInput
              placeholder="Endereço completo para a busca"
              placeholderTextColor="#D1D5DB"
              value={enderecoBusca}
              onChangeText={setEnderecoBusca}
              className="ml-3 text-gray-900 font-medium flex-1"
            />
          </View>
        </View>

        {/* Observações */}
        <View className="mb-10">
          <Text className="text-gray-800 font-bold mb-3 ml-1">Instruções Adicionais</Text>
          <TextInput
            placeholder="Ex: Ele é um pouco arisco com outros cães..."
            placeholderTextColor="#D1D5DB"
            multiline
            numberOfLines={4}
            value={observacoes}
            onChangeText={setObservacoes}
            className="p-4 rounded-3xl border-2 border-gray-100 bg-gray-50 text-gray-900 font-medium text-start min-h-[100px]"
          />
        </View>

        <TouchableOpacity
          onPress={handleConfirmar}
          disabled={scheduling}
          activeOpacity={0.85}
          className="bg-[#4876A8] py-5 rounded-full items-center shadow-md mb-20 active:scale-[0.98]"
        >
          {scheduling ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-xl uppercase tracking-widest">Confirmar Agendamento</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
