import { shopService } from "@/src/services/shopService";
import { authService } from "@/src/services/authService";
import { ProdutoResponseDto, PedidoResponseDto } from "@/src/types/shop";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

type TabType = "shop" | "orders";

export default function Shop() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("shop");
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState<ProdutoResponseDto[]>([]);
  const [pedidos, setPedidos] = useState<PedidoResponseDto[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permissão", "Precisamos de acesso à galeria para anexar a foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setFotoUrl(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };
  
  // Cart State
  const [carrinho, setCarrinho] = useState<{id: string, nome: string, preco: number, quantidade: number}[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Details State
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<ProdutoResponseDto | null>(null);

  // Management State
  const [manageMode, setManageMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduto, setEditingProduto] = useState<ProdutoResponseDto | null>(null);
  
  // Form State
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");

  const carregarDados = async () => {
    try {
      setLoading(true);
      const type = await authService.obterUserType();
      setUserType(type);
      const userId = await authService.obterUserId();
      setCurrentUserId(userId);

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

  const addToCart = (produto: any) => {
    setCarrinho(prev => {
        const existing = prev.find(i => i.id === produto.id);
        if (existing) {
            return prev.map(i => i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i);
        }
        return [...prev, { id: produto.id, nome: produto.nome, preco: produto.preco, quantidade: 1 }];
    });
  };

  const removeFromCartOne = (id: string) => {
    setCarrinho(prev => {
        const item = prev.find(i => i.id === id);
        if (item && item.quantidade > 1) {
            return prev.map(i => i.id === id ? { ...i, quantidade: i.quantidade - 1 } : i);
        }
        return prev.filter(i => i.id !== id);
    });
  };

  const removeFromCart = (id: string) => {
    setCarrinho(prev => prev.filter(i => i.id !== id));
  };

  const totalCart = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  const handleCheckout = async () => {
    if (carrinho.length === 0) return;

    try {
      setProcessing(true);
      const payload = {
        itens: carrinho.map(item => ({
            produtoId: item.id,
            quantidade: item.quantidade
        }))
      };

      const pedido = await shopService.criarPedido(payload);
      
      // Simula pagamento imediato para facilitar o fluxo
      await shopService.pagarPedido(pedido.id);

      setCarrinho([]);
      setCartVisible(false);
      Alert.alert("Parabéns!", "Seu pedido foi realizado e o pagamento confirmado com sucesso!");
      setActiveTab("orders");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Não foi possível finalizar o pedido.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveProduto = async () => {
    if (!nome || !preco || !categoria) {
        Alert.alert("Erro", "Campos obrigatórios: Nome, Preço e Categoria.");
        return;
    }

    try {
        setProcessing(true);
        const data = {
            nome,
            descricao,
            preco: parseFloat(preco.replace(",", ".")),
            estoque: parseInt(estoque) || 0,
            categoria,
            fotoUrl: fotoUrl || undefined
        };

        if (editingProduto) {
            await shopService.editarProduto(editingProduto.id, data);
            Alert.alert("Sucesso", "Produto atualizado!");
        } else {
            await shopService.criarProduto(data);
            Alert.alert("Sucesso", "Produto cadastrado!");
        }
        
        setModalVisible(false);
        setEditingProduto(null);
        resetForm();
        carregarDados();
    } catch (error: any) {
        Alert.alert("Erro", error.message || "Falha ao salvar produto");
    } finally {
        setProcessing(false);
    }
  };

  const resetForm = () => {
      setNome("");
      setDescricao("");
      setPreco("");
      setEstoque("");
      setCategoria("");
      setFotoUrl("");
  };

  const openEdit = (produto: ProdutoResponseDto) => {
      setEditingProduto(produto);
      setNome(produto.nome);
      setDescricao(produto.descricao);
      setPreco(produto.preco.toString());
      setEstoque(produto.estoque.toString());
      setCategoria(produto.categoria);
      setFotoUrl(produto.fotoUrl || "");
      setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Excluir", "Deseja realmente excluir este produto?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
            try {
                await shopService.excluirProduto(id);
                carregarDados();
            } catch (error: any) {
                Alert.alert("Erro", error.message);
            }
        }}
    ]);
  };

  const renderProductItem = ({ item }: { item: ProdutoResponseDto }) => (
    <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => { setSelectedProduto(item); setDetailsModalVisible(true); }}
        className="bg-white mb-6 p-5 rounded-[40px] border border-gray-100 shadow-sm flex-row items-center relative"
    >
      <View className="bg-gray-50 rounded-3xl mr-5 overflow-hidden border border-gray-100" style={{ width: 90, height: 90 }}>
        <Image 
          source={ (item.fotoUrl && item.fotoUrl.trim() !== "") ? item.fotoUrl : "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200" } 
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
      </View>
      <View className="flex-1 pr-10">
        <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[2px] mb-1">{item.categoria}</Text>
        <Text numberOfLines={2} className="text-lg font-black text-gray-900 tracking-tighter leading-5 mb-2">{item.nome}</Text>
        <View className="flex-row items-center">
            <Text className="text-[#4876A8] font-black text-xl tracking-tighter">R$ {item.preco.toFixed(2)}</Text>
            {item.estoque < 10 && item.estoque > 0 && (
                <View className="bg-red-50 px-2 py-0.5 rounded-md ml-3">
                    <Text className="text-red-500 text-[8px] font-black uppercase">Últimas {item.estoque}</Text>
                </View>
            )}
        </View>
      </View>
      
      {manageMode && item.ongId === currentUserId ? (
        <View className="flex-row gap-x-2 absolute right-5">
            <TouchableOpacity onPress={() => openEdit(item)} className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                <Feather name="edit-2" size={16} color="#4876A8" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} className="bg-red-50 p-3 rounded-2xl border border-red-100">
                <Feather name="trash-2" size={16} color="#EF4444" />
            </TouchableOpacity>
        </View>
      ) : !manageMode && item.ongId !== currentUserId && (
        <View className="absolute right-5 bottom-5">
            {carrinho.find(c => c.id === item.id) ? (
                <View className="flex-row items-center bg-blue-50 rounded-2xl border border-blue-100 p-1">
                    <TouchableOpacity 
                        onPress={() => removeFromCartOne(item.id)}
                        className="w-8 h-8 items-center justify-center bg-white rounded-xl shadow-sm"
                    >
                        <Feather name="minus" size={14} color="#4876A8" />
                    </TouchableOpacity>
                    <Text className="mx-3 font-black text-[#4876A8] text-sm">{carrinho.find(c => c.id === item.id)?.quantidade}</Text>
                    <TouchableOpacity 
                        onPress={() => addToCart(item)}
                        className="w-8 h-8 items-center justify-center bg-[#4876A8] rounded-xl shadow-sm"
                    >
                        <Feather name="plus" size={14} color="white" />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity 
                    onPress={() => addToCart(item)}
                    className="bg-[#4876A8] w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-blue-900/20"
                >
                    <Feather name="plus" size={24} color="white" />
                </TouchableOpacity>
            )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }: { item: PedidoResponseDto }) => {
    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case "pago": return { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" };
            case "enviado": return { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" };
            case "entregue": return { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500" };
            case "cancelado": return { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" };
            default: return { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500" };
        }
    };

    const styles = getStatusStyles(item.status);

    return (
        <View className="bg-white mb-6 p-6 rounded-[40px] border border-gray-100 shadow-sm">
            <View className="flex-row justify-between items-start mb-6">
                <View className="flex-row items-center">
                    <View className="bg-blue-50 p-3 rounded-2xl mr-4">
                        <MaterialCommunityIcons name="package-variant" size={24} color="#4876A8" />
                    </View>
                    <View>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Pedido #{item.id.substring(0, 8)}</Text>
                        <Text className="text-gray-900 font-black text-lg tracking-tighter">
                            {new Date(item.dataPedido).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                        </Text>
                    </View>
                </View>
                <View className={`${styles.bg} px-4 py-2 rounded-2xl flex-row items-center`}>
                    <View className={`w-2 h-2 rounded-full mr-2 ${styles.dot}`} />
                    <Text className={`${styles.text} text-[10px] font-black uppercase tracking-widest`}>{item.status}</Text>
                </View>
            </View>

            <View className="mb-6 space-y-2">
                {item.itens.map((sub, idx) => (
                    <View key={idx} className="flex-row justify-between items-center py-1">
                        <View className="flex-row items-center flex-1 mr-4">
                            <Text className="text-gray-400 font-black text-xs mr-2">{sub.quantidade}x</Text>
                            <Text className="text-gray-600 font-bold flex-1" numberOfLines={1}>
                                {sub.nomeProduto || "Produto"}
                            </Text>
                        </View>
                        <Text className="text-gray-400 font-bold text-xs">R$ {(sub.precoUnitario * sub.quantidade).toFixed(2)}</Text>
                    </View>
                ))}
            </View>
            
            <View className="border-t border-gray-50 pt-5 flex-row justify-between items-center">
                <Text className="text-gray-900 font-black uppercase text-[10px] tracking-widest">Total Pago</Text>
                <Text className="text-[#4876A8] font-black text-2xl tracking-tighter">R$ {item.valorTotal.toFixed(2)}</Text>
            </View>
        </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-8 pt-12 pb-6">
        <View className="flex-row justify-between items-center mb-2">
            <View>
                <Text className="text-4xl font-black text-[#4876A8] tracking-tight">PetShop</Text>
                <Text className="text-gray-400 font-semibold text-base mt-1">O melhor para o seu pet</Text>
            </View>
            
            {activeTab === "shop" && (
                <View className="flex-row gap-x-3">
                    {(userType === "Admin" || userType === "Ong") && (
                        <TouchableOpacity 
                            onPress={() => setManageMode(!manageMode)}
                            className={`w-14 h-14 rounded-2xl items-center justify-center border-2 ${manageMode ? "bg-orange-500 border-orange-500" : "bg-white border-gray-100"}`}
                        >
                            <Feather name="settings" size={24} color={manageMode ? "white" : "#4876A8"} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                        onPress={() => setCartVisible(true)}
                        className="bg-[#4876A8] w-14 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-900/20"
                    >
                        <Feather name="shopping-cart" size={24} color="white" />
                        {carrinho.length > 0 && (
                            <View className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                                <Text className="text-white text-[10px] font-bold">{carrinho.reduce((a, b) => a + b.quantidade, 0)}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>

        {(userType === "Admin" || userType === "Ong") && activeTab === "shop" && (
            <View className="flex-row gap-x-3 mt-4">
                <TouchableOpacity 
                    onPress={() => router.push("/vendas" as any)}
                    className="flex-1 bg-green-500 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-green-900/10"
                >
                    <MaterialCommunityIcons name="basket-check" size={20} color="white" />
                    <Text className="text-white font-black ml-2 uppercase tracking-widest text-[10px]">Gerenciar Vendas</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    onPress={() => { resetForm(); setEditingProduto(null); setModalVisible(true); }}
                    className="flex-1 bg-orange-500 py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-900/10"
                >
                    <Feather name="plus-circle" size={20} color="white" />
                    <Text className="text-white font-black ml-2 uppercase tracking-widest text-[11px]">Novo Produto</Text>
                </TouchableOpacity>
            </View>
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

            {carrinho.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <MaterialCommunityIcons name="cart-outline" size={64} color="#D1D5DB" />
                    <Text className="text-gray-400 font-bold mt-4">Carrinho vazio</Text>
                </View>
            ) : (
                <>
                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-6">
                        {carrinho.map((item, idx) => (
                            <View key={idx} className="flex-row justify-between items-center bg-gray-50 p-4 rounded-3xl mb-4 border border-gray-100">
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-black text-base tracking-tighter">{item.nome}</Text>
                                    <Text className="text-[#4876A8] font-bold text-xs">R$ {item.preco.toFixed(2)}</Text>
                                </View>
                                
                                <View className="flex-row items-center bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                                    <TouchableOpacity 
                                        onPress={() => removeFromCartOne(item.id)}
                                        className="w-8 h-8 items-center justify-center bg-gray-50 rounded-xl"
                                    >
                                        <Feather name="minus" size={14} color="#4876A8" />
                                    </TouchableOpacity>
                                    <Text className="mx-4 font-black text-gray-900">{item.quantidade}</Text>
                                    <TouchableOpacity 
                                        onPress={() => addToCart({id: item.id, nome: item.nome, preco: item.preco})}
                                        className="w-8 h-8 items-center justify-center bg-blue-50 rounded-xl"
                                    >
                                        <Feather name="plus" size={14} color="#4876A8" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress={() => removeFromCart(item.id)} className="ml-4 bg-red-50 p-3 rounded-xl">
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

      {/* Product Management Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[50px] p-10 h-[85%]">
                <View className="flex-row justify-between items-center mb-8">
                    <Text className="text-3xl font-black text-[#4876A8] tracking-tighter">{editingProduto ? "Editar Produto" : "Novo Produto"}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-gray-50 p-3 rounded-2xl">
                        <Feather name="x" size={24} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <View className="gap-y-4">
                        <View>
                            <Text className="text-gray-400 text-xs font-bold uppercase ml-1 mb-1">Nome</Text>
                            <TextInput value={nome} onChangeText={setNome} placeholder="Ex: Ração Premium" className="bg-gray-50 p-4 rounded-2xl border border-gray-100" />
                        </View>
                        <View>
                            <Text className="text-gray-400 text-xs font-bold uppercase ml-1 mb-1">Categoria</Text>
                            <TextInput value={categoria} onChangeText={setCategoria} placeholder="Ex: Alimentos" className="bg-gray-50 p-4 rounded-2xl border border-gray-100" />
                        </View>
                        <View className="flex-row gap-x-4">
                            <View className="flex-1">
                                <Text className="text-gray-400 text-xs font-bold uppercase ml-1 mb-1">Preço</Text>
                                <TextInput value={preco} onChangeText={setPreco} keyboardType="numeric" placeholder="0.00" className="bg-gray-50 p-4 rounded-2xl border border-gray-100" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-400 text-xs font-bold uppercase ml-1 mb-1">Estoque</Text>
                                <TextInput value={estoque} onChangeText={setEstoque} keyboardType="numeric" placeholder="0" className="bg-gray-50 p-4 rounded-2xl border border-gray-100" />
                            </View>
                        </View>
                        <View>
                            <Text className="text-gray-400 text-xs font-bold uppercase ml-1 mb-1">Descrição</Text>
                            <TextInput value={descricao} onChangeText={setDescricao} multiline numberOfLines={3} placeholder="Detalhes do produto..." className="bg-gray-50 p-4 rounded-2xl border border-gray-100 h-24" />
                        </View>
                        <View>
                            <Text className="text-gray-400 text-xs font-bold uppercase ml-1 mb-1">URL da Foto</Text>
                            <View className="flex-row gap-x-2">
                                <TextInput 
                                    value={fotoUrl} 
                                    onChangeText={setFotoUrl} 
                                    placeholder="https://..." 
                                    className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100" 
                                />
                                <TouchableOpacity 
                                    onPress={handlePickImage}
                                    className="bg-blue-50 px-5 rounded-2xl items-center justify-center border border-blue-100"
                                >
                                    <Feather name="camera" size={20} color="#4876A8" />
                                </TouchableOpacity>
                            </View>
                            {fotoUrl.trim() !== "" && (
                                <View className="mt-4 items-center bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                    <Text className="text-gray-400 text-[9px] font-black uppercase mb-3">Pré-visualização:</Text>
                                    <Image 
                                        source={ fotoUrl } 
                                        style={{ width: 160, height: 160, borderRadius: 24 }}
                                        contentFit="cover"
                                        transition={200}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>

                <TouchableOpacity 
                    onPress={handleSaveProduto}
                    disabled={processing}
                    className="bg-[#4876A8] py-6 rounded-full items-center shadow-xl shadow-blue-900/20 mt-6"
                >
                    {processing ? <ActivityIndicator color="white" /> : (
                        <Text className="text-white font-black text-xl uppercase tracking-widest">{editingProduto ? "Salvar Alterações" : "Cadastrar Produto"}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* Product Details Modal */}
      <Modal visible={detailsModalVisible} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/60 justify-center items-center px-8">
            <View className="bg-white w-full rounded-[40px] overflow-hidden max-h-[80%]">
                <View className="relative bg-gray-100">
                    <Image 
                        source={ selectedProduto?.fotoUrl || "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800" } 
                        style={{ width: '100%', height: 280 }}
                        contentFit="cover"
                        transition={500}
                    />
                    <TouchableOpacity 
                        onPress={() => setDetailsModalVisible(false)}
                        className="absolute top-6 right-6 bg-white/90 p-3 rounded-2xl"
                    >
                        <Feather name="x" size={20} color="#4876A8" />
                    </TouchableOpacity>
                </View>

                <View className="p-8">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 mr-4">
                            <Text className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{selectedProduto?.categoria}</Text>
                            <Text className="text-2xl font-black text-gray-900 tracking-tighter">{selectedProduto?.nome}</Text>
                        </View>
                        <Text className="text-[#4876A8] font-black text-2xl">R$ {selectedProduto?.preco.toFixed(2)}</Text>
                    </View>

                    <ScrollView className="max-h-32 mb-8">
                        <Text className="text-gray-500 leading-6 font-medium">
                            {selectedProduto?.descricao || "Este produto de alta qualidade foi selecionado especialmente para garantir o bem-estar e a felicidade do seu pet."}
                        </Text>
                    </ScrollView>

                    <View className="flex-row gap-x-4">
                        <View className="flex-1 bg-gray-50 p-4 rounded-3xl items-center justify-center">
                            <Text className="text-gray-400 text-[10px] font-black uppercase mb-1">Estoque</Text>
                            <Text className="text-gray-900 font-black text-lg">{selectedProduto?.estoque} un</Text>
                        </View>
                        {selectedProduto?.ongId === currentUserId ? (
                            <TouchableOpacity 
                                onPress={() => { setDetailsModalVisible(false); openEdit(selectedProduto!); }}
                                className="flex-[2] bg-orange-500 rounded-3xl flex-row items-center justify-center shadow-lg shadow-orange-900/20"
                            >
                                <Feather name="edit-3" size={20} color="white" />
                                <Text className="text-white font-black ml-3 uppercase tracking-widest">Editar</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                onPress={() => { addToCart(selectedProduto!); setDetailsModalVisible(false); }}
                                className="flex-[2] bg-[#4876A8] rounded-3xl flex-row items-center justify-center shadow-lg shadow-blue-900/20"
                            >
                                <Feather name="shopping-cart" size={20} color="white" />
                                <Text className="text-white font-black ml-3 uppercase tracking-widest">Comprar</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {(userType === "Admin" || userType === "Ong") && selectedProduto?.ongId !== currentUserId && (
                        <TouchableOpacity 
                            onPress={() => { setDetailsModalVisible(false); openEdit(selectedProduto!); }}
                            className="bg-orange-50 p-5 rounded-3xl border border-orange-100 mt-4 flex-row items-center justify-center"
                        >
                            <Feather name="edit-3" size={18} color="#F97316" />
                            <Text className="text-orange-700 font-black ml-2 uppercase tracking-widest text-[10px]">Editar Produto</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}
