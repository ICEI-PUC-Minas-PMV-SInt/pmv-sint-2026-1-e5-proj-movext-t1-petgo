import { authService } from "@/src/services/authService";
import { usuarioService } from "@/src/services/usuarioService";
import { UsuarioResponseDto } from "@/src/types/usuario";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
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
import { maskPhone } from "../../utils/masks";

const InputField = ({ label, value, onChangeText, icon, id, keyboard = "default", foco, setFoco }: any) => (
    <View className="mb-4">
      <Text className="text-gray-500 text-sm font-semibold mb-1.5 ml-1">{label}</Text>
      <View className={`flex-row items-center px-4 py-3 rounded-2xl border-2 bg-gray-50 ${foco === id ? "border-[#4876A8] bg-white" : "border-gray-100"}`}>
        <Feather name={icon} size={20} color={foco === id ? "#4876A8" : "#D1D5DB"} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboard}
          className="flex-1 ml-3 text-gray-900 text-base font-medium"
          onFocus={() => setFoco(id)}
          onBlur={() => setFoco(null)}
        />
      </View>
    </View>
  );

export default function Perfil() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [perfil, setPerfil] = useState<UsuarioResponseDto | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [foco, setFoco] = useState<string | null>(null);
  const [fotoLocal, setFotoLocal] = useState(""); // URI local para exibição imediata
  const [fotoBase64, setFotoBase64] = useState(""); // base64 para enviar ao servidor

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      const userId = await authService.obterUserId();
      
      if (!userId) {
        router.replace("/(auth)/login");
        return;
      }

      const dados = await usuarioService.buscarPorId(userId);
      if (dados) {
        setPerfil(dados);
        setNome(dados.nome);
        setEmail(dados.email);
        setTelefone(maskPhone(dados.telefone));
        setEndereco(dados.endereco || "");
        setFotoLocal(dados.fotoUrl || ""); // Carrega foto existente
      } else {
        Alert.alert("Sessão Expirada", "Sua conta não foi encontrada. Faça login novamente.");
        await authService.logout();
        router.replace("/(auth)/login");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar seus dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfil();
  }, []);

  const handlePickFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão Necessária", "Precisamos de acesso às suas fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFotoLocal(asset.uri); // Exibe imediatamente
      if (asset.base64) {
        setFotoBase64(`data:image/jpeg;base64,${asset.base64}`);
      }
    }
  };

  const handleUpdate = async () => {
    if (!nome || !email || !telefone) {
      Alert.alert("Atenção", "Nome, E-mail e Telefone são obrigatórios.");
      return;
    }

    try {
      setUpdating(true);
      const userId = perfil?.id;
      if (!userId) return;

      const updated = await usuarioService.editarUsuario(userId, {
        nome,
        email,
        telefone: telefone.replace(/\D/g, ""),
        endereco,
        fotoUrl: fotoBase64 || perfil?.fotoUrl || undefined
      });

      setPerfil(updated);
      setFotoLocal(updated.fotoUrl || fotoLocal);
      setFotoBase64(""); // Limpa o base64 após salvar
      setTelefone(maskPhone(updated.telefone));
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível atualizar o perfil.");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Sair", 
        style: "destructive", 
        onPress: async () => {
          await authService.logout();
          router.replace("/(auth)/login");
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4A80B4" />
      </View>
    );
  }

  if (!perfil) {
      return (
          <View className="flex-1 justify-center items-center p-10 bg-white">
              <Feather name="alert-circle" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-4 text-center">Não foi possível carregar os dados do perfil.</Text>
              <TouchableOpacity onPress={carregarPerfil} className="mt-6 bg-[#4876A8] px-8 py-3 rounded-full">
                  <Text className="text-white font-bold">Tentar Novamente</Text>
              </TouchableOpacity>
          </View>
      );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-10 pb-10">
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-3xl font-black text-[#4876A8] tracking-tighter">Meu Perfil</Text>
            <TouchableOpacity onPress={handleLogout} className="bg-red-50 p-3 rounded-2xl">
              <Feather name="log-out" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View className="items-center mb-10">
            <View className="relative">
              <TouchableOpacity onPress={handlePickFoto} activeOpacity={0.85}>
                <View className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center border-4 border-white shadow-md overflow-hidden">
                  {fotoLocal ? (
                    <Image source={{ uri: fotoLocal }} className="w-full h-full" contentFit="cover" />
                  ) : (
                    <View className="items-center">
                      <Feather name="user" size={52} color="#D1D5DB" />
                    </View>
                  )}
                </View>
                <View className="absolute bottom-0 right-0 bg-[#4876A8] p-2.5 rounded-full border-4 border-white shadow-sm">
                  <Feather name="camera" size={16} color="white" />
                </View>
              </TouchableOpacity>
            </View>
            <Text className="text-xl font-bold text-gray-900 mt-4">{perfil?.nome}</Text>
            {fotoBase64 ? (
              <View className="bg-orange-50 px-4 py-1 rounded-full mt-1 border border-orange-100">
                <Text className="text-orange-500 text-xs font-bold uppercase tracking-wider">
                  Nova foto — salve para confirmar
                </Text>
              </View>
            ) : (
              <View className="bg-blue-50 px-4 py-1 rounded-full mt-1">
                <Text className="text-[#4876A8] text-xs font-bold uppercase tracking-wider">
                  {perfil?.tipo === "Adotante" ? "Usuário" : perfil?.tipo}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View className="gap-y-4 mb-8">
            <TouchableOpacity 
              onPress={() => router.push("/pets" as any)}
              activeOpacity={0.8}
              className="bg-blue-50 p-6 rounded-[32px] flex-row items-center border border-blue-100 shadow-sm"
            >
              <View className="bg-white p-3 rounded-2xl mr-4">
                <MaterialCommunityIcons name="paw" size={28} color="#4876A8" />
              </View>
              <View className="flex-1">
                <Text className="text-[#4876A8] font-black text-lg">Meus Pets</Text>
                <Text className="text-blue-400 text-xs font-semibold">Gerenciar meus amigos</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#4876A8" />
            </TouchableOpacity>
          </View>

          <View className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
            <InputField label="Nome Completo" value={nome} onChangeText={setNome} icon="user" id="nome" foco={foco} setFoco={setFoco} />
            <InputField label="E-mail" value={email} onChangeText={setEmail} icon="mail" id="email" keyboard="email-address" foco={foco} setFoco={setFoco} />
            <InputField label="Telefone" value={telefone} onChangeText={(t: string) => setTelefone(maskPhone(t))} icon="phone" id="telefone" keyboard="phone-pad" foco={foco} setFoco={setFoco} />
            <InputField label="Endereço" value={endereco} onChangeText={setEndereco} icon="map-pin" id="endereco" foco={foco} setFoco={setFoco} />

            <TouchableOpacity
              onPress={handleUpdate}
              disabled={updating}
              activeOpacity={0.85}
              className="bg-[#4876A8] py-5 rounded-full items-center shadow-md mt-6 active:scale-[0.98]"
            >
              {updating ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg uppercase tracking-widest">Salvar Alterações</Text>}
            </TouchableOpacity>
          </View>

          <View className="mt-8 px-4 items-center">
             <Text className="text-gray-300 text-xs">Membro desde {perfil ? new Date(perfil.dataCadastro).getFullYear() : "2026"}</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
