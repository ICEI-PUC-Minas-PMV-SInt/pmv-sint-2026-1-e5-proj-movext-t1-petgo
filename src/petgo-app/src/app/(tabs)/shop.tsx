import { shopService } from "@/src/services/shopService";
import { ProdutoResponseDto, PedidoResponseDto } from "@/src/types/shop";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type TabType = "shop" | "orders";

export default function Shop() {
  const [activeTab, setActiveTab] = useState<TabType>("shop");
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState<ProdutoResponseDto[]>([]);
  const [pedidos, setPedidos] = useState<PedidoResponseDto[]>([]);
  
  // Cart State
  const [cart, setCart] = useState<{produto: ProdutoResponseDto, qtd: number}[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      if (activeTab === "shop") {
        const data = await shopService.listarProdutos();
        setProdutos(data);
      } else {
        const data = await shopService.listarMeusPedidos();
        setPedidos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar loja:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [activeTab]);

  const addToCart = (produto: ProdutoResponseDto) => {
    setCart(prev => {
        const existing = prev.find(item => item.produto.id === produto.id);
        if (existing) {
            return prev.map(item => 
                item.produto.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item
            );
        }
        return [...prev, { produto, qtd: 1 }];
    });
    Alert.alert("Sucesso", `${produto.nome} adicionado ao carrinho!`);
  };

  const totalCart = cart.reduce((acc, item) => acc + (item.produto.preco * item.qtd), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setProcessing(true);
      const payload = {
        itens: cart.map(item => ({
            produtoId: item.produto.id,
            quantidade: item.qtd
        }))
      };

      const pedido = await shopService.criarPedido(payload);
      
      // Simula pagamento imediato para facilitar o fluxo
      await shopService.pagarPedido(pedido.id);

      setCart([]);
      setCartVisible(false);
      Alert.alert("Parabéns!", "Seu pedido foi realizado e o pagamento confirmado com sucesso!");
      setActiveTab("orders");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível finalizar o pedido.");
    } finally {
      setProcessing(false);
    }
  };

  const renderProductItem = ({ item }: { item: ProdutoResponseDto }) => (
    <View className="bg-white mb-6 p-4 rounded-[32px] border border-gray-100 shadow-sm flex-row items-center">
      <Image 
        source={{ uri: item.fotoUrl || "https://via.placeholder.com/150" }} 
        className="w-24 h-24 rounded-2xl mr-4"
        resizeMode="contain"
      />
      <View className="flex-1">
        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{item.categoria}</Text>
        <Text className="text-lg font-black text-gray-900 tracking-tighter mb-1">{item.nome}</Text>
        <Text className="text-[#4876A8] font-black text-xl">R$ {item.preco.toFixed(2)}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => addToCart(item)}
        className="bg-blue-50 p-4 rounded-2xl"
      >
        <Feather name="plus" size={20} color="#4876A8" />
      </TouchableOpacity>
    </View>
  );

  const renderOrderItem = ({ item }: { item: PedidoResponseDto }) => (
    <View className="bg-white mb-4 p-6 rounded-[32px] border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <View>
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Pedido #{item.id.substring(0, 8)}</Text>
            <Text className="text-gray-900 font-black text-lg">{new Date(item.dataPedido).toLocaleDateString("pt-BR")}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${item.status === "Pago" ? "bg-green-50" : "bg-amber-50"}`}>
            <Text className={`text-[10px] font-black uppercase tracking-widest ${item.status === "Pago" ? "text-green-600" : "text-amber-600"}`}>{item.status}</Text>
        </View>
      </View>
      
      <View className="border-t border-gray-50 pt-4 flex-row justify-between items-center">
        <Text className="text-gray-500 font-bold">Total</Text>
        <Text className="text-[#4876A8] font-black text-xl">R$ {item.valorTotal.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-8 pt-12 pb-6 flex-row justify-between items-center">
        <View>
            <Text className="text-4xl font-black text-[#4876A8] tracking-tight">PetShop</Text>
            <Text className="text-gray-400 font-semibold text-base mt-1">O melhor para o seu pet</Text>
        </View>
        {activeTab === "shop" && (
            <TouchableOpacity 
                onPress={() => setCartVisible(true)}
                className="bg-[#4876A8] w-14 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-900/20"
            >
                <Feather name="shopping-cart" size={24} color="white" />
                {cart.length > 0 && (
                    <View className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                        <Text className="text-white text-[10px] font-bold">{cart.reduce((a, b) => a + b.qtd, 0)}</Text>
                    </View>
                )}
            </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View className="flex-row px-8 mb-6 gap-x-3">
        <TouchableOpacity 
          onPress={() => setActiveTab("shop")}
          className={`flex-1 py-4 rounded-3xl items-center flex-row justify-center border-2 ${activeTab === "shop" ? "bg-[#4876A8] border-[#4876A8]" : "bg-gray-50 border-gray-100"}`}
        >
          <MaterialCommunityIcons name="storefront-outline" size={18} color={activeTab === "shop" ? "white" : "#9CA3AF"} />
          <Text className={`font-black ml-2 uppercase tracking-widest text-[11px] ${activeTab === "shop" ? "text-white" : "text-gray-400"}`}>Produtos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActiveTab("orders")}
          className={`flex-1 py-4 rounded-3xl items-center flex-row justify-center border-2 ${activeTab === "orders" ? "bg-[#4876A8] border-[#4876A8]" : "bg-gray-50 border-gray-100"}`}
        >
          <MaterialCommunityIcons name="package-variant-closed" size={18} color={activeTab === "orders" ? "white" : "#9CA3AF"} />
          <Text className={`font-black ml-2 uppercase tracking-widest text-[11px] ${activeTab === "orders" ? "text-white" : "text-gray-400"}`}>Meus Pedidos</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4876A8" />
        </View>
      ) : (
        <FlatList
          data={activeTab === "shop" ? produtos : pedidos}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === "shop" ? renderProductItem : renderOrderItem as any}
          contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 bg-gray-50 rounded-[40px] border border-gray-100">
              <MaterialCommunityIcons name="cart-off" size={64} color="#D1D5DB" />
              <Text className="text-gray-400 font-bold mt-4 text-center px-10">
                {activeTab === "shop" 
                    ? "Nenhum produto disponível no momento." 
                    : "Você ainda não fez nenhum pedido."}
              </Text>
            </View>
          }
        />
      )}

      {/* Cart Modal */}
      <Modal visible={cartVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[50px] p-10 h-[70%]">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-3xl font-black text-[#4876A8] tracking-tighter">Meu Carrinho</Text>
              <TouchableOpacity onPress={() => setCartVisible(false)} className="bg-gray-50 p-3 rounded-2xl">
                <Feather name="x" size={24} color="#D1D5DB" />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <MaterialCommunityIcons name="cart-outline" size={64} color="#D1D5DB" />
                    <Text className="text-gray-400 font-bold mt-4">Carrinho vazio</Text>
                </View>
            ) : (
                <>
                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-6">
                        {cart.map((item) => (
                            <View key={item.produto.id} className="flex-row justify-between items-center mb-6">
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-black text-lg tracking-tighter">{item.produto.nome}</Text>
                                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">{item.qtd}x R$ {item.produto.preco.toFixed(2)}</Text>
                                </View>
                                <Text className="text-[#4876A8] font-black text-lg">R$ {(item.produto.preco * item.qtd).toFixed(2)}</Text>
                                <TouchableOpacity 
                                    onPress={() => setCart(prev => prev.filter(i => i.produto.id !== item.produto.id))}
                                    className="ml-4 p-2 bg-red-50 rounded-xl"
                                >
                                    <Feather name="trash-2" size={16} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    <View className="border-t border-gray-100 pt-6 mb-8">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-gray-400 font-bold text-lg uppercase tracking-widest">Total</Text>
                            <Text className="text-gray-900 font-black text-3xl tracking-tighter">R$ {totalCart.toFixed(2)}</Text>
                        </View>

                        <TouchableOpacity 
                            onPress={handleCheckout}
                            disabled={processing}
                            className="bg-[#4876A8] py-6 rounded-full items-center shadow-xl shadow-blue-900/20"
                        >
                            {processing ? <ActivityIndicator color="white" /> : (
                                <Text className="text-white font-black text-xl uppercase tracking-widest">Finalizar Compra</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
