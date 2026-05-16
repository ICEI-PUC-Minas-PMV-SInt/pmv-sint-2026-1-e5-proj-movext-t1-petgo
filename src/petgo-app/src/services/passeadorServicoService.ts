import { ApiResponse } from '../types/usuario';
import { PasseadorServicoResponseDto, PasseadorServicoCreateDto } from '../types/passeadorServico';
import { api } from './api';

export const passeadorServicoService = {
    listarPorPasseador: async (passeadorId: string): Promise<PasseadorServicoResponseDto[]> => {
        try {
            const response = await api.get<ApiResponse<PasseadorServicoResponseDto[]>>(`/PasseadorServicos/${passeadorId}`);
            return response.data.status ? response.data.dados : [];
        } catch (error) {
            console.error('Erro ao listar serviços do passeador:', error);
            throw error;
        }
    },

    salvarPreco: async (dados: PasseadorServicoCreateDto): Promise<PasseadorServicoResponseDto> => {
        try {
            const response = await api.post<ApiResponse<PasseadorServicoResponseDto>>('/PasseadorServicos', dados);
            if (response.data.status) return response.data.dados;
            throw new Error(response.data.messagem || 'Erro ao salvar preço');
        } catch (error) {
            console.error('Erro ao salvar preço do serviço:', error);
            throw error;
        }
    },

    excluirPreco: async (id: string): Promise<void> => {
        try {
            await api.delete(`/PasseadorServicos/${id}`);
        } catch (error) {
            console.error('Erro ao excluir preço do serviço:', error);
            throw error;
        }
    }
};
