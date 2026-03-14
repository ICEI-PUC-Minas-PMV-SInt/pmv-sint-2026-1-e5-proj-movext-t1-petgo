import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usuarioService } from "../services/usuario.service";
import { Usuario, ApiError, LoginResponseDto, TipoUsuario } from "../types";
import { CadastroFormData } from "@/app/cadastrar/_components/CadastroForm";
import { toast } from "sonner";
import { LoginFormData } from "@/app/login/_components/LoginForm";
import { useAuth } from "@/components/AuthContext";
import { UpdateProfileFormData } from "@/app/perfil/_components/PerfilForm";

export const USUARIO_QUERY_KEYS = {
  all: ["usuarios"] as const,
  login: ["login"] as const,
};

interface UpdateMutationPayload {
  id: number;
  data: UpdateProfileFormData;
}

export function useCadastroUsuario() {
  return useMutation({
    mutationFn: (data: Omit<CadastroFormData, "confirmarSenha">) =>
      usuarioService.register(data),

    onSuccess: (newUsuario: Usuario) => {
      console.log("✅ Usuário registrado com sucesso:", newUsuario.nome);

      toast.success(`Bem-vindo(a), ${newUsuario.nome}! Cadastro concluído.`);
    },

    onError: (error: ApiError) => {
      console.error("🚨 Erro de Registro (API):", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Ocorreu um erro no servidor ao tentar registrar.";

      toast.error(errorMessage);

      throw new Error(errorMessage);
    },
  });
}

export function useLoginUsuario() {
  const { loginContext } = useAuth();

  return useMutation<LoginResponseDto, ApiError, LoginFormData>({
    mutationFn: (data) => usuarioService.login(data),

    onSuccess: (data) => {
      loginContext(data.token, data.usuario);

      toast.success("Login realizado com sucesso!");
    },

    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Email ou senha inválidos.";
      toast.error(errorMessage);
    },
  });
}

export function useUpdateUsuario() {
  const { loginContext } = useAuth();
  const queryClient = useQueryClient();

  // A mutação agora espera um objeto com { id, data }
  return useMutation<Usuario, ApiError, UpdateMutationPayload>({
    mutationFn: ({ id, data }) => usuarioService.update(id, data),

    onSuccess: (updatedUsuario: Usuario) => {
      // CORREÇÃO FINAL: Passamos NULL para o token, mantendo a sessão,
      // e atualizamos apenas o objeto do usuário.
      loginContext(null, updatedUsuario);

      queryClient.invalidateQueries({ queryKey: ["usuario", "me"] });

      // Se o usuário atualizado for um passeador, invalidar a lista de passeadores
      if (updatedUsuario.tipo === TipoUsuario.PASSEADOR) {
        queryClient.invalidateQueries({ queryKey: ["passeadores"] });
      }

      toast.success("Perfil atualizado com sucesso!");
    },

    onError: (error: ApiError) => {
      // ... (restante da lógica de erro)
      const errorMessage =
        error.response?.data?.message ||
        "Ocorreu um erro ao tentar atualizar o perfil.";
      toast.error(errorMessage);
    },
  });
}
