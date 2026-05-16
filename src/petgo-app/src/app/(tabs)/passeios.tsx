import { authService } from "@/src/services/authService";
import { passeioService } from "@/src/services/passeioService";
import { PasseioResponseDto } from "@/src/types/passeio";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Passeios() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [passeios, setPasseios] = useState<PasseioResponseDto[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"trabalho" | "pessoal">("trabalho");
  const [selectedPasseio, setSelectedPasseio] = useState<PasseioResponseDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const carregarDados = async () => {
    try {
      const type = await authService.obterUserType();
      setUserType(type);

      let data: PasseioResponseDto[] = [];
      
      if (type === "Passeador") {
        if (activeSubTab === "trabalho") {
          data = await passeioService.listarMinhaAgenda();
        } else {
          data = await passeioService.listarMeusAgendamentos();
        }
      } else {
        data = await passeioService.listarMeusAgendamentos();
      }
      
      setPasseios(data);
    } catch (error) {
      console.error("Erro ao carregar passeios:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [activeSubTab]);

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const handleUpdateStatus = async (id: string, novoStatus: number) => {
    try {
      setActionLoading(true);
      await passeioService.atualizarStatus(id, novoStatus);
      setSelectedPasseio(null);
      carregarDados();
      Alert.alert("Sucesso", "Status do passeio atualizado!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Botões para o PASSEADOR: Aceitar, Recusar, Iniciar, Finalizar
  const renderPasseadorActions = (item: PasseioResponseDto) => {
    switch (item.status) {
      case "Pendente":
        return (
          <View className="flex-row gap-x-3">
            <TouchableOpacity
              onPress={() => handleUpdateStatus(item.id, 1)}
              disabled={actionLoading}
              className="flex-1 bg-green-500 py-5 rounded-2xl items-center shadow-md shadow-green-900/20"
            >
              <Text className="text-white font-black text-xs uppercase tracking-widest">✓  Aceitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleUpdateStatus(item.id, 4)}
              disabled={actionLoading}
              className="flex-1 bg-red-50 border-2 border-red-100 py-5 rounded-2xl items-center"
            >
              <Text className="text-red-500 font-black text-xs uppercase tracking-widest">✕  Recusar</Text>
            </TouchableOpacity>
          </View>
        );
      case "Agendado":
        return (
          <TouchableOpacity
            onPress={() => handleUpdateStatus(item.id, 2)}
            disabled={actionLoading}
            className="w-full bg-[#4876A8] py-5 rounded-2xl items-center shadow-lg shadow-blue-900/20"
          >
            <Text className="text-white font-black text-xs uppercase tracking-widest">▶  Iniciar Passeio</Text>
          </TouchableOpacity>
        );
      case "EmAndamento":
        return (
          <TouchableOpacity
            onPress={() => handleUpdateStatus(item.id, 3)}
            disabled={actionLoading}
            className="w-full bg-green-600 py-5 rounded-2xl items-center shadow-lg shadow-green-900/20"
          >
            <Text className="text-white font-black text-xs uppercase tracking-widest">✓  Finalizar Passeio</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  // Botões para o TUTOR: apenas acompanhamento e cancelamento
  const renderTutorActions = (item: PasseioResponseDto) => {
    if (item.status === "Pendente" || item.status === "Agendado") {
      return (
        <TouchableOpacity
          onPress={() => handleUpdateStatus(item.id, 4)}
          disabled={actionLoading}
          className="w-full bg-red-50 border-2 border-red-100 py-5 rounded-2xl items-center"
        >
          <Text className="text-red-500 font-black text-xs uppercase tracking-widest">Cancelar Pedido</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderItem = ({ item }: { item: PasseioResponseDto }) => {
    const dataObj = new Date(item.dataHoraPasseio);
    const isValidDate = !isNaN(dataObj.getTime());

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => setSelectedPasseio(item)}
        className="bg-white mb-4 p-5 rounded-[32px] shadow-sm border border-gray-100"
      >
        <View className="flex-row justify-between items-start mb-4">
          <View className="bg-blue-50 px-4 py-1.5 rounded-full">
            <Text className="text-[#4876A8] text-[10px] font-black uppercase tracking-widest">
              {item.nomeTipoPasseio || "Passeio Comum"}
            </Text>
          </View>
          <View className={`px-4 py-1.5 rounded-full ${
            item.status === 'Concluido' ? 'bg-green-50' : 
            item.status === 'EmAndamento' ? 'bg-blue-50' :
            item.status === 'Cancelado' ? 'bg-red-50' : 'bg-orange-50'
          }`}>
            <Text className={`text-[10px] font-black uppercase tracking-widest ${
              item.status === 'Concluido' ? 'text-green-600' : 
              item.status === 'EmAndamento' ? 'text-blue-600' :
              item.status === 'Cancelado' ? 'text-red-600' : 'text-orange-600'
            }`}>
              {item.status}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mb-5">
          <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <Feather name="calendar" size={24} color="#4876A8" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-gray-900 font-black text-lg tracking-tighter">
              {isValidDate 
                ? dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }) 
                : "Data Indisponível"}
            </Text>
            <Text className="text-gray-500 font-bold text-sm">
              {isValidDate 
                ? `${dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` 
                : "Horário Indisponível"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between border-t border-gray-50 pt-4">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="dog" size={20} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs font-bold ml-2 uppercase tracking-widest">
                Pet: <Text className="text-gray-600">{item.nomePet}</Text>
            </Text>
          </View>
          <View className="bg-gray-100 px-6 py-2.5 rounded-full">
            <Text className="text-gray-600 font-black text-[10px] tracking-widest">DETALHES</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white pt-6">
      <View className="px-8 mb-8 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-3xl font-black text-[#4876A8] tracking-tighter">
              {userType === "Passeador" ? "Minha Agenda" : "Meus Agendamentos"}
          </Text>
          <Text className="text-gray-400 font-semibold text-sm mt-1">
              {userType === "Passeador"
                  ? "Lista de passeios que você deve realizar." 
                  : "Acompanhe os passeios dos seus melhores amigos."}
          </Text>
        </View>
        
        {userType === "Passeador" && (
            <TouchableOpacity 
                onPress={() => router.push("/servicos" as any)}
                className="bg-orange-500 px-4 h-12 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-900/20 ml-4 gap-x-2"
            >
                <Feather name="settings" size={16} color="white" />
                <Text className="text-white font-black text-[10px] uppercase tracking-widest">Meus Serviços</Text>
            </TouchableOpacity>
        )}
      </View>

      {userType === "Passeador" && (
        <View className="flex-row px-8 mb-6 gap-x-2">
            <TouchableOpacity 
                onPress={() => setActiveSubTab("trabalho")}
                className={`px-6 py-3 rounded-2xl flex-1 flex-row items-center justify-center border-2 ${activeSubTab === "trabalho" ? "bg-[#4876A8] border-[#4876A8]" : "bg-gray-50 border-gray-100"}`}
            >
                <MaterialCommunityIcons name="calendar-check" size={18} color={activeSubTab === "trabalho" ? "white" : "#9CA3AF"} />
                <Text className={`font-black ml-2 uppercase tracking-widest text-[10px] ${activeSubTab === "trabalho" ? "text-white" : "text-gray-400"}`}>Agenda</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => setActiveSubTab("pessoal")}
                className={`px-6 py-3 rounded-2xl flex-1 flex-row items-center justify-center border-2 ${activeSubTab === "pessoal" ? "bg-[#4876A8] border-[#4876A8]" : "bg-gray-50 border-gray-100"}`}
            >
                <MaterialCommunityIcons name="paw" size={18} color={activeSubTab === "pessoal" ? "white" : "#9CA3AF"} />
                <Text className={`font-black ml-2 uppercase tracking-widest text-[10px] ${activeSubTab === "pessoal" ? "text-white" : "text-gray-400"}`}>Meus Pedidos</Text>
            </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4876A8" />
        </View>
      ) : (
        <FlatList
          data={passeios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 60 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4876A8"]} />
          }
          ListEmptyComponent={
            userType === "Passeador" && activeSubTab === "trabalho" ? (
              // Empty state especial para o Passeador sem passeios na agenda
              <View className="items-center justify-center py-10 mx-2">
                <View className="bg-orange-50 p-8 rounded-full mb-6 border-2 border-orange-100">
                  <MaterialCommunityIcons name="dog-service" size={48} color="#F97316" />
                </View>
                <Text className="text-gray-900 font-black text-2xl text-center tracking-tighter mb-2">
                  Sua agenda está vazia
                </Text>
                <Text className="text-gray-400 font-semibold text-center px-8 mb-8 leading-5">
                  Para receber agendamentos, você precisa primeiro cadastrar os tipos de passeio que oferece.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/servicos" as any)}
                  className="bg-orange-500 px-8 py-5 rounded-2xl flex-row items-center gap-x-3 shadow-lg shadow-orange-900/20"
                >
                  <Feather name="settings" size={18} color="white" />
                  <Text className="text-white font-black uppercase tracking-widest text-sm">Configurar Meus Serviços</Text>
                </TouchableOpacity>
                <Text className="text-gray-300 font-bold text-[10px] uppercase tracking-widest mt-6">
                  Após configurar, clientes poderão te encontrar
                </Text>
              </View>
            ) : (
              // Empty state padrão para tutores/outros
              <View className="items-center justify-center py-20 bg-white mx-8 rounded-[40px] shadow-sm border border-gray-100">
                <View className="bg-blue-50 p-8 rounded-full mb-6">
                  <MaterialCommunityIcons name="calendar-blank" size={48} color="#4876A8" />
                </View>
                <Text className="text-gray-900 font-black text-xl text-center px-6">Nenhum passeio encontrado</Text>
                <Text className="text-gray-400 font-semibold text-center px-10 mt-3">
                  {userType === "Passeador"
                      ? "Sua agenda de pedidos está vazia." 
                      : "Você ainda não agendou nenhum passeio."}
                </Text>
              </View>
            )
          }
        />
      )}

      <Modal visible={!!selectedPasseio} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[50px] h-[92%] overflow-hidden">
                {/* Header Fixo */}
                <View className="px-8 pt-8 pb-4 flex-row justify-between items-center border-b border-gray-50">
                    <View>
                        <Text className="text-2xl font-black text-[#4876A8] tracking-tighter">Detalhes</Text>
                        <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Informações do Passeio</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedPasseio(null)} className="bg-gray-50 p-4 rounded-2xl">
                        <Feather name="x" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {selectedPasseio && (
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 24, paddingBottom: 40 }}
                    >
                        {/* Card do Topo: Mostra a OUTRA pessoa do passeio */}
                        {(userType === "Passeador" && activeSubTab === "trabalho") ? (
                            // Passeador vê o Tutor no topo
                            <View className="bg-blue-50 p-6 rounded-[32px] mb-6 flex-row items-center border border-blue-100">
                                <View className="w-20 h-20 bg-white rounded-2xl items-center justify-center border-2 border-white shadow-sm">
                                    <MaterialCommunityIcons name="account" size={36} color="#4876A8" />
                                </View>
                                <View className="ml-5 flex-1">
                                    <Text className="text-gray-400 font-black text-[9px] uppercase tracking-widest mb-0.5">Dono do Pet</Text>
                                    <Text className="text-blue-900 font-black text-xl tracking-tighter">{selectedPasseio.nomeTutor}</Text>
                                    <View className="flex-row items-center mt-2 gap-x-3">
                                        <View className="flex-row items-center">
                                            <Feather name="phone" size={11} color="#16A34A" />
                                            <Text className="text-gray-600 font-bold text-xs ml-1">{selectedPasseio.telefoneTutor || "—"}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center mt-1">
                                        <Feather name="mail" size={11} color="#4876A8" />
                                        <Text className="text-gray-600 font-bold text-xs ml-1">{selectedPasseio.emailTutor || "—"}</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            // Tutor/outros veem o Passeador no topo
                            <View className="bg-orange-50 p-6 rounded-[32px] mb-6 flex-row items-center border border-orange-100">
                                <View className="w-20 h-20 bg-white rounded-2xl overflow-hidden items-center justify-center border-2 border-white shadow-sm">
                                    {selectedPasseio.fotoPasseadorUrl ? (
                                        <Image source={{ uri: selectedPasseio.fotoPasseadorUrl }} className="w-full h-full" />
                                    ) : (
                                        <MaterialCommunityIcons name="account" size={36} color="#F97316" />
                                    )}
                                </View>
                                <View className="ml-5 flex-1">
                                    <Text className="text-orange-400 font-black text-[9px] uppercase tracking-widest mb-0.5">Passeador</Text>
                                    <Text className="text-gray-900 font-black text-xl tracking-tighter">{selectedPasseio.nomePasseador}</Text>
                                    <View className="flex-row items-center mt-2">
                                        <Feather name="phone" size={11} color="#16A34A" />
                                        <Text className="text-gray-600 font-bold text-xs ml-1">{selectedPasseio.telefonePasseador || "—"}</Text>
                                    </View>
                                    <View className="flex-row items-center mt-1">
                                        <Feather name="mail" size={11} color="#4876A8" />
                                        <Text className="text-gray-600 font-bold text-xs ml-1">{selectedPasseio.emailPasseador || "—"}</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Infos do Pet (abaixo do card de pessoa) */}
                        <View className="bg-gray-50 p-5 rounded-[28px] flex-row items-center mb-6">
                            <View className="w-14 h-14 bg-white rounded-2xl overflow-hidden items-center justify-center border border-gray-100">
                                {selectedPasseio.fotoPetUrl ? (
                                    <Image source={{ uri: selectedPasseio.fotoPetUrl }} className="w-full h-full" />
                                ) : (
                                    <MaterialCommunityIcons name="dog" size={28} color="#9CA3AF" />
                                )}
                            </View>
                            <View className="ml-4">
                                <Text className="text-gray-400 font-black text-[9px] uppercase tracking-widest">Pet</Text>
                                <Text className="text-gray-900 font-black text-base tracking-tight">{selectedPasseio.nomePet}</Text>
                                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{selectedPasseio.nomeTipoPasseio}</Text>
                            </View>
                        </View>

                        <View className="gap-y-3 mb-6">
                            <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
                                <Feather name="user" size={18} color="#9CA3AF" />
                                <Text className="ml-3 text-gray-500 font-bold uppercase text-[9px] tracking-widest flex-1">
                                  {(userType === "Passeador" || userType === "Ong") ? "Tutor" : "Passeador"}
                                </Text>
                                <Text className="text-gray-900 font-black text-sm">
                                  {(userType === "Passeador" || userType === "Ong") ? selectedPasseio.nomeTutor : selectedPasseio.nomePasseador}
                                </Text>
                            </View>

                            <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
                                <Feather name="calendar" size={18} color="#9CA3AF" />
                                <Text className="ml-3 text-gray-500 font-bold uppercase text-[9px] tracking-widest flex-1">Data</Text>
                                <Text className="text-gray-900 font-black text-sm">
                                    {new Date(selectedPasseio.dataHoraPasseio).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </Text>
                            </View>

                            <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
                                <Feather name="clock" size={18} color="#9CA3AF" />
                                <Text className="ml-3 text-gray-500 font-bold uppercase text-[9px] tracking-widest flex-1">Horário</Text>
                                <Text className="text-gray-900 font-black text-sm">
                                    {new Date(selectedPasseio.dataHoraPasseio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>

                            <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
                                <Feather name="info" size={18} color="#9CA3AF" />
                                <Text className="ml-3 text-gray-500 font-bold uppercase text-[9px] tracking-widest flex-1">Status</Text>
                                <View className={`px-3 py-1 rounded-full ${
                                  selectedPasseio.status === 'Concluido' ? 'bg-green-100' : 
                                  selectedPasseio.status === 'EmAndamento' ? 'bg-blue-100' :
                                  selectedPasseio.status === 'Cancelado' ? 'bg-red-100' : 'bg-orange-100'
                                }`}>
                                    <Text className={`font-black text-[9px] uppercase tracking-tighter ${
                                      selectedPasseio.status === 'Concluido' ? 'text-green-700' : 
                                      selectedPasseio.status === 'EmAndamento' ? 'text-blue-700' :
                                      selectedPasseio.status === 'Cancelado' ? 'text-red-700' : 'text-orange-700'
                                    }`}>
                                        {selectedPasseio.status}
                                    </Text>
                                </View>
                            </View>

                            <View className="bg-gray-50 p-6 rounded-3xl mt-2">
                                <Text className="text-gray-500 font-bold uppercase text-[9px] tracking-widest mb-3">Informações Adicionais</Text>
                                <Text className="text-gray-700 font-semibold leading-5 text-sm">
                                    {selectedPasseio.descricaoPasseio || "Nenhuma observação informada para este passeio."}
                                </Text>
                            </View>
                        </View>

                        <View className="bg-[#4876A8] p-6 rounded-[32px] flex-row justify-between items-center mb-6 shadow-lg shadow-blue-900/20">
                            <Text className="text-white font-black uppercase tracking-widest text-[10px]">Total do Serviço</Text>
                            <Text className="text-white font-black text-2xl tracking-tighter">R$ {selectedPasseio.valorTotal.toFixed(2)}</Text>
                        </View>

                        {/* Ações separadas por perfil */}
                        {(userType === "Passeador" && activeSubTab === "trabalho")
                            ? renderPasseadorActions(selectedPasseio)
                            : renderTutorActions(selectedPasseio)
                        }

                        {/* Botão de Sair Secundário */}
                        <TouchableOpacity 
                            onPress={() => setSelectedPasseio(null)}
                            className="mt-4 py-6 items-center"
                        >
                            <Text className="text-gray-400 font-black uppercase tracking-[4px] text-[10px]">Voltar para Agenda</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </View>
        </View>
      </Modal>
    </View>
  );
}
