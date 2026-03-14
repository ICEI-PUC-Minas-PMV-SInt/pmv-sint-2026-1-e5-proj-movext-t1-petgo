import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { passeadorService } from "../services/passeador.service";
import { toast } from "../lib/toast";
import {
  CreatePasseadorInput,
  UpdatePasseadorInput,
  ApiError,
  Passeador,
  TipoServico,
} from "../types";

// Query Keys para gerenciamento de cache
export const PASSEADOR_QUERY_KEYS = {
  all: ["passeadores"] as const,
  lists: () => [...PASSEADOR_QUERY_KEYS.all, "list"] as const,
  details: () => [...PASSEADOR_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...PASSEADOR_QUERY_KEYS.details(), id] as const,
  search: (query: string) =>
    [...PASSEADOR_QUERY_KEYS.all, "search", query] as const,
  byService: (tipoServico: TipoServico) =>
    [...PASSEADOR_QUERY_KEYS.all, "servico", tipoServico] as const,
};

// Hook para listar todos os passeadores
export function usePasseadores() {
  return useQuery({
    queryKey: PASSEADOR_QUERY_KEYS.lists(),
    queryFn: async () => {
      try {
        const result = await passeadorService.getAll();
        console.log("✅ Passeadores carregados:", result);
        return result;
      } catch (error) {
        console.error("❌ Erro ao carregar passeadores:", error);
        const apiError = error as ApiError;
        const errorMessage =
          apiError?.response?.data?.message ||
          apiError?.message ||
          "Erro ao carregar passeadores";
        throw new Error(errorMessage);
      }
    },
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

// Hook para buscar um passeador específico
export function usePasseador(id: number) {
  return useQuery({
    queryKey: PASSEADOR_QUERY_KEYS.detail(id),
    queryFn: async () => {
      try {
        return await passeadorService.getById(id);
      } catch (error) {
        console.error("❌ Erro ao carregar passeador:", error);
        const apiError = error as ApiError;
        const errorMessage =
          apiError?.response?.data?.message ||
          apiError?.message ||
          "Erro ao carregar passeador";
        throw new Error(errorMessage);
      }
    },
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook para buscar passeadores por nome
export function useSearchPasseadores(searchTerm: string) {
  return useQuery({
    queryKey: PASSEADOR_QUERY_KEYS.search(searchTerm),
    queryFn: () => passeadorService.search(searchTerm),
    enabled: searchTerm.length > 2,
    staleTime: 1000 * 60 * 2,
  });
}

// Hook para filtrar passeadores por tipo de serviço
export function usePasseadoresByService(tipoServico: TipoServico) {
  return useQuery({
    queryKey: PASSEADOR_QUERY_KEYS.byService(tipoServico),
    queryFn: () => passeadorService.filterByService(tipoServico),
    staleTime: 1000 * 60 * 5,
  });
}

// Hook para criar passeador
export function useCreatePasseador() {
  const queryClient = useQueryClient();

  return useMutation<Passeador, ApiError, CreatePasseadorInput>({
    mutationFn: async (passeador: CreatePasseadorInput): Promise<Passeador> => {
      return await passeadorService.create(passeador);
    },
    onSuccess: (newPasseador: Passeador) => {
      console.log("✅ Passeador criado com sucesso:", newPasseador);

      // Invalidar lista de passeadores
      queryClient.invalidateQueries({
        queryKey: PASSEADOR_QUERY_KEYS.lists(),
        refetchType: "active",
      });

      // Adicionar ao cache de detalhes
      queryClient.setQueryData(
        PASSEADOR_QUERY_KEYS.detail(newPasseador.usuarioId),
        newPasseador
      );

      toast.success("Perfil de passeador criado com sucesso!");
    },
    onError: (error: ApiError) => {
      console.error("❌ Erro ao criar passeador:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao criar perfil de passeador";
      toast.error(errorMessage);
    },
  });
}

// Hook para atualizar passeador
export function useUpdatePasseador() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiError,
    { id: number; data: UpdatePasseadorInput }
  >({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdatePasseadorInput;
    }): Promise<void> => {
      return await passeadorService.update(id, data);
    },
    onSuccess: (_, variables) => {
      console.log("✅ Passeador atualizado com sucesso");

      // Invalidar cache do passeador específico
      queryClient.invalidateQueries({
        queryKey: PASSEADOR_QUERY_KEYS.detail(variables.id),
      });

      // Invalidar lista de passeadores
      queryClient.invalidateQueries({
        queryKey: PASSEADOR_QUERY_KEYS.lists(),
      });

      toast.success("Perfil de passeador atualizado com sucesso!");
    },
    onError: (error: ApiError) => {
      console.error("❌ Erro ao atualizar passeador:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao atualizar perfil de passeador";
      toast.error(errorMessage);
    },
  });
}

// Hook para deletar passeador
export function useDeletePasseador() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: async (id: number): Promise<void> => {
      return await passeadorService.delete(id);
    },
    onSuccess: (_, deletedId) => {
      console.log("✅ Passeador deletado com sucesso");

      // Remover do cache
      queryClient.removeQueries({
        queryKey: PASSEADOR_QUERY_KEYS.detail(deletedId),
      });

      // Invalidar lista de passeadores
      queryClient.invalidateQueries({
        queryKey: PASSEADOR_QUERY_KEYS.lists(),
      });

      toast.success("Perfil de passeador removido com sucesso!");
    },
    onError: (error: ApiError) => {
      console.error("❌ Erro ao deletar passeador:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao remover perfil de passeador";
      toast.error(errorMessage);
    },
  });
}
