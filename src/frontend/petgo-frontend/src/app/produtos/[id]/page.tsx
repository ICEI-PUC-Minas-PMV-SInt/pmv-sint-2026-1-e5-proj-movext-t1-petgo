"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useProduto, useDeleteProduto } from "../../../hooks/useProdutos";
import { useAvaliacoes } from "../../../hooks/useAvaliacoes";
import { useAdicionarAoCarrinho } from "../../../hooks/useCarrinho";
import { useAuth } from "../../../components/AuthContext";
import { AlvoTipo } from "../../../types";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Button } from "../../../components/ui/Button";
import { formatCurrency } from "../../../lib/utils";
import { StatusProduto, ApiError } from "../../../types";
import AvaliacoesProdutoSection from "@/app/produtos/[id]/components/AvaliacoesProdutoSection";
import {
  ArrowLeft,
  Package,
  Tag,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from "lucide-react";

export default function ProdutoPage() {
  const params = useParams();
  const router = useRouter();
  const produtoId = parseInt(params.id as string);
  const { user, isAuthenticated } = useAuth();

  // Verificar se o usuário é ADMIN (tipo === 2)
  const isAdmin = isAuthenticated && user && user.tipo === 2;

  const { data: produto, isLoading, error } = useProduto(produtoId);
  const { data: avaliacoes = [], isLoading: isLoadingAvaliacoes } =
    useAvaliacoes(AlvoTipo.PRODUTO, produtoId);
  const deleteMutation = useDeleteProduto();
  const adicionarAoCarrinho = useAdicionarAoCarrinho();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantidade, setQuantidade] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (error || !produto) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-semibold">Produto não encontrado</h3>
          <p>{error?.message || "O produto solicitado não existe."}</p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => router.push("/produtos")}
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar aos Produtos
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: StatusProduto) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case StatusProduto.ATIVO:
        return `${baseClasses} bg-green-100 text-green-800`;
      case StatusProduto.RASCUNHO:
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: StatusProduto) => {
    switch (status) {
      case StatusProduto.ATIVO:
        return "Disponível";
      case StatusProduto.RASCUNHO:
        return "Em Breve";
      default:
        return "Indisponível";
    }
  };

  const handlePreviousImage = () => {
    if (produto.imagens && produto.imagens.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? produto.imagens.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (produto.imagens && produto.imagens.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === produto.imagens.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated || !user) {
      alert("Você precisa estar logado para adicionar itens ao carrinho!");
      router.push("/login");
      return;
    }

    adicionarAoCarrinho.mutate(
      {
        usuarioId: user.id,
        produtoId: produto.id,
        quantidade,
      },
      {
        onSuccess: () => {
          alert(`${quantidade}x ${produto.nome} adicionado ao carrinho!`);
          setQuantidade(1); // Reset quantidade
        },
        onError: (error: unknown) => {
          let errorMessage = "Erro ao adicionar ao carrinho";
          if (
            typeof error === "object" &&
            error !== null &&
            "response" in error
          ) {
            const errObj = error as { response?: { data?: { message?: string } } };
            errorMessage = errObj.response?.data?.message || errorMessage;
          }
          alert(errorMessage);
        },
      }
    );
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: Implementar lógica de favoritos
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: produto.nome,
          text: produto.descricao,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Erro ao compartilhar:", error);
      }
    } else {
      // Fallback: copiar URL
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  const handleEdit = () => {
    // Navegar para listagem com modal de edição aberto
    router.push(`/produtos?edit=${produto.id}`);
  };

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteMutation.mutate(produto.id, {
        onSuccess: () => {
          router.push("/produtos");
        },
        onError: (error: ApiError) => {
          alert("Erro ao excluir produto: " + error.message);
        },
      });
    }
  };

  const temImagens = produto.imagens && produto.imagens.length > 0;
  const imagemAtual = temImagens ? produto.imagens[currentImageIndex] : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => router.push("/")}
            className="hover:text-blue-600 transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => router.push("/produtos")}
            className="hover:text-blue-600 transition-colors"
          >
            Produtos
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{produto.nome}</span>
        </nav>

        {/* Botões de Ação */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="secondary" onClick={() => router.back()}>
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>

          {/* Botões Admin - Apenas para usuários autenticados e ADMIN */}
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit size={16} />
                Editar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={16} />
                {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Layout Principal */}
          <div className="grid lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Galeria de Imagens */}
            <div className="space-y-4">
              {/* Imagem Principal */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {imagemAtual ? (
                  <>
                    <Image
                      src={imagemAtual}
                      alt={produto.nome}
                      fill
                      className="object-cover"
                      priority
                    />
                    {produto.imagens.length > 1 && (
                      <>
                        <button
                          onClick={handlePreviousImage}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Package size={64} />
                  </div>
                )}
              </div>

              {/* Miniaturas */}
              {produto.imagens && produto.imagens.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {produto.imagens.map((imagem, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-blue-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={imagem}
                        alt={`${produto.nome} ${index + 1}`}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do Produto */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    {produto.nome}
                  </h1>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleToggleFavorite}
                      className={`p-2 rounded-full transition-colors ${
                        isFavorited
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Heart
                        size={20}
                        fill={isFavorited ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Status e Categoria */}
                <div className="flex items-center space-x-3 mb-4">
                  <span className={getStatusBadge(produto.status)}>
                    {getStatusText(produto.status)}
                  </span>
                  {produto.categoriaProduto && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag size={16} className="mr-1" />
                      {produto.categoriaProduto.nome}
                    </div>
                  )}
                </div>

                {/* Avaliações */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(produto.avaliacaoMedia || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {produto.avaliacaoMedia > 0
                      ? `${produto.avaliacaoMedia.toFixed(1)} (${
                          produto.quantidadeAvaliacoes
                        } ${
                          produto.quantidadeAvaliacoes === 1
                            ? "avaliação"
                            : "avaliações"
                        })`
                      : "Sem avaliações"}
                  </span>
                </div>

                {/* Preço */}
                <div className="mb-6">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-green-600">
                      {formatCurrency(produto.preco)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Descrição
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {produto.descricao}
                </p>
              </div>

              {/* Estoque */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Estoque disponível
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      produto.estoque > 10
                        ? "text-green-600"
                        : produto.estoque > 0
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {produto.estoque > 0
                      ? `${produto.estoque} unidades`
                      : "Sem estoque"}
                  </span>
                </div>

                {produto.estoque > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        produto.estoque > 10
                          ? "bg-green-500"
                          : produto.estoque > 5
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          (produto.estoque / 50) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Quantidade e Ações */}
              {produto.status === StatusProduto.ATIVO &&
                produto.estoque > 0 && (
                  <div className="space-y-4">
                    {/* Seletor de Quantidade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantidade
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            setQuantidade(Math.max(1, quantidade - 1))
                          }
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-16 text-center font-semibold">
                          {quantidade}
                        </span>
                        <button
                          onClick={() =>
                            setQuantidade(
                              Math.min(produto.estoque, quantidade + 1)
                            )
                          }
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Botão Comprar */}
                    <Button
                      onClick={handleAddToCart}
                      className="w-full text-lg py-3"
                      size="lg"
                    >
                      <ShoppingCart size={20} className="mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                  </div>
                )}

              {/* Ações Admin - Apenas para usuários ADMIN autenticados */}
              {isAdmin && (
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    variant="secondary"
                    onClick={handleEdit}
                    className="flex-1"
                  >
                    <Edit size={16} className="mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    loading={deleteMutation.isPending}
                    className="flex-1"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Excluir
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="border-t bg-gray-50 p-6 lg:p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Entrega Rápida
                  </h4>
                  <p className="text-sm text-gray-600">
                    Receba em até 3 dias úteis
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Compra Segura</h4>
                  <p className="text-sm text-gray-600">
                    Pagamento 100% protegido
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Qualidade</h4>
                  <p className="text-sm text-gray-600">
                    Produtos premium para pets
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Avaliações */}
        <div className="mt-8">
          <AvaliacoesProdutoSection
            produtoId={produtoId}
            avaliacoes={avaliacoes}
            isLoading={isLoadingAvaliacoes}
          />
        </div>

        {/* Produtos Relacionados */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Produtos Relacionados
          </h2>
          <div className="bg-white rounded-lg p-6 text-center text-gray-500">
            <Package size={48} className="mx-auto mb-3 opacity-50" />
            <p>Produtos relacionados em breve...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
