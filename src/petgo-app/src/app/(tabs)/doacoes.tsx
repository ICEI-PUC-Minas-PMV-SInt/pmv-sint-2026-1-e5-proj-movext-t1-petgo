import { petService } from "@/src/services/petService";
import { adocaoService } from "@/src/services/adocaoService";
import { authService } from "@/src/services/authService";
import { PetResponseDto } from "@/src/types/pet";
import { AdocaoResponseDto } from "@/src/types/adocao";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabType = "disponiveis" | "minhas";

export default function Doacoes() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("disponiveis");
  const [loading, setLoading] = useState(true);
  const [petsDisponiveis, setPetsDisponiveis] = useState<PetResponseDto[]>([]);
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<AdocaoResponseDto[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Details Modal
  const [selectedPet, setSelectedPet] = useState<PetResponseDto | null>(null);
  const [requesting, setRequesting] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const userId = await authService.obterUserId();

      if (activeTab === "disponiveis") {
        const pets = await petService.listarPets();
        // Filtramos pets que estão com status "Disponivel" ou "Adocao" e que NÃO são do usuário logado
        setPetsDisponiveis(pets.filter(p => 
            (p.status === "Disponivel" || p.status === "Adocao") && 
            p.usuarioId !== userId
        ));
      } else {
        const requests = await adocaoService.listarMinhasSolicitacoes();
        setMinhasSolicitacoes(requests);
      }
    } catch (error) {
      console.error("Erro ao carregar doações:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [activeTab]);

  const handleSolicitarAdocao = async (petId: string) => {
    Alert.alert(
      "Confirmar Interesse",
      "Deseja enviar uma solicitação de adoção para este pet? O dono entrará em contato com você.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setRequesting(true);
              await adocaoService.solicitarAdocao({ petId });
              Alert.alert("Sucesso!", "Sua solicitação foi enviada. Acompanhe em 'Minhas Solicitações'.");
              setSelectedPet(null);
              setActiveTab("minhas");
            } catch (error: any) {
              Alert.alert("Erro", error.message || "Não foi possível enviar a solicitação.");
            } finally {
              setRequesting(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "aprovado": return "text-green-600 bg-green-50 border-green-100";
      case "recusado": return "text-red-600 bg-red-50 border-red-100";
      default: return "text-amber-600 bg-amber-50 border-amber-100";
    }
  };

  const renderPetItem = ({ item }: { item: PetResponseDto }) => (
    <TouchableOpacity 
      onPress={() => setSelectedPet(item)}
      activeOpacity={0.9}
      className="bg-white mb-6 rounded-[32px] overflow-hidden border border-gray-100 shadow-sm"
    >
      <View className="relative">
        <Image 
          source={{ uri: item.fotoUrl || "https://via.placeholder.com/400" }} 
          className="w-full h-56"
          resizeMode="cover"
        />
        <View className="absolute top-4 left-4 bg-white/90 px-3 py-1.5 rounded-full border border-white">
          <Text className="text-[#4876A8] text-[10px] font-black uppercase tracking-widest">
            {item.especie === "Cao" ? "Cachorro" : item.especie}
          </Text>
        </View>
      </View>
      
      <View className="p-5">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-2xl font-black text-gray-900 tracking-tighter">{item.nome}</Text>
          <Text className="text-[#4876A8] font-bold text-sm bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">
            {item.idade} {item.idade === 1 ? "ano" : "anos"}
          </Text>
        </View>
        <Text className="text-gray-400 font-semibold mb-4">{item.raca}</Text>
        
        <View className="flex-row items-center border-t border-gray-50 pt-4">
          <MaterialCommunityIcons name="account-heart-outline" size={16} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs ml-1 font-medium italic">Resgatado por {item.nomeDono}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRequestItem = ({ item }: { item: AdocaoResponseDto }) => (
    <View className="bg-white mb-4 p-5 rounded-[28px] border border-gray-100 shadow-sm flex-row items-center">
      <Image 
        source={{ uri: item.fotoPetUrl || "https://via.placeholder.com/100" }} 
        className="w-16 h-16 rounded-2xl mr-4"
      />
      <View className="flex-1">
        <Text className="text-lg font-black text-gray-900 tracking-tighter">{item.nomePet}</Text>
        <Text className="text-gray-400 text-xs font-semibold mb-2">Solicitado em {new Date(item.dataSolicitacao).toLocaleDateString("pt-BR")}</Text>
        <View className={`self-start px-3 py-1 rounded-full border ${getStatusColor(item.status)}`}>
          <Text className="text-[10px] font-black uppercase tracking-widest">{item.status}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color="#D1D5DB" />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-8 pt-12 pb-6">
        <Text className="text-4xl font-black text-[#4876A8] tracking-tight">Doações</Text>
        <Text className="text-gray-400 font-semibold text-base mt-1">Encontre o seu novo melhor amigo</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-8 mb-6 gap-x-3">
        <TouchableOpacity 
          onPress={() => setActiveTab("disponiveis")}
          className={`flex-1 py-4 rounded-3xl items-center flex-row justify-center border-2 ${activeTab === "disponiveis" ? "bg-[#4876A8] border-[#4876A8]" : "bg-gray-50 border-gray-100"}`}
        >
          <MaterialCommunityIcons name="paw" size={18} color={activeTab === "disponiveis" ? "white" : "#9CA3AF"} />
          <Text className={`font-black ml-2 uppercase tracking-widest text-[11px] ${activeTab === "disponiveis" ? "text-white" : "text-gray-400"}`}>Disponíveis</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActiveTab("minhas")}
          className={`flex-1 py-4 rounded-3xl items-center flex-row justify-center border-2 ${activeTab === "minhas" ? "bg-[#4876A8] border-[#4876A8]" : "bg-gray-50 border-gray-100"}`}
        >
          <MaterialCommunityIcons name="heart-flash" size={18} color={activeTab === "minhas" ? "white" : "#9CA3AF"} />
          <Text className={`font-black ml-2 uppercase tracking-widest text-[11px] ${activeTab === "minhas" ? "text-white" : "text-gray-400"}`}>Meus Pedidos</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4876A8" />
        </View>
      ) : (
        <FlatList
          data={activeTab === "disponiveis" ? petsDisponiveis : minhasSolicitacoes}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === "disponiveis" ? renderPetItem : renderRequestItem as any}
          contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarDados(); }} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 bg-gray-50 rounded-[40px] border border-gray-100">
              <MaterialCommunityIcons name="dog-side" size={64} color="#D1D5DB" />
              <Text className="text-gray-400 font-bold mt-4 text-center px-10">
                {activeTab === "disponiveis" 
                    ? "Nenhum pet disponível para adoção no momento." 
                    : "Você ainda não fez nenhum pedido de adoção."}
              </Text>
            </View>
          }
        />
      )}

      {/* Detail Modal */}
      <Modal visible={!!selectedPet} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[50px] overflow-hidden h-[85%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="relative">
                <Image source={{ uri: selectedPet?.fotoUrl }} className="w-full h-80" />
                <TouchableOpacity 
                  onPress={() => setSelectedPet(null)}
                  className="absolute top-8 left-8 bg-white/90 p-3 rounded-2xl border border-white shadow-sm"
                >
                  <Feather name="chevron-down" size={24} color="#4876A8" />
                </TouchableOpacity>
              </View>

              <View className="p-10">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-3xl font-black text-gray-900 tracking-tighter">{selectedPet?.nome}</Text>
                  <View className="bg-blue-50 px-4 py-2 rounded-full">
                    <Text className="text-[#4876A8] font-black text-sm">{selectedPet?.idade} anos</Text>
                  </View>
                </View>
                <Text className="text-gray-400 font-black text-lg mb-6">{selectedPet?.raca}</Text>

                <View className="flex-row gap-x-4 mb-8">
                  <View className="flex-1 bg-gray-50 p-4 rounded-3xl items-center">
                    <MaterialCommunityIcons name="gender-male-female" size={20} color="#4876A8" />
                    <Text className="text-gray-400 text-[10px] font-bold uppercase mt-1">Sexo</Text>
                    <Text className="text-gray-900 font-black">Macho</Text>
                  </View>
                  <View className="flex-1 bg-gray-50 p-4 rounded-3xl items-center">
                    <MaterialCommunityIcons name="weight" size={20} color="#4876A8" />
                    <Text className="text-gray-400 text-[10px] font-bold uppercase mt-1">Porte</Text>
                    <Text className="text-gray-900 font-black">Médio</Text>
                  </View>
                  <View className="flex-1 bg-gray-50 p-4 rounded-3xl items-center">
                    <MaterialCommunityIcons name="heart-pulse" size={20} color="#4876A8" />
                    <Text className="text-gray-400 text-[10px] font-bold uppercase mt-1">Saúde</Text>
                    <Text className="text-gray-900 font-black">Vacinado</Text>
                  </View>
                </View>

                <Text className="text-gray-900 text-xl font-black mb-4 tracking-tight">Sobre {selectedPet?.nome}</Text>
                <Text className="text-gray-500 leading-6 text-base mb-10 font-medium">
                  {selectedPet?.descrição || "Este pet é muito dócil e está ansioso por um novo lar cheio de amor e carinho. Ideal para famílias com crianças e outros pets."}
                </Text>

                <View className="bg-[#4876A8]/5 p-6 rounded-[32px] border border-[#4876A8]/10 mb-10 flex-row items-center">
                   <Image source={{ uri: "https://ui-avatars.com/api/?name=" + selectedPet?.nomeDono }} className="w-12 h-12 rounded-full mr-4" />
                   <View className="flex-1">
                      <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Resgatado por</Text>
                      <Text className="text-gray-900 font-black text-lg tracking-tighter">{selectedPet?.nomeDono}</Text>
                   </View>
                   <TouchableOpacity className="bg-white p-3 rounded-2xl border border-gray-100">
                      <Feather name="message-circle" size={20} color="#4876A8" />
                   </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  onPress={() => handleSolicitarAdocao(selectedPet!.id)}
                  disabled={requesting}
                  activeOpacity={0.85}
                  className="bg-[#4876A8] py-6 rounded-full items-center shadow-xl shadow-blue-900/30 flex-row justify-center"
                >
                  {requesting ? <ActivityIndicator color="white" /> : (
                    <>
                      <MaterialCommunityIcons name="heart" size={24} color="white" className="mr-3" />
                      <Text className="text-white font-black text-xl uppercase tracking-widest ml-3">Quero Adotar</Text>
                    </>
                  )}
                </TouchableOpacity>
                <View className="h-20" />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
