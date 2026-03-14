import axios, { AxiosError, AxiosResponse } from "axios";
import { ApiError, ApiResponse } from "../types";

// Configuração base da API
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5021",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      // Força a inclusão do token, eliminando a condição de verificação
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor para tratamento de erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error("❌ Response Error:", error);

    const apiError: ApiError = {
      message: error.message || "Erro desconhecido",
      status: error.response?.status || 500,
      details: error.response?.data,
    };

    // Tratamento específico por status code
    switch (error.response?.status) {
      case 401:
        // Redirecionar para login quando implementar autenticação
        apiError.message = "Não autorizado. Faça login novamente.";
        break;
      case 403:
        apiError.message = "Acesso negado.";
        break;
      case 404:
        apiError.message = "Recurso não encontrado.";
        break;
      case 422:
        apiError.message = "Dados inválidos.";
        break;
      case 500:
        apiError.message = "Erro interno do servidor.";
        break;
      default:
        apiError.message =
          (error.response?.data as { message?: string })?.message ||
          error.message;
    }

    return Promise.reject(apiError);
  }
);

export default api;

// Helper functions para facilitar o uso
export const apiClient = {
  get: <T>(url: string) => api.get<ApiResponse<T>>(url),
  post: <T>(url: string, data?: unknown) => api.post<ApiResponse<T>>(url, data),
  put: <T>(url: string, data?: unknown) => api.put<ApiResponse<T>>(url, data),
  patch: <T>(url: string, data?: unknown) =>
    api.patch<ApiResponse<T>>(url, data),
  delete: <T>(url: string) => api.delete<ApiResponse<T>>(url),
};
