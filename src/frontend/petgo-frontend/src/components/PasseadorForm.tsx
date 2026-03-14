import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "./ui/Button";
import { FormField } from "./ui/FormField";
import { Passeador } from "../types";

// Schema de validação
const passeadorFormSchema = z.object({
  usuarioId: z.number().min(1, "ID do usuário é obrigatório"),
  descricao: z
    .string()
    .min(20, "A descrição deve ter pelo menos 20 caracteres")
    .max(1500, "A descrição deve ter no máximo 1500 caracteres"),
  valorCobrado: z
    .number()
    .min(1, "O valor deve ser no mínimo R$ 1,00")
    .max(10000, "O valor deve ser no máximo R$ 10.000,00"),
});

export type PasseadorFormData = z.infer<typeof passeadorFormSchema>;

interface PasseadorFormProps {
  passeador?: Passeador;
  onSubmit: (data: PasseadorFormData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function PasseadorForm({
  passeador,
  onSubmit,
  onClose,
  isLoading = false,
}: PasseadorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PasseadorFormData>({
    resolver: zodResolver(passeadorFormSchema),
    defaultValues: {
      usuarioId: passeador?.usuarioId || 0,
      descricao: passeador?.descricao || "",
      valorCobrado: passeador?.valorCobrado || 0,
    },
  });

  // Atualizar valores quando passeador mudar
  useEffect(() => {
    if (passeador) {
      setValue("usuarioId", passeador.usuarioId);
      setValue("descricao", passeador.descricao);
      setValue("valorCobrado", passeador.valorCobrado);
    }
  }, [passeador, setValue]);

  const handleFormSubmit = (data: PasseadorFormData) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {passeador
              ? "Editar Perfil de Passeador"
              : "Criar Perfil de Passeador"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 space-y-6"
        >
          {/* ID do Usuário (hidden quando editando) */}
          {!passeador && (
            <div>
              <FormField
                label="ID do Usuário"
                name="usuarioId"
                type="number"
                register={register}
                errors={errors}
                placeholder="Digite o ID do usuário"
              />
              <p className="mt-1 text-xs text-gray-500">
                ID do usuário que será vinculado ao perfil de passeador
              </p>
            </div>
          )}

          {/* Descrição */}
          <div>
            <label
              htmlFor="descricao"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Descrição *
            </label>
            <textarea
              id="descricao"
              {...register("descricao")}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Descreva sua experiência, habilidades e diferenciais como passeador de pets..."
            />
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600">
                {errors.descricao.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Mínimo 20 caracteres, máximo 1500 caracteres
            </p>
          </div>

          {/* Valor Cobrado */}
          <div>
            <label
              htmlFor="valorCobrado"
              className="block text-sm font-medium text-gray-900 mb-1"
            >
              Valor Cobrado (R$/hora) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                R$
              </span>
              <input
                id="valorCobrado"
                type="number"
                step="0.01"
                {...register("valorCobrado", { valueAsNumber: true })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            {errors.valorCobrado && (
              <p className="mt-1 text-sm text-red-600">
                {errors.valorCobrado.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Valor cobrado por hora de serviço (entre R$ 1,00 e R$ 10.000,00)
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
              disabled={isLoading}
            >
              {isLoading
                ? "Salvando..."
                : passeador
                ? "Atualizar"
                : "Criar Perfil"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
