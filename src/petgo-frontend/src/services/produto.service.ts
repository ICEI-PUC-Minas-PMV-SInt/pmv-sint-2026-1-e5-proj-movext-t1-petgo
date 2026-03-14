import api from "../lib/api";
import {
  Produto,
  CreateProdutoInput,
  UpdateProdutoInput,
  ApiError,
} from "../types";

class ProdutoService {
  private readonly baseUrl = "/api/produtos";

  async getAll(page = 1, pageSize = 10): Promise<Produto[]> {
    try {
      const response = await api.get(
        `${this.baseUrl}?page=${page}&pageSize=${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      throw error;
    }
  }

  async getById(id: number): Promise<Produto> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error);
      throw error;
    }
  }

  async create(produto: CreateProdutoInput): Promise<Produto> {
    try {
      console.log("📤 Enviando produto para criação:", produto);
      const response = await api.post(this.baseUrl, produto);
      console.log("✅ Produto criado:", response.data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error("❌ Erro ao criar produto:", apiError);
      console.error("📋 Response data:", apiError?.details);
      throw error;
    }
  }

  async update(id: number, produto: UpdateProdutoInput): Promise<Produto> {
    try {
      // Log detalhado para debug
      console.log("📤 Enviando produto para atualização:");
      console.log("🆔 ID:", id);
      console.log("📋 Dados:", produto);

      // Garantir que o ID está correto
      const produtoComId = { ...produto, id };

      const response = await api.put(`${this.baseUrl}/${id}`, produtoComId);
      console.log("✅ Produto atualizado:", response.data);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error("❌ Erro ao atualizar produto:", apiError);
      console.error("🆔 ID tentativa:", id);
      console.error("📋 Dados enviados:", produto);
      console.error("📋 Response data:", apiError?.details);
      console.error("📋 Status:", apiError?.status);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar produto ${id}:`, error);
      throw error;
    }
  }

  async searchByName(name: string): Promise<Produto[]> {
    try {
      const response = await api.get(
        `${this.baseUrl}/search?name=${encodeURIComponent(name)}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar produtos por nome:", error);
      throw error;
    }
  }

  async getByCategory(categoryId: number): Promise<Produto[]> {
    try {
      const response = await api.get(`${this.baseUrl}/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar produtos por categoria:", error);
      throw error;
    }
  }
}

export const produtoService = new ProdutoService();
