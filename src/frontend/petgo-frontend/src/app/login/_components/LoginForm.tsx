"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("O formato do e-mail é inválido"),
  senha: z.string().min(1, "A senha é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export function useLoginForm() {
  return useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      senha: "",
    }
  });
}