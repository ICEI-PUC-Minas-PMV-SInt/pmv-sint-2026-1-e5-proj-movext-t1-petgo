import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usuarioService } from "../../services/usuarioService";
import { maskCNPJ, maskCPF, maskPhone } from "../../utils/masks";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PetGoLogo from "../../../assets/images/petGo-logo.png";

const USER_TYPES = [
  { id: 0, label: "Usuário", icon: "account", provider: "MaterialCommunityIcons" },
  { id: 1, label: "ONG", icon: "home-heart", provider: "MaterialCommunityIcons" },
  { id: 2, label: "Passeador", icon: "dog-service", provider: "MaterialCommunityIcons" },
];

const InputField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  icon, 
  id, 
  secure = false, 
  ocultarSenha,
  setOcultarSenha,
  keyboard = "default",
  autoCapitalize = "words" as any,
  foco,
  setFoco
}: any) => (
  <View className="mb-5">
    <Text className="text-gray-500 text-[10px] font-black mb-2 ml-5 uppercase tracking-widest">{label}</Text>
    <View
      className={`flex-row items-center px-6 py-4 rounded-full border-2 bg-gray-50 ${
        foco === id ? "border-[#4876A8] bg-white shadow-sm" : "border-gray-50"
      }`}
    >
      <Feather
        name={icon}
        size={20}
        color={foco === id ? "#4876A8" : "#D1D5DB"}
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#D1D5DB"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure && ocultarSenha}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboard}
        className="flex-1 ml-3 text-gray-900 text-base font-semibold"
        onFocus={() => setFoco(id)}
        onBlur={() => setFoco(null)}
      />
      {secure && (
        <TouchableOpacity onPress={() => setOcultarSenha(!ocultarSenha)}>
          <Feather
            name={ocultarSenha ? "eye-off" : "eye"}
            size={18}
            color={foco === id ? "#4876A8" : "#D1D5DB"}
          />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [documento, setDocumento] = useState("");
  const [endereco, setEndereco] = useState("");
  const [tipo, setTipo] = useState(0); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [ocultarSenha, setOcultarSenha] = useState(true);
  const [foco, setFoco] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!nome || !email || !senha || !telefone || !documento) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setIsLoading(true);
      await usuarioService.criarUsuario({
        nome,
        email: email.trim(),
        senha,
        telefone: telefone.replace(/\D/g, ""),
        documento: documento.replace(/\D/g, ""),
        endereco,
        tipo,
      });

      Alert.alert("Sucesso", "Conta criada com sucesso!", [
        { text: "Fazer Login", onPress: () => router.replace("/(auth)/login") }
      ]);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível criar sua conta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />
      
      {/* Header Premium */}
      <View 
        style={{ paddingTop: insets.top + 20 }}
        className="bg-[#4876A8] pb-20 px-8 rounded-b-[50px] shadow-lg"
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/20 mb-4"
        >
          <Feather name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row justify-between items-end">
            <View>
                <Text className="text-white text-3xl font-black tracking-tighter">Criar Conta</Text>
                <Text className="text-blue-100 text-sm opacity-80 mt-1">Junte-se ao PetGo!</Text>
            </View>
            <View className="bg-white/10 p-3 rounded-2xl border border-white/20 mb-1">
                <Image
                    source={PetGoLogo}
                    style={{ width: 100, height: 40 }}
                    resizeMode="contain"
                />
            </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 mt-[-40px]"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-8"
        >
          <View className="bg-white p-8 rounded-[40px] shadow-2xl shadow-black/10 border border-gray-50 mb-10">
            {/* Seletor de Perfil Moderno */}
            <View className="mb-8">
              <Text className="text-gray-500 text-[10px] font-black mb-3 ml-5 uppercase tracking-widest">TIPO DE PERFIL</Text>
              <View className="flex-row gap-x-2">
                {USER_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => {
                        setTipo(t.id);
                        setDocumento("");
                    }}
                    className={`flex-1 flex-col items-center py-4 rounded-3xl border-2 ${
                      tipo === t.id ? "bg-blue-50 border-[#4876A8]" : "bg-gray-50 border-gray-50"
                    }`}
                  >
                    {t.provider === "MaterialCommunityIcons" ? (
                      <MaterialCommunityIcons 
                          name={t.icon as any} 
                          size={24} 
                          color={tipo === t.id ? "#4876A8" : "#D1D5DB"} 
                      />
                    ) : (
                      <Feather 
                          name={t.icon as any} 
                          size={22} 
                          color={tipo === t.id ? "#4876A8" : "#D1D5DB"} 
                      />
                    )}
                    <Text className={`text-[9px] font-black mt-2 uppercase tracking-tighter ${tipo === t.id ? "text-[#4876A8]" : "text-gray-400"}`}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <InputField label="Nome Completo" id="nome" value={nome} onChangeText={setNome} placeholder="Seu nome" icon="user" foco={foco} setFoco={setFoco} />
            <InputField label="E-mail" id="email" value={email} onChangeText={setEmail} placeholder="email@exemplo.com" icon="mail" keyboard="email-address" autoCapitalize="none" foco={foco} setFoco={setFoco} />
            <InputField label="Senha" id="senha" value={senha} onChangeText={setSenha} placeholder="Mínimo 8 caracteres" icon="lock" secure ocultarSenha={ocultarSenha} setOcultarSenha={setOcultarSenha} autoCapitalize="none" foco={foco} setFoco={setFoco} />
            <InputField label="Telefone" id="telefone" value={telefone} onChangeText={(t: string) => setTelefone(maskPhone(t))} placeholder="(00) 00000-0000" icon="phone" keyboard="phone-pad" foco={foco} setFoco={setFoco} />
            <InputField label={tipo === 1 ? "CNPJ" : "CPF"} id="documento" value={documento} onChangeText={(t: string) => setDocumento(tipo === 1 ? maskCNPJ(t) : maskCPF(t))} placeholder="000.000.000-00" icon="file-text" keyboard="numeric" foco={foco} setFoco={setFoco} />
            <InputField label="Endereço" id="endereco" value={endereco} onChangeText={setEndereco} placeholder="Cidade, Estado" icon="map-pin" foco={foco} setFoco={setFoco} />

            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.9}
              className="bg-[#4876A8] py-5 rounded-full items-center shadow-lg shadow-blue-900/30 mt-6 active:scale-[0.98]"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-lg tracking-widest">CADASTRAR</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.replace("/(auth)/login")}
              className="items-center mt-8"
            >
              <Text className="text-gray-400 text-sm">
                Já tem conta? <Text className="text-[#4876A8] font-black">ENTRAR</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
