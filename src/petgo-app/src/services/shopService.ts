import { ApiResponse } from '../types/usuario';
import { ProdutoResponseDto, PedidoResponseDto, PedidoCreateDto } from '../types/shop';
import { api } from './api';

export const shopService = {
    // Produtos
    listarProdutos: async (): Promise<ProdutoResponseDto[]> => {
        try {
            const response = await api.get<ApiResponse<ProdutoResponseDto[]>>('/Produtos');
            return response.data.dados || [];
        } catch (error) {
            console.error('Erro ao listar produtos:', error);
            throw error;
        }
    },

    getProdutoById: async (id: string): Promise<ProdutoResponseDto> => {
        try {
            const response = await api.get<ApiResponse<ProdutoResponseDto>>(`/Produtos/${id}`);
            if (response.data.status) return response.data.dados;
            throw new Error(response.data.messagem);
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            throw error;
        }
    },

    criarProduto: async (dados: ProdutoCreateDto): Promise<ProdutoResponseDto> => {
        try {
            const response = await api.post<ApiResponse<ProdutoResponseDto>>('/Produtos', dados);
            if (response.data.status) return response.data.dados;
            throw new Error(response.data.messagem || 'Erro ao criar produto');
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            throw error;
        }
    },

    editarProduto: async (id: string, dados: ProdutoCreateDto): Promise<ProdutoResponseDto> => {
        try {
            const response = await api.put<ApiResponse<ProdutoResponseDto>>(`/Produtos/${id}`, dados);
            if (response.data.status) return response.data.dados;
            throw new Error(response.data.messagem || 'Erro ao editar produto');
        } catch (error) {
            console.error('Erro ao editar produto:', error);
            throw error;
        }
    },

    excluirProduto: async (id: string): Promise<void> => {
        try {
            const response = await api.delete<ApiResponse<boolean>>(`/Produtos/${id}`);
            if (!response.data.status) throw new Error(response.data.messagem || 'Erro ao excluir produto');
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            throw error;
        }
    },

    // Pedidos
    criarPedido: async (dados: PedidoCreateDto): Promise<PedidoResponseDto> => {
        try {
            const response = await api.post<ApiResponse<PedidoResponseDto>>('/Pedidos', dados);
            if (response.data.status) return response.data.dados;
            throw new Error(response.data.messagem || 'Erro ao realizar pedido');
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            throw error;
        }
    },

    listarMeusPedidos: async (): Promise<PedidoResponseDto[]> => {
        try {
            const response = await api.get<ApiResponse<PedidoResponseDto[]>>('/Pedidos/meus-pedidos');
            return response.data.status ? response.data.dados : [];
        } catch (error) {
            console.error('Erro ao listar meus pedidos:', error);
            throw error;
        }
    },

    pagarPedido: async (id: string): Promise<void> => {
        try {
            await api.put(`/Pedidos/pagar/${id}`);
        } catch (error) {
            console.error('Erro ao pagar pedido:', error);
            throw error;
        }
    },

    listarMinhasVendas: async (): Promise<PedidoResponseDto[]> => {
        try {
            const response = await api.get<ApiResponse<PedidoResponseDto[]>>('/Pedidos/minhas-vendas');
            return response.data.status ? response.data.dados : [];
        } catch (error) {
            console.error('Erro ao listar minhas vendas:', error);
            throw error;
        }
    },

    atualizarStatusPedido: async (id: string, novoStatus: number): Promise<void> => {
        try {
            const response = await api.patch(`/Pedidos/atualizar-status/${id}?novoStatus=${novoStatus}`);
            if (!response.data.status) throw new Error(response.data.messagem || 'Erro ao atualizar status');
        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
            throw error;
        }
    }
};
