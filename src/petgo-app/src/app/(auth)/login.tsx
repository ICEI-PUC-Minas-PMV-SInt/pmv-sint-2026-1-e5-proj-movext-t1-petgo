import { Feather } from "@expo/vector-icons";
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
import { authService } from "../../services/authService";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import PetGoLogo from "../../../assets/images/petGo-logo.png";

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ocultarSenha, setOcultarSenha] = useState(true);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      setIsLoading(true);
      await authService.login({ Email: email.trim(), Senha: senha });
      router.replace("/");
    } catch (error: any) {
      Alert.alert(
        "Falha no Login",
        error.message || "E-mail ou senha inválidos.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="light-content" />
      
      <View style={{ backgroundColor: '#4876A8', paddingTop: insets.top + 30, paddingBottom: 80, alignItems: 'center', borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }}>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
           <Image
            source={PetGoLogo}
            style={{ width: 180, height: 70 }}
            resizeMode="contain"
          />
        </View>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 24 }}>Bem-vindo!</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, marginTop: -60 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 32 }}
        >
          <View style={{ backgroundColor: 'white', padding: 32, borderRadius: 40, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 10 }}>
            
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 16 }}>E-MAIL</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100, backgroundColor: '#F3F4F6' }}>
                <Feather name="mail" size={20} color="#D1D5DB" />
                <TextInput
                  placeholder="seu@email.com"
                  placeholderTextColor="#D1D5DB"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{ flex: 1, marginLeft: 12, color: '#111827', fontSize: 16 }}
                />
              </View>
            </View>

            <View style={{ marginBottom: 8 }}>
              <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 16 }}>SENHA</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100, backgroundColor: '#F3F4F6' }}>
                <Feather name="lock" size={20} color="#D1D5DB" />
                <TextInput
                  placeholder="********"
                  placeholderTextColor="#D1D5DB"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={ocultarSenha}
                  autoCapitalize="none"
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  style={{ flex: 1, marginLeft: 12, color: '#111827', fontSize: 16 }}
                />
                <TouchableOpacity onPress={() => setOcultarSenha(!ocultarSenha)}>
                  <Feather name={ocultarSenha ? "eye-off" : "eye"} size={20} color="#D1D5DB" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 32, marginRight: 8 }}>
              <Text style={{ color: '#4876A8', fontSize: 12, fontWeight: 'bold' }}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={{ backgroundColor: '#4876A8', paddingVertical: 18, borderRadius: 100, alignItems: 'center' }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1.5 }}>ENTRAR</Text>
              )}
            </TouchableOpacity>

            <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Não tem conta?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={{ marginLeft: 8 }}>
                <Text style={{ color: '#4876A8', fontWeight: '900', fontSize: 14 }}>CADASTRE-SE</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{ marginTop: 60, alignItems: 'center', paddingBottom: 40, opacity: 0.3 }}>
            <Text style={{ color: '#6B7280', fontSize: 10, fontWeight: 'bold', letterSpacing: 3 }}>PETGO • 2026</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
