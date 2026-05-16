import { shopService } from "@/src/services/shopService";
import { PedidoResponseDto } from "@/src/types/shop";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

export default function Vendas() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState<PedidoResponseDto[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregarVendas = async () => {
    try {
      setLoading(true);
      const data = await shopService.listarMinhasVendas();
      setVendas(data);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
      Alert.alert("Erro", "Não foi possível carregar suas vendas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, []);

  const handleAtualizarStatus = async (pedidoId: string, novoStatus: number) => {
    try {
      await shopService.atualizarStatusPedido(pedidoId, novoStatus);
      carregarVendas();
      Alert.alert("Sucesso", "Status do pedido atualizado com sucesso!");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao atualizar status.");
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendente": return "Pendente";
      case "pago": return "Pago / Preparando";
      case "enviado": return "Em Transporte";
      case "entregue": return "Entregue";
      case "cancelado": return "Cancelado";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendente": return "text-amber-600 bg-amber-50 border-amber-100";
      case "pago": return "text-blue-600 bg-blue-50 border-blue-100";
      case "enviado": return "text-orange-600 bg-orange-50 border-orange-100";
      case "entregue": return "text-green-600 bg-green-50 border-green-100";
      default: return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  const renderItem = ({ item }: { item: PedidoResponseDto }) => (
    <View className="bg-white mx-6 mb-6 p-6 rounded-[35px] border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Pedido #{item.id.slice(0, 8).toUpperCase()}</Text>
          <Text className="text-gray-900 font-black text-lg tracking-tighter">Venda realizada</Text>
          <Text className="text-gray-400 text-xs font-bold">{new Date(item.dataPedido).toLocaleDateString("pt-BR")} às {new Date(item.dataPedido).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full border ${getStatusColor(item.status)}`}>
          <Text className="text-[9px] font-black uppercase tracking-widest">{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <View className="bg-gray-50 p-4 rounded-2xl mb-4">
        {item.itens.map((subItem, index) => (
          <View key={subItem.id} className={`flex-row justify-between items-center ${index > 0 ? "mt-2 pt-2 border-t border-gray-100" : ""}`}>
            <Text className="text-gray-700 font-bold text-sm flex-1 mr-2" numberOfLines={1}>{subItem.quantidade}x {subItem.nomeProduto}</Text>
            <Text className="text-gray-900 font-black text-sm">R$ {(subItem.precoUnitario * subItem.quantidade).toFixed(2)}</Text>
          </View>
        ))}
        <View className="mt-3 pt-3 border-t border-gray-200 flex-row justify-between">
          <Text className="text-gray-900 font-black">Total</Text>
          <Text className="text-[#4876A8] font-black">R$ {item.valorTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Action Buttons based on Status */}
      <View className="flex-row gap-x-2">
        {item.status.toLowerCase() === "pago" && (
          <TouchableOpacity 
            onPress={() => handleAtualizarStatus(item.id, 2)} // 2 = Enviado
            className="flex-1 bg-orange-500 py-4 rounded-2xl items-center shadow-lg shadow-orange-900/10 flex-row justify-center"
          >
            <Feather name="truck" size={16} color="white" />
            <Text className="text-white font-black text-[10px] uppercase tracking-widest ml-2">Marcar como Enviado</Text>
          </TouchableOpacity>
        )}
        {item.status.toLowerCase() === "enviado" && (
          <TouchableOpacity 
            onPress={() => handleAtualizarStatus(item.id, 3)} // 3 = Entregue
            className="flex-1 bg-green-500 py-4 rounded-2xl items-center shadow-lg shadow-green-900/10 flex-row justify-center"
          >
            <Feather name="check-circle" size={16} color="white" />
            <Text className="text-white font-black text-[10px] uppercase tracking-widest ml-2">Confirmar Entrega</Text>
          </TouchableOpacity>
        )}
        {item.status.toLowerCase() === "pendente" && (
          <View className="flex-1 bg-amber-50 py-4 rounded-2xl items-center border border-amber-100">
            <Text className="text-amber-600 font-black text-[10px] uppercase tracking-widest">Aguardando Pagamento</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-12 pb-6 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-gray-50 p-3 rounded-2xl border border-gray-100 mr-4"
        >
          <Feather name="chevron-left" size={24} color="#4876A8" />
        </TouchableOpacity>
        <View>
          <Text className="text-3xl font-black text-[#4876A8] tracking-tighter">Minhas Vendas</Text>
          <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-0.5">Gerenciamento de Pedidos</Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4876A8" />
        </View>
      ) : (
        <FlatList
          data={vendas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregarVendas(); }} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 px-10">
              <View className="bg-gray-50 p-10 rounded-[50px] items-center border border-gray-100">
                <MaterialCommunityIcons name="basket-off-outline" size={64} color="#D1D5DB" />
                <Text className="text-gray-400 font-black text-center mt-6 text-lg tracking-tight">Nenhuma venda encontrada.</Text>
                <Text className="text-gray-300 text-center mt-2 text-sm">Quando alguém comprar seus produtos, os pedidos aparecerão aqui.</Text>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}
