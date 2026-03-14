"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/AuthContext";
import {
  useCarrinho,
  useAtualizarQuantidade,
  useRemoverDoCarrinho,
  useLimparCarrinho,
} from "@/hooks/useCarrinho";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

export default function CarrinhoPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const { data: itens = [], isLoading } = useCarrinho(user?.id);
  const atualizarQuantidade = useAtualizarQuantidade();
  const removerItem = useRemoverDoCarrinho();
  const limparCarrinho = useLimparCarrinho();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando carrinho...</p>
        </div>
      </div>
    );
  }

  const handleQuantidadeChange = (itemId: number, novaQuantidade: number) => {
    if (novaQuantidade < 1) return;

    atualizarQuantidade.mutate(
      { itemId, quantidade: novaQuantidade },
      {
        onError: (error: unknown) => {
          const errObj = error as {
            response?: { data?: { message?: string } };
            message?: string;
          } | null;
          const errorMessage =
            errObj?.response?.data?.message || errObj?.message || "Erro ao atualizar quantidade";
          alert(errorMessage);
        },
      }
    );
  };

  const handleRemoverItem = (itemId: number) => {
    if (window.confirm("Deseja remover este item do carrinho?")) {
      removerItem.mutate(itemId, {
        onError: (error: unknown) => {
          const errObj = error as {
            response?: { data?: { message?: string } };
            message?: string;
          } | null;
          const errorMessage =
            errObj?.response?.data?.message || errObj?.message || "Erro ao remover item";
          alert(errorMessage);
        },
      });
    }
  };

  const handleLimparCarrinho = () => {
    if (user && window.confirm("Deseja limpar todo o carrinho?")) {
      limparCarrinho.mutate(user.id, {
        onError: (error: unknown) => {
          const errObj = error as {
            response?: { data?: { message?: string } };
            message?: string;
          } | null;
          const errorMessage =
            errObj?.response?.data?.message || errObj?.message || "Erro ao limpar carrinho";
          alert(errorMessage);
        },
      });
    }
  };

  const calcularTotal = () => {
    return itens.reduce((total, item) => {
      const preco = item.produto?.preco || 0;
      return total + preco * item.quantidade;
    }, 0);
  };

  if (itens.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Seu carrinho está vazio
            </h1>
            <p className="text-gray-600 mb-8">
              Adicione produtos ao carrinho para continuar comprando.
            </p>
            <Button onClick={() => router.push("/produtos")}>
              <ShoppingBag className="mr-2 h-5 w-5" />
              Ir às Compras
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Meu Carrinho</h1>
            {itens.length > 0 && (
              <Button
                variant="secondary"
                onClick={handleLimparCarrinho}
                disabled={limparCarrinho.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Carrinho
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Itens */}
          <div className="lg:col-span-2 space-y-4">
            {itens.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6 flex gap-4"
              >
                {/* Imagem do Produto */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  {item.produto?.imagens && item.produto.imagens.length > 0 ? (
                    <Image
                      src={item.produto.imagens[0]}
                      alt={item.produto.nome || "Produto"}
                      fill
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Informações do Produto */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {item.produto?.nome || "Produto"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.produto?.descricao || ""}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(item.produto?.preco || 0)}
                    </span>
                    {item.produto?.estoque !== undefined && (
                      <span className="text-sm text-gray-500">
                        Estoque: {item.produto.estoque}
                      </span>
                    )}
                  </div>
                </div>

                {/* Controles */}
                <div className="flex flex-col items-end justify-between">
                  {/* Quantidade */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleQuantidadeChange(item.id, item.quantidade - 1)
                      }
                      disabled={
                        item.quantidade <= 1 || atualizarQuantidade.isPending
                      }
                      className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantidadeChange(item.id, item.quantidade + 1)
                      }
                      disabled={
                        atualizarQuantidade.isPending ||
                        (item.produto?.estoque !== undefined &&
                          item.quantidade >= item.produto.estoque)
                      }
                      className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Subtotal e Remover */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2">Subtotal</p>
                    <p className="text-xl font-bold text-gray-900 mb-3">
                      {formatCurrency(
                        (item.produto?.preco || 0) * item.quantidade
                      )}
                    </p>
                    <button
                      onClick={() => handleRemoverItem(item.id)}
                      disabled={removerItem.isPending}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Resumo do Pedido
              </h2>

              <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itens.length} itens)</span>
                  <span>{formatCurrency(calcularTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span className="text-green-600 font-semibold">Grátis</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span className="text-blue-600">
                  {formatCurrency(calcularTotal())}
                </span>
              </div>

              <Button
                className="w-full"
                onClick={() =>
                  alert("Funcionalidade de checkout em desenvolvimento!")
                }
              >
                Finalizar Compra
              </Button>

              <Button
                variant="secondary"
                className="w-full mt-3"
                onClick={() => router.push("/produtos")}
              >
                Continuar Comprando
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
