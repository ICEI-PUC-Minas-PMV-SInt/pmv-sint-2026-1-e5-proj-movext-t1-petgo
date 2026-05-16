import { ApiResponse, UsuarioCreateDto, UsuarioResponseDto, UsuarioUpdateDto } from '../types/usuario';
import { api } from './api';

export const usuarioService = {

    listarPasseadores: async (): Promise<UsuarioResponseDto[]> => {
        try {
            const response = await api.get<ApiResponse<UsuarioResponseDto[]>>('/usuarios');
            if (response.data.status && response.data.dados) {
                return response.data.dados.filter(u => u.tipo === 'Passeador');
            }

            return [];
        } catch (error) {
            console.error('Erro ao buscar passeadores no usuarioService:', error);
            throw error;
        }
    },

    buscarPorId: async (id: string): Promise<UsuarioResponseDto | null> => {
        try {
            // Padronizando para letras minúsculas conforme o restante das rotas
            const response = await api.get<ApiResponse<UsuarioResponseDto>>(`/usuarios/${id}`);
            if (response.data.status) {
                return response.data.dados;
            }
            return null;
        } catch (error) {
            console.error(`Erro ao buscar usuário ${id}:`, error);
            throw error;
        }
    },

    criarUsuario: async (dados: UsuarioCreateDto): Promise<UsuarioResponseDto> => {
        try {
            const response = await api.post<ApiResponse<UsuarioResponseDto>>('/usuarios', dados);
            
            if (response.data.status) {
                return response.data.dados;
            }
            
            throw new Error(response.data.messagem || "Erro ao criar usuário.");
        } catch (error: any) {
            console.error('Erro ao criar usuário:', error);
            const mensagemErro = error.response?.data?.messagem || error.message || "Erro ao conectar com o servidor.";
            throw new Error(mensagemErro);
        }
    },

    editarUsuario: async (id: string, dados: UsuarioUpdateDto): Promise<UsuarioResponseDto> => {
        try {
            const response = await api.put<ApiResponse<UsuarioResponseDto>>(`/usuarios/${id}`, dados);
            
            if (response.data.status) {
                return response.data.dados;
            }
            
            throw new Error(response.data.messagem || "Erro ao editar usuário.");
        } catch (error: any) {
            console.error('Erro ao editar usuário:', error);
            const mensagemErro = error.response?.data?.messagem || error.message || "Erro ao conectar com o servidor.";
            throw new Error(mensagemErro);
        }
    }
};