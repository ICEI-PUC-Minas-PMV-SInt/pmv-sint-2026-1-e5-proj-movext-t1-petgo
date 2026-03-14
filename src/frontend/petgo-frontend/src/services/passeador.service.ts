import api from "../lib/api";
import {
  Passeador,
  CreatePasseadorInput,
  UpdatePasseadorInput,
  TipoServico,
} from "../types";

class PasseadorService {
  private readonly baseUrl = "/api/passeadores";

  async getAll(): Promise<Passeador[]> {
    try {
      const response = await api.get<Passeador[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar passeadores:", error);
      throw error;
    }
  }

  async getById(id: number): Promise<Passeador> {
    try {
      const response = await api.get<Passeador>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar passeador ${id}:`, error);
      throw error;
    }
  }

  async search(name: string): Promise<Passeador[]> {
    try {
      const response = await api.get<Passeador[]>(`${this.baseUrl}/search`, {
        params: { name },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar passeadores:", error);
      throw error;
    }
  }

  async filterByService(tipoServico: TipoServico): Promise<Passeador[]> {
    try {
      const response = await api.get<Passeador[]>(
        `${this.baseUrl}/servico/${tipoServico}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao filtrar passeadores por serviço:", error);
      throw error;
    }
  }

  async create(passeador: CreatePasseadorInput): Promise<Passeador> {
    try {
      const response = await api.post<Passeador>(this.baseUrl, passeador);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar passeador:", error);
      throw error;
    }
  }

  async update(id: number, passeador: UpdatePasseadorInput): Promise<void> {
    try {
      await api.put(`${this.baseUrl}/${id}`, passeador);
    } catch (error) {
      console.error(`Erro ao atualizar passeador ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar passeador ${id}:`, error);
      throw error;
    }
  }
}

export const passeadorService = new PasseadorService();
