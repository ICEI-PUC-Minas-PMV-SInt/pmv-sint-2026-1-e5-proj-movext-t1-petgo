import api from "../lib/api";
import { Avaliacao, CreateAvaliacaoInput, AlvoTipo } from "../types";

export const avaliacaoService = {
  // Buscar avaliações por alvo (passeador, produto, serviço)
  getByAlvo: async (
    alvoTipo: AlvoTipo,
    alvoId: number
  ): Promise<Avaliacao[]> => {
    const { data } = await api.get<Avaliacao[]>(
      `/api/Avaliacoes/alvo/${alvoTipo}/${alvoId}`
    );
    return data;
  },

  // Buscar avaliação por ID
  getById: async (id: number): Promise<Avaliacao> => {
    const { data } = await api.get<Avaliacao>(`/api/Avaliacoes/${id}`);
    return data;
  },

  // Criar nova avaliação
  create: async (avaliacao: CreateAvaliacaoInput): Promise<Avaliacao> => {
    const { data } = await api.post<Avaliacao>("/api/Avaliacoes", avaliacao);
    return data;
  },

  // Atualizar avaliação
  update: async (
    id: number,
    avaliacao: Partial<CreateAvaliacaoInput>
  ): Promise<Avaliacao> => {
    const { data } = await api.put<Avaliacao>(
      `/api/Avaliacoes/${id}`,
      avaliacao
    );
    return data;
  },

  // Deletar avaliação
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/Avaliacoes/${id}`);
  },
};
