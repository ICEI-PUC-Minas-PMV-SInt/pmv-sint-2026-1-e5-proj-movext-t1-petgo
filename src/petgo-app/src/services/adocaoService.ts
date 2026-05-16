import { ApiResponse } from '../types/usuario';
import { AdocaoResponseDto, AdocaoCreateDto, AdocaoStatusUpdateDto } from '../types/adocao';
import { api } from './api';

export const adocaoService = {
    solicitarAdocao: async (dados: AdocaoCreateDto): Promise<AdocaoResponseDto> => {
        try {
            const response = await api.post<ApiResponse<AdocaoResponseDto>>('/Adocoes/solicitar', dados);
            if (response.data.status) return response.data.dados;
            throw new Error(response.data.messagem || 'Erro ao solicitar adoção');
        } catch (error) {
            console.error('Erro ao solicitar adoção:', error);
            throw error;
        }
    },

    listarMinhasSolicitacoes: async (): Promise<AdocaoResponseDto[]> => {
        try {
            const response = await api.get<ApiResponse<AdocaoResponseDto[]>>('/Adocoes/minhas-solicitacoes');
            return response.data.status ? response.data.dados : [];
        } catch (error) {
            console.error('Erro ao listar minhas solicitações:', error);
            throw error;
        }
    },

    listarSolicitacoesRecebidas: async (): Promise<AdocaoResponseDto[]> => {
        try {
            const response = await api.get<ApiResponse<AdocaoResponseDto[]>>('/Adocoes/solicitacoes-recebidas');
            return response.data.status ? response.data.dados : [];
        } catch (error) {
            console.error('Erro ao listar solicitações recebidas:', error);
            throw error;
        }
    },

    alterarStatus: async (id: string, novoStatus: number): Promise<void> => {
        try {
            await api.put(`/Adocoes/${id}/status`, { novoStatus });
        } catch (error) {
            console.error('Erro ao alterar status da adoção:', error);
            throw error;
        }
    }
};
