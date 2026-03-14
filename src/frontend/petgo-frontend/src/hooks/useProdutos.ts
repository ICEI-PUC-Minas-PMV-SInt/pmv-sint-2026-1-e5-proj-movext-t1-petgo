import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { produtoService } from "../services/produto.service";
import { toast } from "../lib/toast";
import { CreateProdutoInput, UpdateProdutoInput, ApiError } from "../types";

// Query Keys para consistência
export const PRODUTO_QUERY_KEYS = {
  all: ["produtos"] as const,
  lists: () => [...PRODUTO_QUERY_KEYS.all, "list"] as const,
  list: (filters: string) =>
    [...PRODUTO_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PRODUTO_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...PRODUTO_QUERY_KEYS.details(), id] as const,
  search: (query: string) =>
    [...PRODUTO_QUERY_KEYS.all, "search", query] as const,
};

// Hook para listar produtos
export function useProdutos(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: PRODUTO_QUERY_KEYS.list(`page-${page}-size-${pageSize}`),
    queryFn: async () => {
      try {
        const result = await produtoService.getAll(page, pageSize);
        console.log("✅ Produtos carregados:", result);
        return result;
      } catch (error) {
        console.error("❌ Erro ao carregar produtos:", error);

        const apiError = error as ApiError;
        const errorMessage =
          apiError?.response?.data?.message ||
          apiError?.message ||
          "Erro ao carregar produtos";

        throw new Error(errorMessage);
      }
    },
    staleTime: 0, // Sempre buscar dados frescos
    gcTime: 1000 * 60 * 5, // Manter em cache por 5 minutos
    refetchOnMount: true, // Refetch ao montar componente
    refetchOnWindowFocus: false, // Não refetch ao focar janela
    retry: (failureCount, error) => {
      console.error(`🔄 Tentativa ${failureCount} falhou:`, error);
      return failureCount < 2;
    },
  });
}

// Hook para um produto específico
export function useProduto(id: number) {
  return useQuery({
    queryKey: PRODUTO_QUERY_KEYS.detail(id),
    queryFn: async () => {
      try {
        return await produtoService.getById(id);
      } catch (error) {
        console.error("❌ Erro ao carregar produto:", error);
        const apiError = error as ApiError;
        const errorMessage =
          apiError?.response?.data?.message ||
          apiError?.message ||
          "Erro ao carregar produto";
        throw new Error(errorMessage);
      }
    },
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook para buscar produtos
export function useSearchProdutos(searchTerm: string) {
  return useQuery({
    queryKey: PRODUTO_QUERY_KEYS.search(searchTerm),
    queryFn: () => produtoService.searchByName(searchTerm),
    enabled: searchTerm.length > 2,
    staleTime: 1000 * 60 * 2,
  });
}

// Hook para criar produto
export function useCreateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (produto: CreateProdutoInput) => produtoService.create(produto),
    onSuccess: (newProduto) => {
      console.log("✅ Produto criado com sucesso:", newProduto);

      // Invalidar TODAS as queries de produtos para forçar refetch
      queryClient.invalidateQueries({
        queryKey: PRODUTO_QUERY_KEYS.lists(),
        refetchType: "active",
      });

      // Adicionar o novo produto ao cache de detalhes
      queryClient.setQueryData(
        PRODUTO_QUERY_KEYS.detail(newProduto.id),
        newProduto
      );

      toast.success("Produto criado com sucesso!");
    },
    onError: (error: ApiError) => {
      console.error("🚨 Erro ao criar produto:", error);
      toast.error(error.message || "Erro ao criar produto");
    },
  });
}

// Hook para atualizar produto - CORRIGIDO
export function useUpdateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    // MUDANÇA AQUI: aceitar { id, data } em vez de { id, produto }
    mutationFn: ({ id, data }: { id: number; data: UpdateProdutoInput }) =>
      produtoService.update(id, data),
    onSuccess: (updatedProduto, { id }) => {
      console.log("✅ Produto atualizado com sucesso:", updatedProduto);

      // Invalidar TODAS as listas para forçar refetch
      queryClient.invalidateQueries({
        queryKey: PRODUTO_QUERY_KEYS.lists(),
        refetchType: "active",
      });

      // Atualizar o produto específico no cache
      queryClient.setQueryData(PRODUTO_QUERY_KEYS.detail(id), updatedProduto);

      toast.success("Produto atualizado com sucesso!");
    },
    onError: (error: ApiError) => {
      console.error("🚨 Erro ao atualizar produto:", error);
      toast.error(error.message || "Erro ao atualizar produto");
    },
  });
}

// Hook para deletar produto
export function useDeleteProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      try {
        console.log("🗑️ Deletando produto:", id);
        return await produtoService.delete(id);
      } catch (error) {
        console.error("❌ Erro ao deletar produto:", error);
        const apiError = error as ApiError;
        const errorMessage =
          apiError?.response?.data?.message ||
          apiError?.message ||
          "Erro ao deletar produto";
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data, id) => {
      console.log("✅ Produto deletado:", id);

      // Invalidar TODAS as listas de produtos para forçar refetch
      queryClient.invalidateQueries({
        queryKey: PRODUTO_QUERY_KEYS.lists(),
        refetchType: "active",
      });

      // Remover produto específico do cache
      queryClient.removeQueries({ queryKey: PRODUTO_QUERY_KEYS.detail(id) });

      toast.success("Produto deletado com sucesso!");
    },
    onError: (error: ApiError, id: number) => {
      console.error("🚨 useDeleteProduto error:", { error, id });
      toast.error(`Erro ao deletar produto: ${error.message}`);
    },
  });
}

// Hook combinado para operações CRUD
export function useProdutoOperations() {
  const createMutation = useCreateProduto();
  const updateMutation = useUpdateProduto();
  const deleteMutation = useDeleteProduto();

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
