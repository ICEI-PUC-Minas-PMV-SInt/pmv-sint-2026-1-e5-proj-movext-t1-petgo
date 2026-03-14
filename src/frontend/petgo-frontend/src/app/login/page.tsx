"use client";

import { FormField } from "@/components/ui/FormField";
import { LogInIcon } from "lucide-react";
import { LoginFormData, useLoginForm } from "./_components/LoginForm";
import { useRouter } from "next/navigation";
import { useLoginUsuario } from "@/hooks/useUsuario";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function LoginPage() {
  const form = useLoginForm();
  const router = useRouter();

  const loginMutation = useLoginUsuario();

  const onFormSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      form.reset();
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err) {
      console.error("Erro capturado no componente:", err);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex justify-center items-center pt-5 space-x-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
            <LogInIcon size={32} className="text-white" />
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center ">
            Login
          </h1>
        </div>

        <div className=" flex items-center justify-center p-4">
          <form
            onSubmit={form.handleSubmit(onFormSubmit)}
            className="w-full max-w-xs p-6 bg-white rounded-xl shadow-lg space-y-4"
          >
            <FormField
              label="Email"
              name="email"
              type="email"
              register={form.register}
              errors={form.formState.errors}
              placeholder="Digite seu email"
            />
            <FormField
              label="Senha"
              name="senha"
              type="password"
              register={form.register}
              errors={form.formState.errors}
              placeholder="Digite sua senha"
            />
            <Link href="/cadastrar">
            <p 
            className="relative font-semibold text-sm mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:underline hover:decoration-indigo-600"
            >
              Não tem conta? Cadastre-se agora
              </p>
            </Link>
            <Button
              type="submit"
              className="w-full  bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg hover:to-indigo-700 shadow-lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Carregando..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
  );
}
