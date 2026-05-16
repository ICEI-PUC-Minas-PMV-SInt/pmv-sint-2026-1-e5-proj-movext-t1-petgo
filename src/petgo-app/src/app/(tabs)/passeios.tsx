import { authService } from "@/src/services/authService";
import { passeioService } from "@/src/services/passeioService";
import { PasseioResponseDto } from "@/src/types/passeio";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  ScrollView
} from "react-native";

export default function Passeios() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [passeios, setPasseios] = useState<PasseioResponseDto[]>([]);
  const [selectedPasseio, setSelectedPasseio] = useState<PasseioResponseDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const carregarDados = async () => {
    try {
      const type = await authService.obterUserType();
      setUserType(type);

      let data: PasseioResponseDto[] = [];
      
      if (type === "Passeador") {
        data = await passeioService.listarMinhaAgenda();
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
  }, []);

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

  const renderActionButtons = (item: PasseioResponseDto) => {
    if (userType !== "Passeador") return null;

    switch (item.status) {
      case "Pendente":
        return (
          <View className="flex-row gap-x-3 mt-6">
            <TouchableOpacity 
              onPress={() => handleUpdateStatus(item.id, 1)} // Agendado
              disabled={actionLoading}
              className="flex-1 bg-green-500 py-4 rounded-2xl items-center shadow-sm"
            >
              <Text className="text-white font-black text-xs uppercase tracking-widest">ACEITAR</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleUpdateStatus(item.id, 4)} // Cancelado
              disabled={actionLoading}
              className="flex-1 bg-red-100 py-4 rounded-2xl items-center"
            >
              <Text className="text-red-600 font-black text-xs uppercase tracking-widest">RECUSAR</Text>
            </TouchableOpacity>
          </View>
        );
      case "Agendado":
        return (
          <TouchableOpacity 
            onPress={() => handleUpdateStatus(item.id, 2)} // EmAndamento
            disabled={actionLoading}
            className="w-full bg-blue-500 py-5 rounded-2xl items-center mt-6 shadow-md"
          >
            <Text className="text-white font-black text-xs uppercase tracking-widest">COMEÇAR PASSEIO</Text>
          </TouchableOpacity>
        );
      case "EmAndamento":
        return (
          <TouchableOpacity 
            onPress={() => handleUpdateStatus(item.id, 3)} // Concluido
            disabled={actionLoading}
            className="w-full bg-green-600 py-5 rounded-2xl items-center mt-6 shadow-md"
          >
            <Text className="text-white font-black text-xs uppercase tracking-widest">CONCLUIR PASSEIO</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderItem = ({ item }: { item: PasseioResponseDto }) => {
    const dataObj = new Date(item.dataHoraPasseio);
    const isValidDate = !isNaN(dataObj.getTime());

    return (
      <View className="bg-white mb-4 p-5 rounded-[32px] shadow-sm border border-gray-100">
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
          <TouchableOpacity 
            onPress={() => setSelectedPasseio(item)}
            className="bg-gray-100 px-6 py-2.5 rounded-full"
          >
            <Text className="text-gray-600 font-black text-[10px] tracking-widest">DETALHES</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white pt-6">
      <View className="px-8 mb-8">
        <Text className="text-3xl font-black text-[#4876A8] tracking-tighter">
            {userType === "Passeador" ? "Minha Agenda" : "Meus Agendamentos"}
        </Text>
        <Text className="text-gray-400 font-semibold text-sm mt-1">
            {userType === "Passeador" 
                ? "Lista de passeios que você deve realizar." 
                : "Acompanhe os passeios dos seus melhores amigos."}
        </Text>
      </View>

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
            <View className="items-center justify-center py-20 bg-white mx-8 rounded-[40px] shadow-sm border border-gray-100">
              <View className="bg-blue-50 p-8 rounded-full mb-6">
                <MaterialCommunityIcons name="calendar-blank" size={48} color="#4876A8" />
              </View>
              <Text className="text-gray-900 font-black text-xl text-center px-6">Nenhum passeio encontrado</Text>
              <Text className="text-gray-400 font-semibold text-center px-10 mt-3">
                {userType === "Passeador" 
                    ? "Sua agenda está livre por enquanto." 
                    : "Você ainda não agendou nenhum passeio."}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal de Detalhes */}
      <Modal visible={!!selectedPasseio} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[50px] p-8 min-h-[65%]">
                <View className="flex-row justify-between items-center mb-10">
                    <Text className="text-2xl font-black text-[#4876A8] tracking-tighter">Detalhes do Passeio</Text>
                    <TouchableOpacity onPress={() => setSelectedPasseio(null)} className="bg-gray-50 p-3 rounded-2xl">
                        <Feather name="x" size={20} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>

                {selectedPasseio && (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="bg-blue-50 p-6 rounded-[32px] mb-6 flex-row items-center border border-blue-100">
                            <View className="bg-white p-4 rounded-2xl">
                                <MaterialCommunityIcons name="dog" size={32} color="#4876A8" />
                            </View>
                            <View className="ml-5">
                                <Text className="text-blue-900 font-black text-xl tracking-tighter">{selectedPasseio.nomePet}</Text>
                                <Text className="text-[#4876A8] font-bold text-xs uppercase tracking-widest">{selectedPasseio.nomeTipoPasseio}</Text>
                            </View>
                        </View>

                        <View className="gap-y-3 mb-8">
                            <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
                                <Feather name="user" size={18} color="#9CA3AF" />
                                <Text className="ml-3 text-gray-500 font-bold uppercase text-[9px] tracking-widest flex-1">
                                  {userType === "Passeador" ? "Tutor" : "Passeador"}
                                </Text>
                                <Text className="text-gray-900 font-black text-sm">
                                  {userType === "Passeador" ? selectedPasseio.nomePasseador : selectedPasseio.nomePasseador}
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

                        {/* Botões de Ação para o Passeador */}
                        {renderActionButtons(selectedPasseio)}
                        <View className="h-10" />
                    </ScrollView>
                )}
            </View>
        </View>
      </Modal>
    </View>
  );
}
