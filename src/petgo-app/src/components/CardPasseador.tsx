import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { UsuarioResponseDto } from "../types/usuario";

interface CardPasseadorProps {
  passeador: UsuarioResponseDto;
}

export function CardPasseador({ passeador }: CardPasseadorProps) {
  const inicialDoNome = passeador.nome
    ? passeador.nome.charAt(0).toUpperCase()
    : "?";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/passeadores/[id]",
          params: { id: passeador.id },
        })
      }
      className="flex-row items-center bg-white p-4 mb-3 rounded-2xl border border-gray-100 shadow-sm"
    >
      {passeador.fotoUrl ? (
        <Image
          source={{ uri: passeador.fotoUrl }}
          className="w-14 h-14 rounded-full bg-gray-100"
        />
      ) : (
        <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center border-2 border-white shadow-inner">
          <Text className="text-2xl font-black text-[#4A80B4]">
            {inicialDoNome}
          </Text>
        </View>
      )}

      <View className="flex-1 ml-4">
        <Text className="text-base font-bold text-gray-800">
          {passeador.nome}
        </Text>
        <Text className="text-sm text-gray-500 mt-0.5">
          {passeador.telefone}
        </Text>
        <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
          {passeador.endereco || "Endereço não informado"}
        </Text>
      </View>

      <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
        <Feather name="chevron-right" size={18} color="#4A80B4" />
      </View>
    </TouchableOpacity>
  );
}
