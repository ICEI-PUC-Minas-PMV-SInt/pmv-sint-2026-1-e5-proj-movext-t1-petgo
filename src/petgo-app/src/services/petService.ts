import { PetResponseDto, PetCreateDto } from "../types/pet";
import { api } from "./api";
import { authService } from "./authService";

export enum Especie {
  Cachorro = 0,
  Gato = 1,
  Outros = 2,
}

export enum StatusPet {
  DisponivelPasseio = 0,
  DisponivelAdocao = 1,
  Adotado = 2,
  EmPasseio = 3
}

export const petService = {
  listarPets: async (): Promise<PetResponseDto[]> => {
    try {
      const response = await api.get("/pets");
      return response.data.dados || [];
    } catch (error) {
      console.error("Erro ao listar todos os pets:", error);
      throw error;
    }
  },

  listarMeusPets: async (): Promise<PetResponseDto[]> => {
    try {
      const response = await api.get("/pets/meus-pets");
      return response.data.dados || [];
    } catch (error) {
      console.error("Erro ao listar meus pets:", error);
      throw error;
    }
  },

  criarPet: async (pet: PetCreateDto): Promise<PetResponseDto> => {
    try {
      const userId = await authService.obterUserId();
      const response = await api.post("/pets", {
        ...pet,
        usuarioId: userId,
      });
      return response.data.dados;
    } catch (error) {
      console.error("Erro ao criar pet:", error);
      throw error;
    }
  },

  editarPet: async (id: string, pet: Partial<PetCreateDto>): Promise<void> => {
    try {
        await api.put(`/pets/${id}`, pet);
    } catch (error) {
        console.error("Erro ao editar pet:", error);
        throw error;
    }
  },

  alterarStatus: async (id: string, novoStatus: StatusPet): Promise<void> => {
      try {
          await api.put(`/pets/${id}/status`, { novoStatus });
      } catch (error) {
          console.error("Erro ao alterar status do pet:", error);
          throw error;
      }
  },

  excluirPet: async (id: string): Promise<void> => {
    try {
      await api.delete(`/pets/${id}`);
    } catch (error) {
      console.error("Erro ao excluir pet:", error);
      throw error;
    }
  },
};
