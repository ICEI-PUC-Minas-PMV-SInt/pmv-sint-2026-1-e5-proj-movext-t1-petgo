import { authService } from "@/src/services/authService";
import { passeadorServicoService } from "@/src/services/passeadorService";
import { passeioService } from "@/src/services/passeioService";
import { PasseadorServicoResponseDto } from "@/src/types/passeador";
import { TipoPasseioResponseDto } from "@/src/types/passeio";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { maskCurrency } from "../utils/masks";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Servicos() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [tiposGlobais, setTiposGlobais] = useState<TipoPasseioResponseDto[]>(
    [],
  );
  const [meusServicos, setMeusServicos] = useState<
    PasseadorServicoResponseDto[]
  >([]);

  // Modals
  const [modalAddVisible, setModalAddVisible] = useState(false);
  const [modalPrecoVisible, setModalPrecoVisible] = useState(false);
  const [modalCriarTipoVisible, setModalCriarTipoVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [selectedTipo, setSelectedTipo] =
    useState<TipoPasseioResponseDto | null>(null);
  const [preco, setPreco] = useState("");

  // Form State — criar novo tipo
  const [novoNome, setNovoNome] = useState("");
  const [novaDuracao, setNovaDuracao] = useState("");
  const [novoPreco, setNovoPreco] = useState("");

  const carregarDados = async () => {
    try {
      setLoading(true);
      const userId = await authService.obterUserId();
      if (!userId) return;

      const [globais, meus] = await Promise.all([
        passeioService.listarTiposPasseios(userId),
        passeadorServicoService.listarPorPasseador(userId),
      ]);

      setTiposGlobais(globais);
      setMeusServicos(meus);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleOpenAdd = () => {
    setModalAddVisible(true);
  };

  const handleCriarTipo = async () => {
    if (!novoNome.trim() || !novaDuracao || !novoPreco) {
      Alert.alert("Atenção", "Preencha nome, duração e preço.");
      return;
    }

    const duracaoNum = parseInt(novaDuracao, 10);
    const precoLimpo = novoPreco.replace(/\./g, "").replace(",", ".");
    const precoNum = parseFloat(precoLimpo);

    if (isNaN(duracaoNum) || duracaoNum <= 0) {
      Alert.alert("Atenção", "Informe uma duração válida em minutos.");
      return;
    }

    if (isNaN(precoNum) || precoNum <= 0) {
      Alert.alert("Atenção", "Informe um preço válido.");
      return;
    }

    try {
      setSaving(true);
      const novoTipo = await passeioService.criarTipoPasseio({
        nome: novoNome.trim(),
        duracaoMinutos: duracaoNum,
        precoBase: precoNum,
      });

      setNovoNome("");
      setNovaDuracao("");
      setNovoPreco("");
      setModalCriarTipoVisible(false);

      // Abre modal de preço com o novo tipo já selecionado
      setSelectedTipo(novoTipo);
      setPreco(maskCurrency(Math.round(precoNum * 100).toString()));
      setModalPrecoVisible(true);

      await carregarDados();
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível criar o tipo de passeio.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectTemplate = (tipo: TipoPasseioResponseDto) => {
    setSelectedTipo(tipo);
    setPreco("");
    setModalAddVisible(false);
    setModalPrecoVisible(true);
  };

  const handleEditPreco = (servico: PasseadorServicoResponseDto) => {
    const tipo = tiposGlobais.find((t) => t.id === servico.tipoPasseioId);
    if (tipo) {
      setSelectedTipo(tipo);
      // Formata o preço vindo do banco para a máscara (ex: 50 -> "50,00")
      setPreco(maskCurrency(Math.round(servico.precoCustomizado * 100).toString()));
      setModalPrecoVisible(true);
    }
  };

  const handleSave = async () => {
    if (!selectedTipo || !preco) {
      Alert.alert("Atenção", "Informe o preço para o serviço.");
      return;
    }

    if (!preco || preco === "0,00" || preco === "0") {
      Alert.alert("Atenção", "O preço deve ser maior que zero.");
      return;
    }

    try {
      setSaving(true);
      
      const precoLimpo = preco.replace(/\./g, "").replace(",", ".");
      const precoFloat = parseFloat(precoLimpo);

      if (isNaN(precoFloat)) {
        throw new Error("O preço informado é inválido. Use apenas números.");
      }

      await passeadorServicoService.salvarPreco({
        tipoPasseioId: selectedTipo.id,
        precoCustomizado: precoFloat,
      });

      setModalPrecoVisible(false);
      carregarDados();
      Alert.alert("Sucesso", "Serviço configurado com sucesso!");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível salvar o preço do serviço.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (id: string) => {
    Alert.alert("Remover", "Deseja parar de oferecer este tipo de passeio?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await passeadorServicoService.excluirPreco(id);
            carregarDados();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível remover.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: PasseadorServicoResponseDto }) => (
    <View className="bg-white p-6 rounded-[32px] border-2 border-blue-50 shadow-sm mb-4">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 pr-4">
          <Text className="text-xl font-black tracking-tighter text-gray-900">
            {item.nomeTipoPasseio}
          </Text>
          <View className="flex-row items-center mt-1">
            <Feather name="clock" size={14} color="#4876A8" />
            <Text className="font-bold text-xs ml-1 uppercase tracking-widest text-[#4876A8]">
              {item.duracaoMinutos} min
            </Text>
          </View>
        </View>
        <Text className="text-[#4876A8] font-black text-2xl tracking-tighter">
          R$ {item.precoCustomizado.toFixed(2)}
        </Text>
      </View>

      <View className="flex-row gap-x-3 border-t border-gray-50 pt-4">
        <TouchableOpacity
          onPress={() => handleEditPreco(item)}
          className="flex-1 py-3 rounded-2xl items-center flex-row justify-center bg-blue-50"
        >
          <Feather name="edit-2" size={14} color="#4876A8" />
          <Text className="font-bold text-xs ml-2 uppercase tracking-widest text-[#4876A8]">
            Alterar Preço
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleRemove(item.id)}
          className="bg-red-50 px-4 rounded-2xl items-center justify-center"
        >
          <Feather name="trash-2" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View
        style={{ paddingTop: insets.top + 20 }}
        className="px-8 pb-6 flex-row justify-between items-center"
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="#4876A8" />
          </TouchableOpacity>
          <Text className="text-3xl font-black text-[#4876A8] tracking-tighter">
            Meus Serviços
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleOpenAdd}
          className="bg-[#4876A8] w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-blue-900/20"
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4876A8" />
        </View>
      ) : (
        <FlatList
          data={meusServicos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 40 }}
          ListHeaderComponent={
            <Text className="text-gray-400 font-semibold mb-6">
              Esta é a lista de serviços que você oferece. Toque no + para
              adicionar novos tipos.
            </Text>
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20 bg-gray-50 rounded-[40px] border border-gray-100 border-dashed">
              <MaterialCommunityIcons
                name="dog-service"
                size={48}
                color="#D1D5DB"
              />
              <Text className="text-gray-400 font-bold mt-4 text-center px-10">
                Sua lista está vazia. Adicione um serviço para começar a receber
                agendamentos!
              </Text>
            </View>
          }
        />
      )}

      {/* Modal 1: Escolher Tipo (Template) */}
      <Modal visible={modalAddVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[50px] p-8 h-[70%]">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-black text-[#4876A8] tracking-tighter">
                Escolha um Serviço
              </Text>
              <TouchableOpacity
                onPress={() => setModalAddVisible(false)}
                className="bg-gray-50 p-3 rounded-2xl"
              >
                <Feather name="x" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {tiposGlobais
                .filter(
                  (g) => !meusServicos.some((m) => m.tipoPasseioId === g.id),
                )
                .map((tipo) => (
                  <TouchableOpacity
                    key={tipo.id}
                    onPress={() => handleSelectTemplate(tipo)}
                    className="bg-gray-50 p-6 rounded-3xl mb-3 flex-row justify-between items-center border border-gray-100"
                  >
                    <View>
                      <Text className="text-gray-900 font-black text-lg">
                        {tipo.nome}
                      </Text>
                      <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                        {tipo.duracaoMinutos} min
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#D1D5DB" />
                  </TouchableOpacity>
                ))}

              <TouchableOpacity
                onPress={() => {
                  setModalAddVisible(false);
                  setModalCriarTipoVisible(true);
                }}
                className="mt-2 py-5 rounded-3xl border-2 border-dashed border-orange-200 items-center flex-row justify-center gap-x-2"
              >
                <Feather name="plus-circle" size={18} color="#F97316" />
                <Text className="text-orange-500 font-black text-sm uppercase tracking-widest">
                  Criar tipo personalizado
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Criar Tipo Personalizado */}
      <Modal visible={modalCriarTipoVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[50px] p-8 pb-12">
              <View className="flex-row justify-between items-center mb-8">
                <View>
                  <Text className="text-2xl font-black text-orange-500 tracking-tighter">
                    Novo Tipo de Passeio
                  </Text>
                  <Text className="text-gray-400 font-bold text-sm mt-1">
                    Crie um serviço exclusivo seu
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalCriarTipoVisible(false)}
                  className="bg-gray-50 p-3 rounded-2xl"
                >
                  <Feather name="x" size={20} color="#D1D5DB" />
                </TouchableOpacity>
              </View>

              <View className="gap-y-4">
                <View>
                  <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-1 mb-2">
                    Nome do serviço
                  </Text>
                  <TextInput
                    value={novoNome}
                    onChangeText={setNovoNome}
                    placeholder="Ex: Passeio na praia, Trilha com pets..."
                    placeholderTextColor="#D1D5DB"
                    className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 text-gray-900 font-medium"
                  />
                </View>

                <View className="flex-row gap-x-4">
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-1 mb-2">
                      Duração (min)
                    </Text>
                    <TextInput
                      value={novaDuracao}
                      onChangeText={setNovaDuracao}
                      placeholder="60"
                      placeholderTextColor="#D1D5DB"
                      keyboardType="numeric"
                      className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 text-gray-900 font-medium"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-1 mb-2">
                      Preço (R$)
                    </Text>
                    <TextInput
                      value={novoPreco}
                      onChangeText={(t) => setNovoPreco(maskCurrency(t))}
                      placeholder="0,00"
                      placeholderTextColor="#D1D5DB"
                      keyboardType="numeric"
                      className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 text-gray-900 font-medium"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleCriarTipo}
                  disabled={saving}
                  className="bg-orange-500 py-5 rounded-full items-center shadow-lg shadow-orange-900/20 mt-2"
                >
                  {saving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-black text-lg uppercase tracking-widest">
                      Criar Tipo
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal 3: Definir Preço */}
      <Modal
        visible={modalPrecoVisible}
        animationType="slide"
        transparent={true}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[50px] p-8 pb-12">
              <View className="flex-row justify-between items-center mb-10">
                <View>
                  <Text className="text-2xl font-black text-[#4876A8] tracking-tighter">
                    Definir Preço
                  </Text>
                  <Text className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">
                    {selectedTipo?.nome}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalPrecoVisible(false)}
                  className="bg-gray-50 p-3 rounded-2xl"
                >
                  <Feather name="x" size={20} color="#D1D5DB" />
                </TouchableOpacity>
              </View>

              <View className="gap-y-8">
                <View>
                  <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest ml-1 mb-2">
                    Quanto você quer cobrar?
                  </Text>
                  <View className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 flex-row items-center">
                    <Text className="text-2xl font-black text-gray-300 mr-2">
                      R$
                    </Text>
                    <TextInput
                      value={preco}
                      onChangeText={(t) => setPreco(maskCurrency(t))}
                      placeholder="0,00"
                      keyboardType="numeric"
                      className="flex-1 ml-3 text-gray-900 text-xl font-black"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSave}
                  disabled={saving}
                  className="bg-[#4876A8] py-5 rounded-full items-center shadow-lg shadow-blue-900/20"
                >
                  {saving ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-black text-lg uppercase tracking-widest">
                      Confirmar Serviço
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
