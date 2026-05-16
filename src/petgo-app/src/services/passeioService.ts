import {
    PasseioCreateDto,
    PasseioResponseDto,
    TipoPasseioResponseDto,
    TipoPasseioCreateDto
} from '../types/passeio';
import { ApiResponse } from '../types/usuario';
import { api } from './api';

export const passeioService = {
    listarTiposPasseios: async (passeadorId?: string): Promise<TipoPasseioResponseDto[]> => {
        try {
            const url = passeadorId ? `/TiposPasseios?passeadorId=${passeadorId}` : '/TiposPasseios';
            const response = await api.get<ApiResponse<TipoPasseioResponseDto[]>>(url);
            return response.data.status ? response.data.dados : [];
        } catch (error) {
            console.error('Erro ao listar tipos de passeios:', error);
            throw error;
        }
    },

    criarTipoPasseio: async (dados: TipoPasseioCreateDto): Promise<TipoPasseioResponseDto> => {
        try {
            const response = await api.post<ApiResponse<TipoPasseioResponseDto>>('/TiposPasseios', dados);
            if (response.data.status) return response.data.dados;
            throw new Error(response.data.messagem || 'Erro ao criar tipo de passeio');
        } catch (error) {
            console.error('Erro ao criar tipo de passeio:', error);
            throw error;
        }
    },

    editarTipoPasseio: async (id: string, dados: TipoPasseioCreateDto): Promise<void> => {
        try {
            await api.put(`/TiposPasseios/${id}`, dados);
        } catch (error) {
            console.error('Erro ao editar tipo de passeio:', error);
            throw error;
        }
    },

    excluirTipoPasseio: async (id: string): Promise<void> => {
        try {
            await api.delete(`/TiposPasseios/${id}`);
        } catch (error) {
            console.error('Erro ao excluir tipo de passeio:', error);
            throw error;
        }
    },

    criarPasseio: async (dados: PasseioCreateDto): Promise<PasseioResponseDto> => {
        try {
            const response = await api.post<ApiResponse<PasseioResponseDto>>('/Passeios', dados);
            if (response.data.status) {
                return response.data.dados;
            }
            throw new Error(response.data.messagem || 'Erro ao criar passeio');
        } catch (error) {
            console.error('Erro ao agendar passeio:', error);
            throw error;
        }
    },

    listarMeusAgendamentos: async (): Promise<PasseioResponseDto[]> => {
        try {
            const response = await api.get<ApiResponse<PasseioResponseDto[]>>('/Passeios/meus-agendamentos');
            return response.data.status ? response.data.dados : [];
        } catch (error) {
            console.error('Erro ao buscar meus agendamentos:', error);
            throw error;
        }
    },

    listarMinhaAgenda: async (): Promise<PasseioResponseDto[]> => {
        try {
            const response = await api.get<ApiResponse<PasseioResponseDto[]>>('/Passeios/minha-agenda');
            return response.data.status ? response.data.dados : [];
        } catch (error) {
            console.error('Erro ao buscar minha agenda:', error);
            throw error;
        }
    },

    atualizarStatus: async (id: string, novoStatus: number): Promise<void> => {
        try {
            await api.patch(`/Passeios/atualizar-status/${id}?novoStatus=${novoStatus}`);
        } catch (error) {
            console.error('Erro ao atualizar status do passeio:', error);
            throw error;
        }
    }
};