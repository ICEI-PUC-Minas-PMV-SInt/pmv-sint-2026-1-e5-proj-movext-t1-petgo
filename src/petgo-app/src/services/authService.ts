import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

// 1. O que o seu "UsuarioLoginDto" espera receber
interface UsuarioLoginDto {
    Email: string;
    Senha: string;
}

interface LoginResponseDto {
    token: string;
    usuarioId: string;
    usuarioTipo: string;
}

interface ApiResponse<T> {
    dados: T;
    status: boolean;
    messagem: string;
}

const TOKEN_KEY = "@PetGo:token";
const USER_ID_KEY = "@PetGo:userId";
const USER_TYPE_KEY = "@PetGo:userType";

// Função auxiliar para decodificar JWT sem dependências externas
function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // No React Native/Expo, atob está disponível globalmente ou via shim
        const jsonPayload = decodeURIComponent(
            global.atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export const authService = {
    login: async (dados: UsuarioLoginDto): Promise<LoginResponseDto> => {
        try {
            const response = await api.post<ApiResponse<LoginResponseDto>>("/usuarios/login", dados);

            const { status, dados: loginData, messagem } = response.data;

            if (!status || !loginData) {
                throw new Error(messagem || "Email ou senha incorretos.");
            }

            const { token, usuarioId, usuarioTipo } = loginData;

            await AsyncStorage.setItem(TOKEN_KEY, token);
            await AsyncStorage.setItem(USER_ID_KEY, usuarioId);
            await AsyncStorage.setItem(USER_TYPE_KEY, usuarioTipo);

            return loginData;
        } catch (error: any) {
            console.error("Erro no processo de login:", error);
            const mensagemErro = error.response?.data?.messagem || "Erro ao conectar com o servidor.";
            throw new Error(mensagemErro);
        }
    },

    obterToken: async (): Promise<string | null> => {
        return await AsyncStorage.getItem(TOKEN_KEY);
    },

    obterUserId: async (): Promise<string | null> => {
        let id = await AsyncStorage.getItem(USER_ID_KEY);
        
        // Se o ID não estiver no storage mas o token estiver, tentamos decodificar o token
        // Isso evita que o usuário seja deslogado após uma atualização do app
        if (!id) {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (token) {
                const decoded = parseJwt(token);
                // No ASP.NET Core, o ID do usuário costuma vir no claim 'nameid' ou 'sub'
                id = decoded?.nameid || decoded?.sub || null;
                if (id) {
                    await AsyncStorage.setItem(USER_ID_KEY, id);
                }
            }
        }
        return id;
    },

    obterUserType: async (): Promise<string | null> => {
        let type = await AsyncStorage.getItem(USER_TYPE_KEY);
        if (!type) {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            if (token) {
                const decoded = parseJwt(token);
                // No seu back-end, o tipo/role vem no claim 'role'
                type = decoded?.role || null;
                if (type) {
                    await AsyncStorage.setItem(USER_TYPE_KEY, type);
                }
            }
        }
        return type;
    },

    logout: async (): Promise<void> => {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_ID_KEY, USER_TYPE_KEY]);
    }
};