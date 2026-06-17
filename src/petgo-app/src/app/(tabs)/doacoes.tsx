import { petService } from "@/src/services/petService";
import { adocaoService } from "@/src/services/adocaoService";
import { authService } from "@/src/services/authService";
import { PetResponseDto } from "@/src/types/pet";
import { AdocaoResponseDto } from "@/src/types/adocao";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from 'expo-image';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from "expo-router";

type TabType = "disponiveis" | "minhas";

const formatarStatusAdocao = (status: string): string => {
  const labels: Record<string, string> = {
    Pendente: "Pendente",
    EmAnalise: "Em Análise",
    Aprovado: "Aprovado",
    Recusado: "Recusado",
    Adotado: "Entregue",
  };
  return labels[status] ?? status;
};

const getStatusAccent = (status: string): string => {
  switch (status.toLowerCase()) {
    case "adotado":   return "bg-purple-400";
    case "aprovado":  return "bg-green-400";
    case "recusado":  return "bg-red-400";
    case "pendente":  return "bg-amber-400";
    case "emanalise": return "bg-blue-400";
    default:          return "bg-gray-200";
  }
};

export default function Doacoes() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("disponiveis");
  const [loading, setLoading] = useState(true);
  const [petsDisponiveis, setPetsDisponiveis] = useState<PetResponseDto[]>([]);
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<AdocaoResponseDto[]>([]);
  const [solicitacoesRecebidas, setSolicitacoesRecebidas] = useState<AdocaoResponseDto[]>([]);
  const [subTab, setSubTab] = useState<"enviadas" | "recebidas">("recebidas");
  const [refreshing, setRefreshing] = useState(false);
  
  // Details Modal
  const [selectedPet, setSelectedPet] = useState<PetResponseDto | null>(null);
  const [requesting, setRequesting] = useState(false);

  // Donation Modal (My Pets)
  const [donationModalVisible, setDonationModalVisible] = useState(false);
  const [meusPets, setMeusPets] = useState<PetResponseDto[]>([]);
  const [loadingMeusPets, setLoadingMeusPets] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [selectedAdocao, setSelectedAdocao] = useState<AdocaoResponseDto | null>(null);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const userId = await authService.obterUserId();
      setCurrentUserId(userId);

      if (activeTab === "disponiveis") {
        const pets = await petService.listarPets();
        const lista = pets
          .filter(p => p.status === "DisponivelAdocao")
          .sort((a, b) => (a.tipoDono?.toLowerCase() === "ong" ? -1 : b.tipoDono?.toLowerCase() === "ong" ? 1 : 0));
        setPetsDisponiveis(lista);
      } else {
        const [sent, received] = await Promise.all([
          adocaoService.listarMinhasSolicitacoes(),
          adocaoService.listarSolicitacoesRecebidas()
        ]);
        setMinhasSolicitacoes(sent);
        setSolicitacoesRecebidas(received);
      }
    } catch (error) {
      console.error("Erro ao carregar doações:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const carregarMeusPets = async () => {
    try {
        setLoadingMeusPets(true);
        const pets = await petService.listarMeusPets();
        setMeusPets(pets);
    } catch (error) {
        console.error("Erro ao carregar meus pets:", error);
    } finally {
        setLoadingMeusPets(false);
    }
  };

  const handlePickImage = async (pet: PetResponseDto) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão", "Precisamos de acesso à galeria para anexar a foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      pet.fotoUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setRefreshing(!refreshing);
    }
  };

  const handleToggleAdocaoDirect = async (pet: PetResponseDto) => {
    const isAdocao = pet.status === "DisponivelAdocao";
    const novoStatus = isAdocao ? 0 : 1;

    if (!isAdocao) {
      const faltando: string[] = [];
      if (!pet.fotoUrl || pet.fotoUrl.trim() === "") faltando.push("• Foto do pet");
      if (!pet.descricao || pet.descricao.trim().length < 10) faltando.push("• Descrição (mínimo 10 caracteres)");
      if (!pet.saude || pet.saude.trim() === "" || pet.saude === "N/A") faltando.push("• Saúde / Observações");

      if (faltando.length > 0) {
        Alert.alert(
          "Campos incompletos para adoção",
          `Complete as informações antes de anunciar:\n\n${faltando.join("\n")}`,
          [
            { text: "Editar Pet", onPress: () => setEditingPetId(pet.id) },
            { text: "Cancelar", style: "cancel" },
          ]
        );
        return;
      }
    }

    try {
        await petService.alterarStatus(pet.id, novoStatus);
        carregarMeusPets();
        carregarDados();
        Alert.alert("Sucesso", isAdocao ? "Pet removido da adoção." : "Pet agora está disponível para adoção!");
    } catch (error) {
        Alert.alert("Erro", "Não foi possível alterar o status.");
    }
  };

  const handleUpdatePetInfo = async (pet: PetResponseDto) => {
    try {
        const sexoEnum = pet.sexo === "Macho" ? 0 : 1;
        const porteEnum = pet.porte === "Pequeno" ? 0 : (pet.porte === "Médio" || pet.porte === "Medio" ? 1 : 2);

        await petService.editarPet(pet.id, {
            nome: pet.nome,
            idade: pet.idade,
            descricao: pet.descricao,
            fotoUrl: pet.fotoUrl || "",
            sexo: sexoEnum,
            porte: porteEnum,
            saude: pet.saude,
            status: pet.status
        });
        carregarMeusPets();
        carregarDados();
        Alert.alert("Sucesso", "Informações do pet atualizadas!");
    } catch (error) {
        Alert.alert("Erro", "Não foi possível atualizar as informações.");
    }
  };

  const handleUpdateAdocaoStatus = async (id: string, novoStatus: number) => {
    try {
        await adocaoService.alterarStatus(id, novoStatus);
        carregarDados();
        Alert.alert("Sucesso", "Status da solicitação atualizado!");
    } catch (error) {
        Alert.alert("Erro", "Não foi possível atualizar o status.");
    }
  };

  useEffect(() => {
    carregarDados();
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [activeTab])
  );

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

  const renderReceivedRequestItem = ({ item }: { item: AdocaoResponseDto }) => (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => setSelectedAdocao(item)}
      className="bg-white mx-6 mb-4 rounded-[32px] overflow-hidden border border-gray-100 shadow-xl shadow-gray-300/40"
    >
      {/* Status accent bar */}
      <View className={`h-1.5 w-full ${getStatusAccent(item.status)}`} />

      <View className="px-6 pt-5 pb-4">
        {/* Adopter ——♥—— Pet visual connection */}
        <View className="flex-row items-center mb-5">
          <View className="rounded-[20px] overflow-hidden border-2 border-gray-100" style={{ width: 60, height: 60 }}>
            {item.fotoAdotanteUrl ? (
              <Image source={{ uri: item.fotoAdotanteUrl }} style={{ width: 60, height: 60 }} contentFit="cover" />
            ) : (
              <View style={{ width: 60, height: 60 }} className="bg-[#4876A8]/10 items-center justify-center">
                <Feather name="user" size={26} color="#4876A8" />
              </View>
            )}
          </View>
          <View className="flex-1 items-center px-3">
            <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1.5">quer adotar</Text>
            <View className="flex-row items-center w-full">
              <View className="flex-1 h-px bg-gray-100" />
              <View className="bg-orange-50 rounded-full p-1.5 border border-orange-100 mx-2">
                <MaterialCommunityIcons name="heart" size={14} color="#F97316" />
              </View>
              <View className="flex-1 h-px bg-gray-100" />
            </View>
          </View>
          <View className="rounded-[20px] overflow-hidden border-2 border-orange-100" style={{ width: 60, height: 60 }}>
            <Image
              source={item.fotoPetUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"}
              style={{ width: 60, height: 60 }}
              contentFit="cover"
            />
          </View>
        </View>

        {/* Names + status */}
        <View className="flex-row items-end justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-gray-900 font-black text-xl tracking-tighter" numberOfLines={1}>{item.nomeAdotante}</Text>
            <View className="flex-row items-center mt-0.5">
              <MaterialCommunityIcons name="paw" size={11} color="#9CA3AF" />
              <Text className="text-gray-400 text-[10px] font-bold ml-1" numberOfLines={1}>{item.nomePet}</Text>
            </View>
          </View>
          <View className={`px-3 py-1.5 rounded-full border ${getStatusColor(item.status)}`}>
            <Text className="text-[9px] font-black uppercase tracking-widest">{formatarStatusAdocao(item.status)}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-100">
        <View className="flex-row items-center">
          <Feather name="calendar" size={11} color="#9CA3AF" />
          <Text className="text-gray-400 text-[10px] font-bold ml-1">{new Date(item.dataSolicitacao).toLocaleDateString("pt-BR")}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-[#4876A8] font-black text-[10px] uppercase tracking-widest mr-1">Ver detalhes</Text>
          <Feather name="chevron-right" size={13} color="#4876A8" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "adotado": return "text-purple-600 bg-purple-50 border-purple-100";
      case "aprovado": return "text-green-600 bg-green-50 border-green-100";
      case "recusado": return "text-red-600 bg-red-50 border-red-100";
      case "pendente": return "text-amber-600 bg-amber-50 border-amber-100";
      case "emanalise": return "text-blue-600 bg-blue-50 border-blue-100";
      default: return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  const renderPetItem = ({ item }: { item: PetResponseDto }) => {
    const isMine = item.usuarioId === currentUserId;
    const isOng = item.tipoDono?.toLowerCase() === "ong";

    return (
      <TouchableOpacity
        onPress={() => setSelectedPet(item)}
        activeOpacity={0.85}
        className={`bg-white mx-4 mb-3 rounded-[28px] overflow-hidden border shadow-sm shadow-gray-200 ${isMine ? "border-orange-200" : isOng ? "border-blue-100" : "border-gray-100"}`}
      >
        <View className="flex-row items-center p-4 gap-x-4">
          <View className="relative">
            <Image
              source={(item.fotoUrl && item.fotoUrl.trim() !== "") ? item.fotoUrl : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
              style={{ width: 90, height: 90, borderRadius: 20 }}
              contentFit="cover"
              transition={300}
            />
            {isMine && (
              <View className="absolute -top-1 -right-1 bg-orange-500 px-2 py-0.5 rounded-full border border-white">
                <Text className="text-white font-black text-[7px] uppercase">Meu</Text>
              </View>
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-0.5">
              <Text className="text-gray-900 font-black text-lg tracking-tighter flex-1 mr-2" numberOfLines={1}>{item.nome}</Text>
              <View className="bg-blue-50 px-2.5 py-1 rounded-full">
                <Text className="text-[#4876A8] font-black text-[10px]">{item.idade} {item.idade === 1 ? "ano" : "anos"}</Text>
              </View>
            </View>

            <Text className="text-gray-400 font-semibold text-xs mb-2" numberOfLines={1}>{item.raca}</Text>

            <View className="flex-row items-center gap-x-2 flex-wrap">
              <View className="bg-gray-100 px-2.5 py-1 rounded-full">
                <Text className="text-gray-500 font-bold text-[9px] uppercase">{item.especie}</Text>
              </View>
              <View className="bg-gray-100 px-2.5 py-1 rounded-full">
                <Text className="text-gray-500 font-bold text-[9px] uppercase">{item.sexo}</Text>
              </View>
              <View className="bg-gray-100 px-2.5 py-1 rounded-full">
                <Text className="text-gray-500 font-bold text-[9px] uppercase">{item.porte}</Text>
              </View>
            </View>

            {isOng && (
              <View className="flex-row items-center mt-2">
                <View className="bg-[#4876A8] px-2.5 py-1 rounded-full flex-row items-center">
                  <MaterialCommunityIcons name="shield-check" size={9} color="white" />
                  <Text className="text-white font-black text-[8px] uppercase tracking-widest ml-1">ONG Parceira</Text>
                </View>
              </View>
            )}
          </View>

          <Feather name="chevron-right" size={18} color="#D1D5DB" />
        </View>

        {isMine && (
          <View className="bg-orange-50 py-2 items-center border-t border-orange-100">
            <Text className="text-orange-500 font-black text-[9px] uppercase tracking-[2px]">Você está doando este pet</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderRequestItem = ({ item }: { item: AdocaoResponseDto }) => (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => {
        const pet = petsDisponiveis.find(p => p.id === item.petId);
        if (pet) setSelectedPet(pet);
        else Alert.alert("Informação", `Pedido para ${item.nomePet}.\nStatus: ${formatarStatusAdocao(item.status)}\nData: ${new Date(item.dataSolicitacao).toLocaleDateString("pt-BR")}`);
      }}
      className="bg-white mx-6 mb-4 rounded-[32px] overflow-hidden border border-gray-100 shadow-xl shadow-gray-300/40"
    >
      {/* Status accent bar */}
      <View className={`h-1.5 w-full ${getStatusAccent(item.status)}`} />

      <View className="p-6">
        <View className="flex-row items-center">
          {/* Pet photo */}
          <View className="rounded-[20px] overflow-hidden border-2 border-gray-100 mr-5" style={{ width: 84, height: 84 }}>
            <Image
              source={item.fotoPetUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"}
              style={{ width: 84, height: 84 }}
              contentFit="cover"
              transition={300}
            />
          </View>
          {/* Info */}
          <View className="flex-1">
            <Text className="text-gray-900 font-black text-xl tracking-tighter mb-1" numberOfLines={1}>{item.nomePet}</Text>
            {item.nomeDoador ? (
              <View className="flex-row items-center mb-2">
                <Feather name="home" size={11} color="#9CA3AF" />
                <Text className="text-gray-400 text-[10px] font-bold ml-1" numberOfLines={1}>{item.nomeDoador}</Text>
              </View>
            ) : null}
            <View className={`self-start px-3 py-1.5 rounded-full border ${getStatusColor(item.status)}`}>
              <Text className="text-[9px] font-black uppercase tracking-widest">{formatarStatusAdocao(item.status)}</Text>
            </View>
          </View>
        </View>

        {/* Footer inside card */}
        <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <View className="flex-row items-center">
            <Feather name="calendar" size={11} color="#9CA3AF" />
            <Text className="text-gray-400 text-[10px] font-bold ml-1">Solicitado em {new Date(item.dataSolicitacao).toLocaleDateString("pt-BR")}</Text>
          </View>
          <Feather name="chevron-right" size={16} color="#D1D5DB" />
        </View>
      </View>

      {item.status === "Aprovado" && (
        <View className="mx-5 mb-5 bg-green-50 py-3 rounded-2xl items-center border border-green-100 flex-row justify-center">
          <MaterialCommunityIcons name="check-circle" size={14} color="#16A34A" />
          <Text className="text-green-700 font-black uppercase tracking-widest text-[10px] ml-2">Aprovada — aguarde contato para retirada</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-8 pt-12 pb-6 flex-row justify-between items-end">
        <View>
            <Text className="text-4xl font-black text-[#4876A8] tracking-tight">Doações</Text>
            <Text className="text-gray-400 font-semibold text-base mt-1">Encontre o seu novo melhor amigo</Text>
        </View>
        <TouchableOpacity 
            onPress={() => { setDonationModalVisible(true); carregarMeusPets(); }}
            className="bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100 mb-1"
        >
            <Text className="text-orange-600 font-black text-[10px] uppercase tracking-widest">+ Doar Pet</Text>
        </TouchableOpacity>
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
          <Text className={`font-black ml-2 uppercase tracking-widest text-[11px] ${activeTab === "minhas" ? "text-white" : "text-gray-400"}`}>Solicitações</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "minhas" && (
        <View className="flex-row px-8 mb-6 gap-x-2">
           <TouchableOpacity 
            onPress={() => setSubTab("recebidas")}
            className={`px-6 py-2 rounded-full ${subTab === "recebidas" ? "bg-orange-500" : "bg-gray-100"}`}
          >
            <Text className={`font-black text-[10px] uppercase ${subTab === "recebidas" ? "text-white" : "text-gray-400"}`}>Recebidas</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSubTab("enviadas")}
            className={`px-6 py-2 rounded-full ${subTab === "enviadas" ? "bg-[#4876A8]" : "bg-gray-100"}`}
          >
            <Text className={`font-black text-[10px] uppercase ${subTab === "enviadas" ? "text-white" : "text-gray-400"}`}>Enviadas</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4876A8" />
        </View>
      ) : (
        <FlatList
          data={activeTab === "disponiveis" ? petsDisponiveis : (subTab === "enviadas" ? minhasSolicitacoes : solicitacoesRecebidas)}
          keyExtractor={(item) => item.id}
          numColumns={1}
          key="list"
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={activeTab === "disponiveis" ? renderPetItem : (subTab === "enviadas" ? renderRequestItem as any : renderReceivedRequestItem as any)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarDados(); }} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 bg-gray-50 rounded-[40px] border border-gray-100">
              <MaterialCommunityIcons name="dog-side" size={64} color="#D1D5DB" />
              <Text className="text-gray-400 font-bold mt-4 text-center px-10">
                {activeTab === "disponiveis" 
                    ? "Nenhum pet disponível para adoção no momento." 
                    : "Nenhuma solicitação encontrada nesta categoria."}
              </Text>
            </View>
          }
        />
      )}

      {/* Adopter Profile Modal */}
      <Modal visible={!!selectedAdocao} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/70 justify-center items-center px-8">
            <View className="bg-white w-full rounded-[45px] overflow-hidden">
                <View className="bg-[#4876A8] p-10 items-center relative">
                    <TouchableOpacity 
                        onPress={() => setSelectedAdocao(null)}
                        className="absolute top-6 right-6 bg-white/20 p-2 rounded-xl"
                    >
                        <Feather name="x" size={20} color="white" />
                    </TouchableOpacity>
                    <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center border-4 border-white/30 mb-4 overflow-hidden">
                        {selectedAdocao?.fotoAdotanteUrl ? (
                            <Image source={{ uri: selectedAdocao.fotoAdotanteUrl }} style={{ width: 96, height: 96 }} contentFit="cover" />
                        ) : (
                            <Feather name="user" size={48} color="white" />
                        )}
                    </View>
                    <Text className="text-white font-black text-2xl tracking-tighter text-center">{selectedAdocao?.nomeAdotante}</Text>
                    <Text className="text-blue-100 font-bold text-xs uppercase tracking-widest mt-1">Interessado no pet {selectedAdocao?.nomePet}</Text>
                </View>
                <View className="p-10">
                    <View className="gap-y-6 mb-10">
                        <View className="flex-row items-center bg-gray-50 p-5 rounded-3xl border border-gray-100">
                            <View className="bg-[#4876A8]/10 p-3 rounded-2xl mr-4">
                                <Feather name="mail" size={18} color="#4876A8" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-0.5">E-mail de Contato</Text>
                                <Text className="text-gray-900 font-bold text-sm">{selectedAdocao?.emailAdotante}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center bg-gray-50 p-5 rounded-3xl border border-gray-100">
                            <View className="bg-green-50 p-3 rounded-2xl mr-4">
                                <Feather name="phone" size={18} color="#16A34A" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-0.5">Telefone / WhatsApp</Text>
                                <Text className="text-gray-900 font-bold text-sm">{selectedAdocao?.telefoneAdotante || "(Não informado)"}</Text>
                            </View>
                        </View>
                    </View>
                    {(selectedAdocao?.status === "Pendente" || selectedAdocao?.status === "EmAnalise") ? (
                        <View className="gap-y-4">
                            {selectedAdocao?.status === "Pendente" && (
                                <TouchableOpacity
                                    onPress={() => { handleUpdateAdocaoStatus(selectedAdocao.id, 1); setSelectedAdocao(null); }}
                                    className="bg-blue-50 py-5 rounded-3xl items-center border border-blue-100"
                                >
                                    <Text className="text-blue-600 font-black uppercase tracking-widest text-[10px]">Colocar em Análise</Text>
                                </TouchableOpacity>
                            )}
                            <View className="flex-row gap-x-4">
                                <TouchableOpacity
                                    onPress={() => { handleUpdateAdocaoStatus(selectedAdocao.id, 3); setSelectedAdocao(null); }}
                                    className="flex-1 bg-red-50 py-5 rounded-3xl items-center border border-red-100"
                                >
                                    <Text className="text-red-600 font-black uppercase tracking-widest text-[10px]">Recusar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => { handleUpdateAdocaoStatus(selectedAdocao.id, 2); setSelectedAdocao(null); }}
                                    className="flex-[2] bg-green-500 py-5 rounded-3xl items-center shadow-lg shadow-green-900/20"
                                >
                                    <Text className="text-white font-black uppercase tracking-widest text-[10px]">Aprovar Adoção</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : selectedAdocao?.status === "Aprovado" ? (
                        <View className="gap-y-4">
                            <View className="bg-green-50 p-4 rounded-2xl border border-green-100">
                                <Text className="text-green-700 font-bold text-xs text-center">Adoção aprovada — aguardando retirada do pet pelo adotante.</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => { handleUpdateAdocaoStatus(selectedAdocao.id, 4); setSelectedAdocao(null); }}
                                className="bg-purple-500 py-5 rounded-3xl items-center shadow-lg shadow-purple-900/20"
                            >
                                <Text className="text-white font-black uppercase tracking-widest text-[10px]">Confirmar Entrega do Pet</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { handleUpdateAdocaoStatus(selectedAdocao.id, 3); setSelectedAdocao(null); }}
                                className="bg-red-50 py-5 rounded-3xl items-center border border-red-100"
                            >
                                <Text className="text-red-600 font-black uppercase tracking-widest text-[10px]">Cancelar Adoção (Não Buscou)</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className={`p-5 rounded-3xl items-center border ${getStatusColor(selectedAdocao?.status || "")}`}>
                            <Text className="font-black uppercase tracking-widest text-[10px]">Status: {formatarStatusAdocao(selectedAdocao?.status ?? "")}</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
      </Modal>

      {/* Pet Details Modal */}
      <Modal visible={!!selectedPet} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
            <TouchableOpacity 
                activeOpacity={1} 
                onPress={() => setSelectedPet(null)} 
                className="absolute inset-0" 
            />
            <View className="bg-white rounded-t-[50px] overflow-hidden h-[90%]">
                <TouchableOpacity 
                    onPress={() => { setSelectedPet(null); setIsEditing(false); }}
                    className="absolute top-8 right-8 z-50 bg-white/90 p-4 rounded-3xl shadow-xl border border-white"
                >
                    <Feather name="chevron-down" size={24} color="#4876A8" />
                </TouchableOpacity>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="relative">
                        <Image 
                            source={(selectedPet?.fotoUrl && selectedPet.fotoUrl.trim() !== "") ? selectedPet.fotoUrl : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800"} 
                            style={{ width: '100%', height: 400 }}
                            contentFit="cover"
                            transition={500}
                        />
                        <View className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
                    </View>
                    <View className="p-10">
                        {isEditing ? (
                            <View className="gap-y-6 mt-4">
                                <View className="flex-row gap-x-4">
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase ml-1 mb-1">Nome</Text>
                                        <TextInput 
                                            className="bg-gray-50 p-5 rounded-[25px] border border-gray-100 font-bold" 
                                            value={selectedPet?.nome}
                                            onChangeText={(val) => setSelectedPet(prev => prev ? { ...prev, nome: val } : null)}
                                        />
                                    </View>
                                    <View className="flex-[0.5]">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase ml-1 mb-1">Idade</Text>
                                        <TextInput 
                                            keyboardType="numeric"
                                            className="bg-gray-50 p-5 rounded-[25px] border border-gray-100 font-bold" 
                                            value={selectedPet?.idade.toString()}
                                            onChangeText={(val) => setSelectedPet(prev => prev ? { ...prev, idade: parseInt(val) || 0 } : null)}
                                        />
                                    </View>
                                </View>
                                
                                <View className="flex-row gap-x-4">
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase ml-1 mb-2">Sexo</Text>
                                        <View className="flex-row gap-x-2">
                                            <TouchableOpacity 
                                                onPress={() => setSelectedPet(prev => prev ? { ...prev, sexo: "Macho" } : null)}
                                                className={`flex-1 py-3 rounded-2xl border ${selectedPet?.sexo === "Macho" ? "bg-blue-500 border-blue-500" : "bg-gray-50 border-gray-100"}`}
                                            >
                                                <Text className={`text-center font-bold text-xs ${selectedPet?.sexo === "Macho" ? "text-white" : "text-gray-400"}`}>Macho</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                onPress={() => setSelectedPet(prev => prev ? { ...prev, sexo: "Fêmea" } : null)}
                                                className={`flex-1 py-3 rounded-2xl border ${selectedPet?.sexo === "Fêmea" || selectedPet?.sexo === "Femea" ? "bg-pink-500 border-pink-500" : "bg-gray-50 border-gray-100"}`}
                                            >
                                                <Text className={`text-center font-bold text-xs ${selectedPet?.sexo === "Fêmea" || selectedPet?.sexo === "Femea" ? "text-white" : "text-gray-400"}`}>Fêmea</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase ml-1 mb-2">Porte</Text>
                                        <View className="flex-row gap-x-1">
                                            {["Pequeno", "Médio", "Grande"].map((p) => (
                                                <TouchableOpacity 
                                                    key={p}
                                                    onPress={() => setSelectedPet(prev => prev ? { ...prev, porte: p } : null)}
                                                    className={`flex-1 py-3 rounded-2xl border ${selectedPet?.porte === p || (p === "Médio" && selectedPet?.porte === "Medio") ? "bg-[#4876A8] border-[#4876A8]" : "bg-gray-50 border-gray-100"}`}
                                                >
                                                    <Text className={`text-center font-bold text-[9px] ${selectedPet?.porte === p || (p === "Médio" && selectedPet?.porte === "Medio") ? "text-white" : "text-gray-400"}`}>{p[0]}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-gray-400 text-[10px] font-black uppercase ml-1 mb-1">Descrição</Text>
                                    <TextInput 
                                        multiline
                                        numberOfLines={4}
                                        className="bg-gray-50 p-5 rounded-[25px] border border-gray-100 font-bold min-h-[100px]"
                                        value={selectedPet?.descricao}
                                        onChangeText={(val) => setSelectedPet(prev => prev ? { ...prev, descricao: val } : null)}
                                    />
                                </View>

                                <View>
                                    <Text className="text-gray-400 text-[10px] font-black uppercase ml-1 mb-1">Saúde/Observações</Text>
                                    <TextInput 
                                        className="bg-gray-50 p-5 rounded-[25px] border border-gray-100 font-bold"
                                        value={selectedPet?.saude}
                                        onChangeText={(val) => setSelectedPet(prev => prev ? { ...prev, saude: val } : null)}
                                    />
                                </View>

                                <TouchableOpacity 
                                    onPress={() => handlePickImage(selectedPet!)}
                                    className="bg-blue-50 p-5 rounded-[25px] border border-blue-100 flex-row items-center justify-center"
                                >
                                    <Feather name="camera" size={20} color="#4876A8" />
                                    <Text className="text-[#4876A8] font-black ml-2 uppercase tracking-widest text-[10px]">Trocar Foto</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
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
                                        <Text className="text-gray-900 font-black">{selectedPet?.sexo}</Text>
                                    </View>
                                    <View className="flex-1 bg-gray-50 p-4 rounded-3xl items-center">
                                        <MaterialCommunityIcons name="weight" size={20} color="#4876A8" />
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase mt-1">Porte</Text>
                                        <Text className="text-gray-900 font-black">{selectedPet?.porte}</Text>
                                    </View>
                                    <View className="flex-1 bg-gray-50 p-4 rounded-3xl items-center">
                                        <MaterialCommunityIcons name="heart-pulse" size={20} color="#4876A8" />
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase mt-1">Saúde</Text>
                                        <Text className="text-gray-900 font-black text-[10px] text-center" numberOfLines={1}>{selectedPet?.saude || "N/A"}</Text>
                                    </View>
                                </View>
                                {selectedPet?.tipoDono?.toLowerCase() === "ong" && (
                                    <View className="flex-row items-center bg-blue-50 px-4 py-3 rounded-2xl border border-[#4876A8]/20 mb-6">
                                        <MaterialCommunityIcons name="shield-check" size={18} color="#4876A8" />
                                        <View className="ml-3">
                                            <Text className="text-[#4876A8] font-black text-xs uppercase tracking-widest">ONG Parceira PetGo</Text>
                                            <Text className="text-gray-400 text-[10px] font-medium mt-0.5">Este pet é oferecido por uma organização parceira</Text>
                                        </View>
                                    </View>
                                )}
                                <Text className="text-gray-900 text-xl font-black mb-4 tracking-tight">Sobre {selectedPet?.nome}</Text>
                                <Text className="text-gray-500 leading-6 text-base mb-10 font-medium">
                                    {selectedPet?.descricao || "Este pet é muito dócil e está ansioso por um novo lar cheio de amor e carinho."}
                                </Text>
                            </>
                        )}
                        {selectedPet?.usuarioId !== currentUserId ? (
                            <TouchableOpacity 
                                onPress={() => handleSolicitarAdocao(selectedPet!.id)}
                                disabled={requesting}
                                className="bg-[#4876A8] py-6 rounded-full items-center shadow-xl shadow-blue-900/20 flex-row justify-center"
                            >
                                {requesting ? <ActivityIndicator color="white" /> : (
                                    <>
                                        <MaterialCommunityIcons name="heart" size={24} color="white" />
                                        <Text className="text-white font-black text-xl uppercase tracking-widest ml-3">Quero Adotar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : isEditing ? (
                            <View className="flex-row gap-x-4">
                                <TouchableOpacity 
                                    onPress={() => setIsEditing(false)}
                                    className="flex-1 bg-gray-100 py-6 rounded-full items-center"
                                >
                                    <Text className="text-gray-400 font-black uppercase tracking-widest">Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => { handleUpdatePetInfo(selectedPet!); setIsEditing(false); }}
                                    className="flex-[2] bg-green-500 py-6 rounded-full items-center shadow-xl shadow-green-900/20"
                                >
                                    <Text className="text-white font-black text-xl uppercase tracking-widest">Salvar</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                onPress={() => setIsEditing(true)}
                                className="bg-orange-500 py-6 rounded-full items-center shadow-xl shadow-orange-900/30 flex-row justify-center"
                            >
                                <Feather name="edit-3" size={24} color="white" />
                                <Text className="text-white font-black text-xl uppercase tracking-widest ml-3">Editar Doação</Text>
                            </TouchableOpacity>
                        )}
                        <View className="h-20" />
                    </View>
                </ScrollView>
            </View>
        </View>
      </Modal>

      {/* Donation Management Modal */}
      <Modal visible={donationModalVisible} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/60 justify-center items-center px-8">
            <View className="bg-white w-full rounded-[40px] overflow-hidden max-h-[85%]">
                <View className="p-8 border-b border-gray-50 flex-row justify-between items-center bg-orange-50/30">
                    <View>
                        <Text className="text-xl font-black text-orange-600 tracking-tighter">Gerenciar Doações</Text>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Selecione quais pets estão para adoção</Text>
                    </View>
                    <TouchableOpacity onPress={() => setDonationModalVisible(false)} className="bg-white p-2 rounded-xl border border-orange-100">
                        <Feather name="x" size={20} color="#F97316" />
                    </TouchableOpacity>
                </View>
                {loadingMeusPets ? (
                    <View className="p-20 items-center">
                        <ActivityIndicator color="#4876A8" />
                    </View>
                ) : (
                    <ScrollView className="p-6">
                        {meusPets.length === 0 ? (
                            <View className="py-10 items-center">
                                <Text className="text-gray-400 font-bold">Você não tem pets cadastrados.</Text>
                            </View>
                        ) : (
                            meusPets.map((pet) => {
                                const isAdocao = pet.status === "DisponivelAdocao";
                                return (
                                    <View key={pet.id} className="mb-6 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                        <View className="flex-row items-center justify-between mb-4">
                                            <View className="flex-row items-center flex-1">
                                                <Image
                                                    source={ pet.fotoUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400" }
                                                    style={{ width: 56, height: 56, borderRadius: 16, marginRight: 16 }}
                                                    contentFit="cover"
                                                />
                                                <View>
                                                    <Text className="text-gray-900 font-black tracking-tighter text-lg">{pet.nome}</Text>
                                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-tighter">{pet.raca}</Text>
                                                </View>
                                            </View>
                                            <View className={`px-3 py-1 rounded-full ${isAdocao ? "bg-orange-500" : (pet.status === "Adotado" ? "bg-amber-500" : "bg-blue-500")}`}>
                                                <Text className="text-white text-[8px] font-black uppercase">
                                                    {pet.status === "DisponivelAdocao" ? "Anunciado" : pet.status === "Adotado" ? "Reservado" : "Disponível"}
                                                </Text>
                                            </View>
                                        </View>
                                        {editingPetId === pet.id ? (
                                            <View className="gap-y-4 mt-2">
                                                <View className="flex-row gap-x-3">
                                                    <View className="flex-1">
                                                        <Text className="text-gray-400 text-[9px] font-black uppercase ml-1 mb-1">Nome do Pet</Text>
                                                        <TextInput
                                                            className="bg-white p-4 rounded-2xl border border-gray-100 text-sm font-bold"
                                                            defaultValue={pet.nome}
                                                            onChangeText={(val) => pet.nome = val}
                                                        />
                                                    </View>
                                                    <View className="flex-[0.5]">
                                                        <Text className="text-gray-400 text-[9px] font-black uppercase ml-1 mb-1">Idade</Text>
                                                        <TextInput
                                                            keyboardType="numeric"
                                                            className="bg-white p-4 rounded-2xl border border-gray-100 text-sm font-bold"
                                                            defaultValue={pet.idade.toString()}
                                                            onChangeText={(val) => pet.idade = parseInt(val) || 0}
                                                        />
                                                    </View>
                                                </View>

                                                <View className="flex-row gap-x-3">
                                                    <View className="flex-1">
                                                        <Text className="text-gray-400 text-[9px] font-black uppercase ml-1 mb-2">Sexo</Text>
                                                        <View className="flex-row gap-x-2">
                                                            <TouchableOpacity
                                                                onPress={() => { pet.sexo = "Macho"; setMeusPets([...meusPets]); }}
                                                                className={`flex-1 py-3 rounded-2xl border ${pet.sexo === "Macho" ? "bg-blue-500 border-blue-500" : "bg-white border-gray-100"}`}
                                                            >
                                                                <Text className={`text-center font-bold text-[10px] ${pet.sexo === "Macho" ? "text-white" : "text-gray-400"}`}>Macho</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                onPress={() => { pet.sexo = "Fêmea"; setMeusPets([...meusPets]); }}
                                                                className={`flex-1 py-3 rounded-2xl border ${pet.sexo === "Fêmea" || pet.sexo === "Femea" ? "bg-pink-500 border-pink-500" : "bg-white border-gray-100"}`}
                                                            >
                                                                <Text className={`text-center font-bold text-[10px] ${pet.sexo === "Fêmea" || pet.sexo === "Femea" ? "text-white" : "text-gray-400"}`}>Fêmea</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-gray-400 text-[9px] font-black uppercase ml-1 mb-2">Porte</Text>
                                                        <View className="flex-row gap-x-1">
                                                            {["Pequeno", "Médio", "Grande"].map((p) => (
                                                                <TouchableOpacity
                                                                    key={p}
                                                                    onPress={() => { pet.porte = p; setMeusPets([...meusPets]); }}
                                                                    className={`flex-1 py-3 rounded-2xl border ${pet.porte === p || (p === "Médio" && pet.porte === "Medio") ? "bg-[#4876A8] border-[#4876A8]" : "bg-white border-gray-100"}`}
                                                                >
                                                                    <Text className={`text-center font-bold text-[8px] ${pet.porte === p || (p === "Médio" && pet.porte === "Medio") ? "text-white" : "text-gray-400"}`}>{p[0]}</Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                    </View>
                                                </View>

                                                <View>
                                                    <Text className="text-gray-400 text-[9px] font-black uppercase ml-1 mb-1">Saúde / Observações</Text>
                                                    <TextInput
                                                        placeholder="Vacinado, castrado, dócil..."
                                                        className="bg-white p-4 rounded-2xl border border-gray-100 text-sm font-medium"
                                                        defaultValue={pet.saude}
                                                        onChangeText={(val) => pet.saude = val}
                                                    />
                                                </View>

                                                <View>
                                                    <Text className="text-gray-400 text-[9px] font-black uppercase ml-1 mb-1">Descrição do Anúncio</Text>
                                                    <TextInput
                                                        multiline
                                                        numberOfLines={3}
                                                        placeholder="Conte a história do pet..."
                                                        className="bg-white p-4 rounded-2xl border border-gray-100 text-sm font-medium min-h-[80px]"
                                                        defaultValue={pet.descricao}
                                                        onChangeText={(val) => pet.descricao = val}
                                                    />
                                                </View>

                                                <View className="flex-row gap-x-3 mt-2">
                                                    <TouchableOpacity
                                                        onPress={() => setEditingPetId(null)}
                                                        className="flex-1 bg-gray-100 py-4 rounded-3xl items-center"
                                                    >
                                                        <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Cancelar</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => { handleUpdatePetInfo(pet); setEditingPetId(null); }}
                                                        className="flex-[2] bg-[#4876A8] py-4 rounded-3xl items-center shadow-lg shadow-blue-900/20"
                                                    >
                                                        <Text className="text-white font-black text-[10px] uppercase tracking-widest">Salvar Alterações</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : (
                                            <View className="flex-row gap-x-3 mt-2">
                                                {pet.status !== "Adotado" && (
                                                    <TouchableOpacity
                                                        onPress={() => handleToggleAdocaoDirect(pet)}
                                                        className={`flex-1 py-4 rounded-3xl items-center border ${isAdocao ? "bg-red-50 border-red-100" : "bg-orange-500 border-orange-500 shadow-lg shadow-orange-900/20"}`}
                                                    >
                                                        <Text className={`font-black text-[10px] uppercase tracking-widest ${isAdocao ? "text-red-500" : "text-white"}`}>
                                                            {isAdocao ? "Remover Doação" : "Doar"}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                                <TouchableOpacity
                                                    onPress={() => setEditingPetId(pet.id)}
                                                    className="flex-1 bg-blue-50 py-4 rounded-3xl items-center border border-blue-100 flex-row justify-center"
                                                >
                                                    <Feather name="edit-3" size={14} color="#4876A8" />
                                                    <Text className="text-[#4876A8] font-black text-[10px] uppercase tracking-widest ml-2">Editar</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        )}
                        <View className="h-10" />
                    </ScrollView>
                )}
            </View>
        </View>
      </Modal>
    </View>
  );
}
