import api from "../lib/api";
import { Pet, CreatePetInput, UpdatePetInput } from "../types";

class PetService {
  private readonly baseUrl = "/api/pets";

  async getAll(): Promise<Pet[]> {
    try {
      const response = await api.get<Pet[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar pets:", error);
      throw error;
    }
  }

  async getById(id: number): Promise<Pet> {
    try {
      const response = await api.get<Pet>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar pet ${id}:`, error);
      throw error;
    }
  }

  async getByUsuarioId(usuarioId: number): Promise<Pet[]> {
    try {
      const response = await api.get<Pet[]>(
        `${this.baseUrl}/usuario/${usuarioId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar pets do usuário ${usuarioId}:`, error);
      throw error;
    }
  }

  async create(pet: CreatePetInput): Promise<Pet> {
    try {
      const response = await api.post<Pet>(this.baseUrl, pet);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar pet:", error);
      throw error;
    }
  }

  async update(id: number, pet: UpdatePetInput): Promise<Pet> {
    try {
      const response = await api.put<Pet>(`${this.baseUrl}/${id}`, pet);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar pet ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar pet ${id}:`, error);
      throw error;
    }
  }

  async searchByLocation(cidade: string, estado: string): Promise<Pet[]> {
    try {
      const response = await api.get<Pet[]>(
        `${this.baseUrl}/search?cidade=${encodeURIComponent(
          cidade
        )}&estado=${encodeURIComponent(estado)}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar pets por localização:", error);
      throw error;
    }
  }
}

export const petService = new PetService();
