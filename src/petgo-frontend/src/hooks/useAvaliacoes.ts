import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { avaliacaoService } from "../services/avaliacao.service";
import { CreateAvaliacaoInput, Avaliacao, AlvoTipo, ApiError } from "../types";
import { toast } from "../lib/toast";

export const AVALIACAO_QUERY_KEYS = {
  all: ["avaliacoes"] as const,
  byAlvo: (alvoTipo: AlvoTipo, alvoId: number) =>
    [...AVALIACAO_QUERY_KEYS.all, "alvo", alvoTipo, alvoId] as const,
  detail: (id: number) => [...AVALIACAO_QUERY_KEYS.all, "detail", id] as const,
};

// Hook para buscar avaliações por alvo (passeador, produto, etc)
export function useAvaliacoes(alvoTipo: AlvoTipo, alvoId: number) {
  return useQuery({
    queryKey: AVALIACAO_QUERY_KEYS.byAlvo(alvoTipo, alvoId),
    queryFn: () => avaliacaoService.getByAlvo(alvoTipo, alvoId),
    enabled: !!alvoId,
  });
}

// Hook para criar avaliação
export function useCreateAvaliacao() {
  const queryClient = useQueryClient();

  return useMutation<Avaliacao, ApiError, CreateAvaliacaoInput>({
    mutationFn: avaliacaoService.create,
    onSuccess: async (newAvaliacao) => {
      // Invalidar avaliações
      await queryClient.invalidateQueries({
        queryKey: AVALIACAO_QUERY_KEYS.byAlvo(
          newAvaliacao.alvoTipo,
          newAvaliacao.alvoId
        ),
      });

      // Invalidar produtos se for avaliação de produto
      if (newAvaliacao.alvoTipo === AlvoTipo.PRODUTO) {
        // Invalidar e refetch lista de produtos
        await queryClient.invalidateQueries({
          queryKey: ["produtos"],
          refetchType: "active",
        });
        // Invalidar e refetch produto específico
        await queryClient.refetchQueries({
          queryKey: ["produtos", "detail", newAvaliacao.alvoId],
        });
      }

      // Invalidar passeadores se for avaliação de passeador
      if (newAvaliacao.alvoTipo === AlvoTipo.PASSEADOR) {
        await queryClient.invalidateQueries({
          queryKey: ["passeadores"],
          refetchType: "active",
        });
        await queryClient.refetchQueries({
          queryKey: ["passeadores", "detail", newAvaliacao.alvoId],
        });
      }

      toast.success("Avaliação enviada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar avaliação");
    },
  });
}

// Hook para atualizar avaliação
export function useUpdateAvaliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateAvaliacaoInput>;
    }) => avaliacaoService.update(id, data),
    onSuccess: (updatedAvaliacao) => {
      // Invalidar avaliações
      queryClient.invalidateQueries({
        queryKey: AVALIACAO_QUERY_KEYS.byAlvo(
          updatedAvaliacao.alvoTipo,
          updatedAvaliacao.alvoId
        ),
      });

      // Invalidar produtos se for avaliação de produto
      if (updatedAvaliacao.alvoTipo === AlvoTipo.PRODUTO) {
        queryClient.invalidateQueries({ queryKey: ["produtos"] });
        queryClient.invalidateQueries({
          queryKey: ["produtos", "detail", updatedAvaliacao.alvoId],
        });
      }

      // Invalidar passeadores se for avaliação de passeador
      if (updatedAvaliacao.alvoTipo === AlvoTipo.PASSEADOR) {
        queryClient.invalidateQueries({ queryKey: ["passeadores"] });
        queryClient.invalidateQueries({
          queryKey: ["passeadores", "detail", updatedAvaliacao.alvoId],
        });
      }

      toast.success("Avaliação atualizada!");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Erro ao atualizar avaliação");
    },
  });
}

// Hook para deletar avaliação
export function useDeleteAvaliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: avaliacaoService.delete,
    onSuccess: () => {
      // Invalidar todas as avaliações
      queryClient.invalidateQueries({ queryKey: AVALIACAO_QUERY_KEYS.all });

      // Invalidar produtos e passeadores para atualizar médias
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      queryClient.invalidateQueries({ queryKey: ["passeadores"] });

      toast.success("Avaliação removida!");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Erro ao remover avaliação");
    },
  });
}
