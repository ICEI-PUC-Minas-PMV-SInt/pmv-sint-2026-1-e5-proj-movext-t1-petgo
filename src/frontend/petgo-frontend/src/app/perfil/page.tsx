"use client";

import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  UpdateProfileFormData,
  useUpdateProfileForm,
} from "./_components/PerfilForm";
import { TipoUsuario } from "@/types";
import { useUpdateUsuario } from "@/hooks/useUsuario";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PhoneField } from "@/components/ui/PhoneField";
import { ProfilePhotoInput } from "@/components/ProfilePhotoInput";
import { formatPhone } from "@/lib/utils";

export default function PerfilPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const form = useUpdateProfileForm({ currentUser: user });
  const updateMutation = useUpdateUsuario();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Atualizar os valores do formulário quando o user mudar
  useEffect(() => {
    if (user) {
      const isPasseador = user.tipo === TipoUsuario.PASSEADOR;
      form.reset({
        nome: user.nome,
        telefone: user.telefone ? formatPhone(user.telefone) : "",
        fotoPerfil: user.fotoPerfil || null,
        descricao:
          isPasseador && user.passeador ? user.passeador.descricao : null,
        valorCobrado:
          isPasseador && user.passeador ? user.passeador.valorCobrado : null,
        tiposServico:
          isPasseador && user.passeador?.servicos
            ? user.passeador.servicos.map((s) => s.tipoServico.toString())
            : [],
      });
    }
  }, [user, form]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <h1 className="text-black text-xl">
          {isLoading ? "Carregando perfil..." : "Redirecionando para login..."}
        </h1>
      </div>
    );
  }

  const isPasseador = user.tipo === TipoUsuario.PASSEADOR;

  const onFormSubmit = async (data: UpdateProfileFormData) => {
    // Converter tiposServico de string[] para number[]
    const processedData = {
      ...data,
      tiposServico: data.tiposServico?.map((t) =>
        typeof t === "string" ? parseInt(t, 10) : t
      ),
    };

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        data: processedData,
      });
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex justify-center items-center pt-5 space-x-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center">
          Editar Perfil
        </h1>
      </div>

      <div className="flex items-center justify-center p-4">
        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="w-full max-w-lg p-8 bg-white rounded-xl shadow-2xl space-y-6"
        >
          {/* ➡️ INPUT DE FOTO DE PERFIL */}
          <div className="flex justify-center mb-6">
            <ProfilePhotoInput
              name="fotoPerfil"
              currentUrl={user.fotoPerfil} // URL atual do usuário
              setValue={form.setValue} // Função setValue do react-hook-form
            />
          </div>

          {/* ➡️ Campos Básicos */}
          <FormField
            label="Nome"
            name="nome"
            type="text"
            register={form.register}
            errors={form.formState.errors}
            placeholder="Seu nome completo" // Adicione placeholder para o FormField
          />

          {/* ➡️ INPUT DE TELEFONE (Usando PhoneField com formatação) */}
          <PhoneField
            label="Telefone"
            name="telefone"
            control={form.control} // Use o control do react-hook-form
            errors={form.formState.errors}
          />

          {/* ➡️ Campos Condicionais para Passeador */}
          {isPasseador && (
            <>
              <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 pt-4">
                Dados do Passeador
              </h2>

              <FormField
                label="Descrição Profissional"
                name="descricao"
                type="textarea"
                register={form.register}
                errors={form.formState.errors}
                placeholder="Descreva seus serviços e experiência"
              />

              <div>
                <label
                  htmlFor="valorCobrado"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Valor Cobrado por Serviço (R$)
                </label>
                <input
                  id="valorCobrado"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("valorCobrado", { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 ${
                    form.formState.errors.valorCobrado
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {form.formState.errors.valorCobrado && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.valorCobrado.message}
                  </p>
                )}
              </div>

              {/* Tipos de Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tipos de Serviço Oferecidos
                </label>
                <div className="space-y-2">
                  {[
                    { value: 0, label: "Passeio" },
                    { value: 1, label: "Cuidado Diário" },
                    { value: 2, label: "Hospedagem" },
                    { value: 3, label: "Outro" },
                  ].map((servico) => (
                    <label
                      key={servico.value}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        value={servico.value}
                        {...form.register("tiposServico")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {servico.label}
                      </span>
                    </label>
                  ))}
                </div>
                {form.formState.errors.tiposServico && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.tiposServico.message}
                  </p>
                )}
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 text-white py-3"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Salvando..." : "Atualizar Perfil"}
          </Button>
        </form>
      </div>
    </div>
  );
}
