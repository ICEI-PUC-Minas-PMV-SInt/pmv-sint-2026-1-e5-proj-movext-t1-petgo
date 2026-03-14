"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TipoUsuario } from "@/types";

// Schema de validação com campos condicionais para passeadores
const cadastroFormSchema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
    email: z
      .string()
      .min(1, "Email é obrigatório")
      .email("O formato do e-mail é inválido"),
    telefone: z.string().min(15, "O telefone é obrigatório (com DDD)"),
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmarSenha: z.string().min(6, "A confirmação da senha é obrigatória"),
    tipoUsuario: z
      .nativeEnum(TipoUsuario)
      .refine((val) => val !== TipoUsuario.ADMIN, {
        message: "Tipo de usuário inválido.",
      }),
    fotoPerfil: z.string().optional().nullable(),
    // Campos específicos para passeadores
    descricaoPasseador: z.string().optional(),
    valorCobradoPasseador: z.number().optional(),
    tiposServico: z.array(z.union([z.string(), z.number()])).optional(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  })
  .refine(
    (data) => {
      // Se for passeador, descrição é obrigatória
      if (data.tipoUsuario === TipoUsuario.PASSEADOR) {
        return data.descricaoPasseador && data.descricaoPasseador.length >= 20;
      }
      return true;
    },
    {
      message: "A descrição deve ter no mínimo 20 caracteres",
      path: ["descricaoPasseador"],
    }
  )
  .refine(
    (data) => {
      // Se for passeador, valor cobrado é obrigatório
      if (data.tipoUsuario === TipoUsuario.PASSEADOR) {
        return data.valorCobradoPasseador && data.valorCobradoPasseador >= 1;
      }
      return true;
    },
    {
      message: "O valor cobrado é obrigatório (mínimo R$ 1,00)",
      path: ["valorCobradoPasseador"],
    }
  )
  .refine(
    (data) => {
      // Se for passeador, pelo menos um tipo de serviço é obrigatório
      if (data.tipoUsuario === TipoUsuario.PASSEADOR) {
        return data.tiposServico && data.tiposServico.length > 0;
      }
      return true;
    },
    {
      message: "Selecione pelo menos um tipo de serviço",
      path: ["tiposServico"],
    }
  );

export type CadastroFormData = z.infer<typeof cadastroFormSchema>;

export type CadastroApiData = Omit<CadastroFormData, "confirmarSenha">;

export interface CadastroFormProps {
  onSubmit: (data: CadastroApiData) => void;
  isLoading?: boolean;
  title?: string;
}

export function useCadastroForm() {
  return useForm<CadastroFormData>({
    resolver: zodResolver(cadastroFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      senha: "",
      confirmarSenha: "",
      tipoUsuario: TipoUsuario.CLIENTE,
      fotoPerfil: null,
      descricaoPasseador: "",
      valorCobradoPasseador: undefined,
      tiposServico: [],
    },
  });
}
