import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { carrinhoService } from "@/services/carrinho.service";
import { CarrinhoItem, CreateCarrinhoItemInput } from "@/types";

const CARRINHO_QUERY_KEY = "carrinho";
const CARRINHO_TOTAL_QUERY_KEY = "carrinho-total";

// Hook para buscar carrinho
export function useCarrinho(usuarioId: number | undefined) {
  return useQuery<CarrinhoItem[]>({
    queryKey: [CARRINHO_QUERY_KEY, usuarioId],
    queryFn: () => carrinhoService.getCarrinho(usuarioId!),
    enabled: !!usuarioId,
  });
}

// Hook para adicionar item ao carrinho
export function useAdicionarAoCarrinho() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: CreateCarrinhoItemInput) =>
      carrinhoService.adicionarItem(item),
    onSuccess: async (_, variables) => {
      // Invalidar queries do carrinho
      await queryClient.invalidateQueries({
        queryKey: [CARRINHO_QUERY_KEY, variables.usuarioId],
      });
      await queryClient.invalidateQueries({
        queryKey: [CARRINHO_TOTAL_QUERY_KEY, variables.usuarioId],
      });
    },
  });
}

// Hook para atualizar quantidade
export function useAtualizarQuantidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      quantidade,
    }: {
      itemId: number;
      quantidade: number;
    }) => carrinhoService.atualizarQuantidade(itemId, quantidade),
    onSuccess: async () => {
      // Invalidar todas as queries do carrinho
      await queryClient.invalidateQueries({
        queryKey: [CARRINHO_QUERY_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [CARRINHO_TOTAL_QUERY_KEY],
      });
    },
  });
}

// Hook para remover item
export function useRemoverDoCarrinho() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => carrinhoService.removerItem(itemId),
    onSuccess: async () => {
      // Invalidar todas as queries do carrinho
      await queryClient.invalidateQueries({
        queryKey: [CARRINHO_QUERY_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [CARRINHO_TOTAL_QUERY_KEY],
      });
    },
  });
}

// Hook para limpar carrinho
export function useLimparCarrinho() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usuarioId: number) =>
      carrinhoService.limparCarrinho(usuarioId),
    onSuccess: async () => {
      // Invalidar todas as queries do carrinho
      await queryClient.invalidateQueries({
        queryKey: [CARRINHO_QUERY_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [CARRINHO_TOTAL_QUERY_KEY],
      });
    },
  });
}

// Hook para obter total do carrinho
export function useCarrinhoTotal(usuarioId: number | undefined) {
  return useQuery({
    queryKey: [CARRINHO_TOTAL_QUERY_KEY, usuarioId],
    queryFn: () => carrinhoService.getTotal(usuarioId!),
    enabled: !!usuarioId,
  });
}
