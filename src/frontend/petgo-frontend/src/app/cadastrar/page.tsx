"use client";

import { Button } from "@/components/ui/Button";
import { CadastroFormData, useCadastroForm } from "./_components/CadastroForm";
import { extractPhoneNumber } from "@/lib/utils";
import { FormField } from "@/components/ui/FormField";
import { PhoneField } from "@/components/ui/PhoneField";
import { Clipboard } from "lucide-react";
import { ProfilePhotoInput } from "@/components/ProfilePhotoInput";
import { TipoUsuario } from "@/types";
import { useCadastroUsuario } from "@/hooks/useUsuario";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CadastroPage() {
  const form = useCadastroForm();
  const router = useRouter();

  const registerMutation = useCadastroUsuario();
  const fotoPerfilUrl = form.watch("fotoPerfil") as string | null;

  // Observar mudanças no tipo de usuário
  const tipoUsuario = form.watch("tipoUsuario");
  const isPasseador = tipoUsuario === TipoUsuario.PASSEADOR;

  const onFormSubmit = async (data: CadastroFormData) => {
    const extractValue = extractPhoneNumber(data.telefone || "");
    const { confirmarSenha, ...apiData } = data;

    const finalApiData = {
      ...apiData,
      telefone: extractValue,
      // Converter tiposServico de string[] para number[]
      tiposServico: apiData.tiposServico?.map((t) =>
        typeof t === "string" ? parseInt(t, 10) : t
      ),
    };

    try {
      await registerMutation.mutateAsync(finalApiData);

      form.reset();
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex justify-center items-center pt-5 space-x-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg">
          <Clipboard size={32} className="text-white" />
        </div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center ">
          Cadastre-se
        </h1>
      </div>

      <div className=" flex items-center justify-center p-4">
        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg space-y-4"
        >
          <ProfilePhotoInput
            name="fotoPerfil"
            currentUrl={fotoPerfilUrl}
            setValue={form.setValue}
          />

          <FormField
            label="Nome Completo"
            name="nome"
            register={form.register}
            errors={form.formState.errors}
            placeholder="Digite seu nome completo"
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            register={form.register}
            errors={form.formState.errors}
            placeholder="example@email.com"
          />

          <PhoneField
            label="Telefone"
            name="telefone"
            control={form.control}
            errors={form.formState.errors}
          />

          <div>
            <label
              htmlFor="tipoUsuario"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Tipo de Cadastro *
            </label>

            <select
              id="tipoUsuario"
              {...form.register("tipoUsuario", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
            >
              <option value={TipoUsuario.CLIENTE}>Sou Cliente</option>
              <option value={TipoUsuario.PASSEADOR}>Sou Passeador</option>
            </select>

            {form.formState.errors.tipoUsuario && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.tipoUsuario.message}
              </p>
            )}
          </div>

          {/* Campos específicos para passeadores */}
          {isPasseador && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
              <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                <Clipboard size={18} />
                <span>Informações do Passeador</span>
              </div>

              {/* Descrição */}
              <div>
                <label
                  htmlFor="descricaoPasseador"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Descrição do Perfil *
                </label>
                <textarea
                  id="descricaoPasseador"
                  {...form.register("descricaoPasseador")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Descreva sua experiência, habilidades e diferenciais como passeador de pets..."
                />
                {form.formState.errors.descricaoPasseador && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.descricaoPasseador.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 20 caracteres, máximo 1500 caracteres
                </p>
              </div>

              {/* Valor Cobrado */}
              <div>
                <label
                  htmlFor="valorCobradoPasseador"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  Valor Cobrado (R$/hora) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <input
                    id="valorCobradoPasseador"
                    type="number"
                    step="0.01"
                    {...form.register("valorCobradoPasseador", {
                      valueAsNumber: true,
                    })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                {form.formState.errors.valorCobradoPasseador && (
                  <p className="mt-1 text-sm text-red-600">
                    {form.formState.errors.valorCobradoPasseador.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Entre R$ 1,00 e R$ 10.000,00
                </p>
              </div>

              {/* Tipos de Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tipos de Serviço Oferecidos *
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
            </div>
          )}

          <FormField
            label="Senha"
            name="senha"
            type="password"
            register={form.register}
            errors={form.formState.errors}
            placeholder="Digite uma senha"
          />

          <FormField
            label="Confirmar Senha"
            name="confirmarSenha"
            type="password"
            register={form.register}
            errors={form.formState.errors}
            placeholder="Confirmar senha"
          />

          <Button
            type="submit"
            className="w-full  bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg hover:to-indigo-700 shadow-lg"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Carregando..." : "Cadastrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
