import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Especie, Pet, petService, StatusPet } from "../../services/petService";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MeusPets() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [especie, setEspecie] = useState<Especie>(Especie.Cachorro);
  const [raca, setRaca] = useState("");
  const [idade, setIdade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    carregarPets();
  }, []);

  const carregarPets = async () => {
    try {
      setIsLoading(true);
      const data = await petService.listarMeusPets();
      setPets(data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar seus pets.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (pet?: Pet) => {
    if (pet) {
      setEditingPet(pet);
      setNome(pet.nome);
      setEspecie(pet.especie);
      setRaca(pet.raca);
      setIdade(pet.idade.toString());
      setDescricao(pet.descricao || "");
    } else {
      setEditingPet(null);
      resetForm();
    }
    setModalVisible(true);
  };

  const handleSalvarPet = async () => {
    if (!nome || !raca || !idade) {
      Alert.alert("Atenção", "Preencha os campos obrigatórios.");
      return;
    }

    try {
      setIsSaving(true);
      
      const petData = {
        nome,
        especie,
        raca,
        idade: parseInt(idade),
        status: editingPet ? editingPet.status : StatusPet.DisponivelPasseio,
        descricao,
        fotoUrl: editingPet ? editingPet.fotoUrl : "", 
      };

      if (editingPet) {
        await petService.editarPet(editingPet.id, petData);
        Alert.alert("Sucesso", "Pet atualizado com sucesso!");
      } else {
        await petService.criarPet(petData);
        Alert.alert("Sucesso", "Pet cadastrado com sucesso!");
      }
      
      setModalVisible(false);
      resetForm();
      carregarPets();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar pet.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setNome("");
    setEspecie(Especie.Cachorro);
    setRaca("");
    setIdade("");
    setDescricao("");
    setEditingPet(null);
  };

  const handleExcluirPet = (id: string) => {
    Alert.alert("Excluir Pet", "Tem certeza que deseja remover este pet?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Excluir", 
        style: "destructive", 
        onPress: async () => {
          try {
            await petService.excluirPet(id);
            carregarPets();
          } catch (error) {
            Alert.alert("Erro", "Falha ao excluir pet.");
          }
        } 
      }
    ]);
  };

  const getStatusBadge = (status: StatusPet) => {
    switch (status) {
      case StatusPet.DisponivelPasseio:
        return { label: "Disponível", color: "bg-green-50 text-green-600" };
      case StatusPet.DisponivelAdocao:
        return { label: "Para Adoção", color: "bg-orange-50 text-orange-600" };
      case StatusPet.Adotado:
        return { label: "Adotado", color: "bg-blue-50 text-blue-600" };
      case StatusPet.EmPasseio:
        return { label: "Em Passeio", color: "bg-purple-50 text-purple-600" };
      default:
        return { label: "Ativo", color: "bg-gray-50 text-gray-600" };
    }
  };

  const renderPetItem = ({ item }: { item: Pet }) => {
    const badge = getStatusBadge(item.status);

    return (
      <View className="bg-white p-5 rounded-[32px] mb-4 shadow-sm border border-gray-100">
        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-2xl bg-blue-50 items-center justify-center mr-4">
              <MaterialCommunityIcons 
                name={item.especie === Especie.Cachorro ? "dog" : item.especie === Especie.Gato ? "cat" : "paw"} 
                size={32} 
                color="#4876A8" 
              />
          </View>
          <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-gray-900 font-black text-lg tracking-tighter mr-2">{item.nome}</Text>
                <View className={`${badge.color.split(' ')[0]} px-2 py-0.5 rounded-full`}>
                   <Text className={`${badge.color.split(' ')[1]} text-[8px] font-black uppercase tracking-widest`}>
                     {badge.label}
                   </Text>
                </View>
              </View>
              <Text className="text-gray-400 font-bold text-sm uppercase tracking-widest">{item.raca} • {item.idade} anos</Text>
          </View>
          <View className="flex-row gap-x-2">
              <TouchableOpacity 
                  onPress={() => handleOpenModal(item)}
                  className="p-2.5 bg-blue-50 rounded-2xl"
              >
                  <Feather name="edit-2" size={16} color="#4876A8" />
              </TouchableOpacity>
              <TouchableOpacity 
                  onPress={() => handleExcluirPet(item.id)}
                  className="p-2.5 bg-red-50 rounded-2xl"
              >
                  <Feather name="trash-2" size={16} color="#EF4444" />
              </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View 
        style={{ paddingTop: insets.top + 20 }}
        className="bg-[#4876A8] pb-12 px-8 rounded-b-[50px] shadow-lg"
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/20 mb-4"
        >
          <Feather name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-3xl font-black tracking-tighter">Meus Pets</Text>
        <Text className="text-blue-100 font-semibold opacity-80 mt-1">Gestão centralizada de pets</Text>
      </View>

      <View className="flex-1 px-8 pt-8">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4876A8" />
          </View>
        ) : pets.length > 0 ? (
          <FlatList
            data={pets}
            keyExtractor={(item) => item.id}
            renderItem={renderPetItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <MaterialCommunityIcons name="dog-side" size={80} color="#D1D5DB" />
            <Text className="text-gray-900 font-black text-lg mt-4 text-center px-6">Você ainda não tem pets.</Text>
            <Text className="text-gray-400 text-center font-semibold px-10 mt-2">Cadastre um pet para gerenciar seus passeios e status.</Text>
          </View>
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        onPress={() => handleOpenModal()}
        style={{ position: 'absolute', bottom: 40, right: 30 }}
        className="bg-[#4876A8] w-16 h-16 rounded-full items-center justify-center shadow-2xl shadow-blue-900/40 border-4 border-white active:scale-95"
      >
        <Feather name="plus" size={30} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[50px] p-8 h-[85%] shadow-2xl">
            <View className="flex-row justify-between items-center mb-10">
              <View>
                <Text className="text-2xl font-black text-[#4876A8] tracking-tighter">
                    {editingPet ? "Editar Pet" : "Novo Pet"}
                </Text>
                <Text className="text-gray-400 text-xs font-semibold">
                    {editingPet ? "Altere as informações abaixo" : "Preencha os dados abaixo"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-gray-50 p-3 rounded-2xl">
                <Feather name="x" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text className="text-gray-400 text-[10px] font-black mb-3 uppercase tracking-widest ml-4">NOME DO PET</Text>
              <TextInput
                value={nome}
                onChangeText={setNome}
                placeholder="Ex: Rex"
                className="bg-gray-50 p-5 rounded-[24px] mb-6 font-bold text-gray-900 border border-gray-100"
              />

              <Text className="text-gray-400 text-[10px] font-black mb-4 uppercase tracking-widest ml-4">ESPÉCIE</Text>
              <View className="flex-row gap-x-2 mb-6">
                {[
                  { id: Especie.Cachorro, label: "Cão", icon: "dog" },
                  { id: Especie.Gato, label: "Gato", icon: "cat" },
                  { id: Especie.Outros, label: "Outros", icon: "paw" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setEspecie(item.id)}
                    className={`flex-1 items-center py-5 rounded-[24px] border-2 ${
                      especie === item.id ? "bg-blue-50 border-[#4876A8]" : "bg-gray-50 border-gray-50"
                    }`}
                  >
                    <MaterialCommunityIcons 
                      name={item.icon as any} 
                      size={26} 
                      color={especie === item.id ? "#4876A8" : "#D1D5DB"} 
                    />
                    <Text className={`text-[10px] font-black mt-2 uppercase tracking-tighter ${especie === item.id ? "text-[#4876A8]" : "text-gray-400"}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-gray-400 text-[10px] font-black mb-3 uppercase tracking-widest ml-4">RAÇA</Text>
              <TextInput
                value={raca}
                onChangeText={setRaca}
                placeholder="Ex: Poodle, Golden..."
                className="bg-gray-50 p-5 rounded-[24px] mb-6 font-bold text-gray-900 border border-gray-100"
              />

              <Text className="text-gray-400 text-[10px] font-black mb-3 uppercase tracking-widest ml-4">IDADE (ANOS)</Text>
              <TextInput
                value={idade}
                onChangeText={setIdade}
                placeholder="Ex: 2"
                keyboardType="numeric"
                className="bg-gray-50 p-5 rounded-[24px] mb-6 font-bold text-gray-900 border border-gray-100"
              />

              <Text className="text-gray-400 text-[10px] font-black mb-3 uppercase tracking-widest ml-4">DESCRIÇÃO</Text>
              <TextInput
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Comportamento, vacinas, etc..."
                multiline
                numberOfLines={4}
                style={{ textAlignVertical: 'top' }}
                className="bg-gray-50 p-5 rounded-[24px] mb-8 font-bold text-gray-900 border border-gray-100 min-h-[120px]"
              />

              <TouchableOpacity
                onPress={handleSalvarPet}
                disabled={isSaving}
                className="bg-[#4876A8] py-6 rounded-[24px] items-center shadow-lg active:scale-95 mb-10"
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-black text-lg tracking-widest uppercase">
                    {editingPet ? "SALVAR ALTERAÇÕES" : "CADASTRAR PET"}
                  </Text>
                )}
              </TouchableOpacity>
              <View className="h-20" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
