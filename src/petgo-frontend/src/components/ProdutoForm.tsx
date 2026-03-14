"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/Button";
import { LoadingSpinner } from "./ui/LoadingSpinner";
import { X, Trash2, Image as ImageIcon, Upload } from "lucide-react";
import { StatusProduto, Produto } from "../types";

// Schema de validação
const produtoFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  descricao: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(500, "Descrição muito longa"),
  preco: z.number().min(0.01, "Preço deve ser maior que zero"),
  estoque: z.number().int().min(0, "Estoque não pode ser negativo"),
  categoriaId: z.number().min(1, "Categoria é obrigatória"),
  categoriaProdutoId: z.number().min(1, "Categoria é obrigatória"),
  status: z.nativeEnum(StatusProduto),
  imagens: z.array(z.string()).optional(),
});

type ProdutoFormData = z.infer<typeof produtoFormSchema>;

interface ProdutoFormProps {
  produto?: Produto;
  onSubmit: (data: ProdutoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  title: string;
}

// Categorias mock - depois substituir por API
const CATEGORIAS_MOCK = [
  { id: 1, nome: "Ração e Alimentação" },
  { id: 2, nome: "Brinquedos" },
  { id: 3, nome: "Acessórios" },
  { id: 4, nome: "Higiene e Cuidados" },
  { id: 5, nome: "Coleiras e Guias" },
];

export function ProdutoForm({
  produto,
  onSubmit,
  onCancel,
  isLoading,
  title,
}: ProdutoFormProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoFormSchema),
    defaultValues: produto
      ? {
          nome: produto.nome,
          descricao: produto.descricao,
          preco: produto.preco,
          estoque: produto.estoque,
          categoriaId: produto.categoriaId || produto.categoriaProdutoId,
          categoriaProdutoId: produto.categoriaProdutoId || produto.categoriaId,
          status: produto.status,
          imagens: produto.imagens || [],
        }
      : {
          nome: "",
          descricao: "",
          preco: 0,
          estoque: 0,
          categoriaId: 1,
          categoriaProdutoId: 1,
          status: StatusProduto.RASCUNHO,
          imagens: [],
        },
  });

  const imagens = watch("imagens") || [];

  // Função para converter arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle upload de múltiplas imagens do computador
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validar tipo de arquivo
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} não é um arquivo de imagem válido`);
        }

        // Validar tamanho do arquivo (máximo 2MB)
        if (file.size > 2 * 1024 * 1024) {
          throw new Error(`${file.name} é muito grande. Máximo 2MB.`);
        }

        // Converter para base64
        return await fileToBase64(file);
      });

      const base64Images = await Promise.all(uploadPromises);

      setValue("imagens", [...imagens, ...base64Images]);
    } catch (error) {
      console.error("Erro ao fazer upload das imagens:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao fazer upload das imagens. Tente novamente.";
      alert(errorMessage);
    } finally {
      setUploadingImage(false);
      // Limpar o input
      event.target.value = "";
    }
  };

  const handleImageRemove = (index: number) => {
    setValue(
      "imagens",
      imagens.filter((_, i) => i !== index)
    );
  };

  const onFormSubmit = (data: ProdutoFormData) => {
    // Prevenir double-submit
    if (isSubmitting || isLoading) {
      console.warn("⚠️ Formulário já está sendo enviado");
      return;
    }

    setIsSubmitting(true);

    const formattedData = {
      ...data,
      categoriaId: data.categoriaProdutoId,
    };

    onSubmit(formattedData);

    // Reset após 3 segundos (fallback)
    setTimeout(() => setIsSubmitting(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Nome do Produto *
            </label>
            <input
              {...register("nome")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              placeholder="Ex: Ração Premium para Cães"
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Descrição *
            </label>
            <textarea
              {...register("descricao")}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              placeholder="Descreva as características e benefícios do produto..."
            />
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600">
                {errors.descricao.message}
              </p>
            )}
          </div>

          {/* Preço e Estoque */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Preço (R$) *
              </label>
              <input
                {...register("preco", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="0,00"
              />
              {errors.preco && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.preco.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Estoque *
              </label>
              <input
                {...register("estoque", { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="0"
              />
              {errors.estoque && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.estoque.message}
                </p>
              )}
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Categoria *
            </label>
            <select
              {...register("categoriaProdutoId", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              {CATEGORIAS_MOCK.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
            {errors.categoriaProdutoId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.categoriaProdutoId.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Status *
            </label>
            <select
              {...register("status", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value={StatusProduto.RASCUNHO}>Rascunho</option>
              <option value={StatusProduto.ATIVO}>Ativo</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Imagens - CORRIGIDO */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Imagens do Produto
            </label>
            <div className="space-y-4">
              {/* Preview das imagens */}
              {imagens.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imagens.map((base64Image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-24 rounded-lg border-2 border-gray-200 bg-gray-100 overflow-hidden">
                        <Image
                          src={base64Image}
                          alt={`Produto ${index + 1}`}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                        title="Remover imagem"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area - CORRIGIDA */}
              <div className="w-full">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="image-upload"
                  className={`
                    flex flex-col items-center justify-center
                    w-full h-32 
                    border-2 border-dashed border-gray-300 
                    rounded-lg 
                    cursor-pointer 
                    transition-all duration-200
                    ${
                      uploadingImage
                        ? "opacity-50 cursor-not-allowed bg-gray-50"
                        : "hover:border-blue-400 hover:bg-blue-50"
                    }
                  `}
                >
                  {uploadingImage ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm text-gray-600 font-medium">
                        Enviando imagens...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                        <Upload size={24} className="text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-base font-medium text-gray-700">
                          Clique para enviar imagens
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Selecione múltiplas imagens do seu computador
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG, WEBP até 2MB cada
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Dicas */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ImageIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-2">
                      💡 Dicas para melhores fotos:
                    </p>
                    <ul className="space-y-1 list-disc list-inside ml-2">
                      <li>Use boa iluminação natural</li>
                      <li>Mostre o produto de diferentes ângulos</li>
                      <li>Mantenha o fundo limpo e neutro</li>
                      <li>Inclua a embalagem quando relevante</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading || uploadingImage}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isLoading || isSubmitting}
              disabled={isLoading || uploadingImage || isSubmitting}
            >
              {produto ? "Atualizar Produto" : "Criar Produto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
