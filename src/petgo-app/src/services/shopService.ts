import { ApiResponse } from '../types/usuario';
import { ProdutoResponseDto, PedidoResponseDto, PedidoCreateDto } from '../types/shop';
import { api } from './api';

export const shopService = {
    // Produtos
    listarProdutos: async (): Promise<ProdutoResponseDto[]> => {
        try {
            const response = await api.get<ProdutoResponseDto[]>('/Produtos');
            // Nota: O backend do Produtos parece retornar List diretamente ou ApiResponse dependendo do endpoint
            // No Get ele retorna ActionResult<List<ProdutoResponseDto>>
            return response.data;
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
    }
};
