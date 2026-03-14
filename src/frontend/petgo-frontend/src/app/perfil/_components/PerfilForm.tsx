"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TipoUsuario, Usuario } from "@/types";
import { formatPhone } from "@/lib/utils";

const UpdateProfileSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  telefone: z.string().min(15, "O telefone é obrigatório (com DDD)"),
  fotoPerfil: z.string().optional().nullable(),

  descricao: z
    .string()
    .max(500, "A descrição não pode ter mais de 500 caracteres")
    .optional()
    .nullable(),
  valorCobrado: z
    .number()
    .min(0, "O valor deve ser igual ou maior que 0")
    .max(1000, "O valor não pode ser maior que 1000")
    .optional()
    .nullable(),
  tiposServico: z.array(z.union([z.string(), z.number()])).optional(),
});

export type UpdateProfileFormData = z.infer<typeof UpdateProfileSchema>;

interface UseUpdateProfileFormProps {
  currentUser: Usuario | null | undefined;
}

export function useUpdateProfileForm({
  currentUser,
}: UseUpdateProfileFormProps) {
  const isPasseador = currentUser?.tipo == TipoUsuario.PASSEADOR;

  const defaultValues: UpdateProfileFormData = {
    nome: currentUser?.nome ?? "",
    telefone: currentUser?.telefone ? formatPhone(currentUser.telefone) : "",
    fotoPerfil: currentUser?.fotoPerfil || null, // Garante que seja null se for string vazia

    // Campos condicionais para Passeador
    descricao:
      isPasseador && currentUser?.passeador
        ? currentUser.passeador.descricao
        : null,

    valorCobrado:
      isPasseador && currentUser?.passeador
        ? currentUser.passeador.valorCobrado
        : null,

    tiposServico:
      isPasseador && currentUser?.passeador?.servicos
        ? currentUser.passeador.servicos.map((s) => s.tipoServico.toString())
        : [],
  };

  // O valor Cobrado no Zod é number, mas o input do formulário pode ser string.
  // O React Hook Form e o ZodResolver lidam com isso (especialmente com valueAsNumber: true)

  return useForm<UpdateProfileFormData>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: defaultValues,
    mode: "onBlur", // Boa prática para validação
  });
}
