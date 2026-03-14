"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useProdutos,
  useDeleteProduto,
  useCreateProduto,
  useUpdateProduto,
  useProduto,
} from "../../hooks/useProdutos";
import { ProdutoCard } from "../../components/ProdutoCard";
import { ProdutoForm } from "../../components/ProdutoForm";
import { ProdutosGridSkeleton } from "../../components/ProdutoSkeleton";
import { Button } from "../../components/ui/Button";
import { Plus, Search, Filter, Package, Heart } from "lucide-react";
import { Produto, StatusProduto } from "../../types";
import { useAuth } from "../../components/AuthContext";

type ModalState = {
  isOpen: boolean;
  mode: "create" | "edit";
  produto?: Produto;
};

type ProdutoFormData = {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoriaId: number;
  categoriaProdutoId: number;
  status: StatusProduto;
  imagens?: string[];
};

export default function ProdutosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { user } = useAuth();
  const isAdmin = user?.tipo === 2; // TipoUsuario.ADMIN = 2

  const { data: produtos, isLoading, error } = useProdutos();
  const deleteMutation = useDeleteProduto();
  const createMutation = useCreateProduto();
  const updateMutation = useUpdateProduto();

  // Buscar produto para edição se editId estiver presente
  const { data: produtoParaEdicao } = useProduto(editId ? parseInt(editId) : 0);

  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    mode: "create",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "ativo" | "rascunho"
  >("all");

  // Effect para abrir modal de edição quando editId mudar
  useEffect(() => {
    if (editId && produtoParaEdicao) {
      setModal({
        isOpen: true,
        mode: "edit",
        produto: produtoParaEdicao,
      });
    }
  }, [editId, produtoParaEdicao]);

  // Filtrar produtos
  const filteredProdutos = produtos?.filter((produto: Produto) => {
    const matchesSearch =
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.descricao.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "ativo" && produto.status === 1) || // ATIVO = 1
      (filterStatus === "rascunho" && produto.status === 0); // RASCUNHO = 0

    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    setModal({
      isOpen: true,
      mode: "create",
    });
  };

  const handleEdit = (produto: Produto) => {
    setModal({
      isOpen: true,
      mode: "edit",
      produto,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setModal({
      isOpen: false,
      mode: "create",
    });

    // Limpar query params se estiver editando
    if (editId) {
      router.replace("/produtos");
    }
  };

  const handleFormSubmit = (data: ProdutoFormData) => {
    // Prevenir múltiplos submits
    if (createMutation.isPending || updateMutation.isPending) {
      console.warn("⚠️ Já existe uma operação em andamento");
      return;
    }

    // Normalizar dados para garantir que imagens seja sempre array
    const normalizedData = {
      ...data,
      imagens: data.imagens || [],
    };

    if (modal.mode === "create") {
      createMutation.mutate(normalizedData, {
        onSuccess: () => {
          console.log("✅ Produto criado! Fechando modal e recarregando...");
          handleModalClose();
          // Forçar reload da página para garantir que o produto apareça
          window.location.reload();
        },
        onError: (error) => {
          console.error("❌ Erro ao criar produto:", error);
        },
      });
    } else if (modal.mode === "edit" && modal.produto) {
      updateMutation.mutate(
        { id: modal.produto.id, data: normalizedData },
        {
          onSuccess: () => {
            console.log(
              "✅ Produto atualizado! Fechando modal e recarregando..."
            );
            handleModalClose();
            // Forçar reload da página
            window.location.reload();
          },
          onError: (error) => {
            console.error("❌ Erro ao atualizar produto:", error);
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-3 justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                Carregando produtos...
              </h1>
            </div>
            <p className="text-gray-600 animate-pulse">
              Conectando ao servidor 🚀
            </p>
          </div>

          {/* Grid skeleton */}
          <ProdutosGridSkeleton count={9} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
            <h3 className="font-semibold">Erro ao carregar produtos</h3>
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header com visual melhorado */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
          <Package size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Catálogo de Produtos
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Gerencie todos os produtos da PetGo com facilidade e organize seu
          catálogo de forma intuitiva
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Heart size={16} className="text-pink-500" />
            <span>{produtos?.length || 0} produtos disponíveis</span>
          </div>
          {isAdmin && (
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              Novo Produto
            </Button>
          )}
        </div>
      </div>

      {/* Filters com visual melhorado */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-56">
            <div className="relative">
              <Filter
                size={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "all" | "ativo" | "rascunho"
                  )
                }
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all"
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">Apenas Ativos</option>
                <option value="rascunho">Apenas Rascunhos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {!filteredProdutos || filteredProdutos.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-8">
            {searchTerm || filterStatus !== "all" ? (
              <Search size={40} className="text-gray-400" />
            ) : (
              <Package size={40} className="text-gray-400" />
            )}
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">
            {searchTerm || filterStatus !== "all"
              ? "Nenhum produto encontrado"
              : "Seu catálogo está vazio"}
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            {searchTerm || filterStatus !== "all"
              ? "Tente ajustar os filtros de busca para encontrar o que procura"
              : "Comece adicionando alguns produtos incríveis ao seu catálogo"}
          </p>
          {!searchTerm && filterStatus === "all" && isAdmin && (
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              Adicionar Primeiro Produto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProdutos.map((produto) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Modal de Produto */}
      {modal.isOpen && (
        <ProdutoForm
          produto={modal.produto}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
          isLoading={createMutation.isPending || updateMutation.isPending}
          title={modal.mode === "create" ? "Novo Produto" : "Editar Produto"}
        />
      )}
    </div>
  );
}
