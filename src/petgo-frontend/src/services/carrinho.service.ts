import api from "@/lib/api";
import { CarrinhoItem, CreateCarrinhoItemInput, CarrinhoTotal } from "@/types";

export const carrinhoService = {
  // Buscar carrinho do usuário
  async getCarrinho(usuarioId: number): Promise<CarrinhoItem[]> {
    const response = await api.get<CarrinhoItem[]>(
      `/api/carrinho/${usuarioId}`
    );
    return response.data;
  },

  // Adicionar item ao carrinho
  async adicionarItem(item: CreateCarrinhoItemInput): Promise<CarrinhoItem> {
    const response = await api.post<CarrinhoItem>("/api/carrinho", item);
    return response.data;
  },

  // Atualizar quantidade de um item
  async atualizarQuantidade(
    itemId: number,
    quantidade: number
  ): Promise<CarrinhoItem> {
    const response = await api.put<CarrinhoItem>(
      `/api/carrinho/${itemId}`,
      quantidade,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  // Remover item do carrinho
  async removerItem(itemId: number): Promise<void> {
    await api.delete(`/api/carrinho/${itemId}`);
  },

  // Limpar carrinho
  async limparCarrinho(usuarioId: number): Promise<void> {
    await api.delete(`/api/carrinho/limpar/${usuarioId}`);
  },

  // Obter total do carrinho
  async getTotal(usuarioId: number): Promise<CarrinhoTotal> {
    const response = await api.get<CarrinhoTotal>(
      `/api/carrinho/total/${usuarioId}`
    );
    return response.data;
  },
};
