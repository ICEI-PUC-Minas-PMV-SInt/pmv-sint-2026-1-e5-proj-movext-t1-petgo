"use client";

import React from "react";
import Link from "next/link";
import { Produto, StatusProduto } from "../types";
import { Button } from "./ui/Button";
import { formatCurrency, truncateText } from "../lib/utils";
import { Edit, Trash2, Package, Eye, Star } from "lucide-react";
import { SafeImage } from "./SafeImage";
import { useAuth } from "./AuthContext";

interface ProdutoCardProps {
  produto: Produto;
  onEdit?: (produto: Produto) => void;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
  showActions?: boolean;
}

export function ProdutoCard({
  produto,
  onEdit,
  onDelete,
  isDeleting = false,
  showActions = true,
}: ProdutoCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.tipo === 2; // TipoUsuario.ADMIN = 2

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      onDelete?.(produto.id);
    }
  };

  const getStatusBadge = (status: StatusProduto) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

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
        return "Ativo";
      case StatusProduto.RASCUNHO:
        return "Rascunho";
      default:
        return "Desconhecido";
    }
  };

  const temImagens = produto.imagens && produto.imagens.length > 0;
  const primeiraImagem = temImagens ? produto.imagens[0] : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200 group">
      <Link href={`/produtos/${produto.id}`} className="block">
        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
          {primeiraImagem ? (
            <SafeImage
              src={primeiraImagem}
              alt={produto.nome}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              fallback={
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Package className="h-12 w-12 mb-2" />
                  <p className="text-xs">Sem imagem</p>
                </div>
              }
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Package className="h-12 w-12 mb-2" />
              <p className="text-xs">Sem imagem</p>
            </div>
          )}

          <div className="absolute top-2 right-2 z-10">
            <span className={getStatusBadge(produto.status)}>
              {getStatusText(produto.status)}
            </span>
          </div>

          {primeiraImagem && (
            <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
              <div className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center shadow-lg">
                  <Eye size={16} className="mr-2" />
                  Ver Detalhes
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/produtos/${produto.id}`} className="block">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">
              {produto.nome}
            </h3>
          </div>

          {/* Avaliações */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(produto.avaliacaoMedia || 0)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {produto.avaliacaoMedia > 0
                ? `${produto.avaliacaoMedia.toFixed(1)} (${
                    produto.quantidadeAvaliacoes
                  })`
                : "Sem avaliações"}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {truncateText(produto.descricao, 100)}
          </p>

          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(produto.preco)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Estoque: <span className="font-medium">{produto.estoque}</span>
              </p>
            </div>
          </div>
        </Link>

        {showActions && isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit?.(produto)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={isDeleting}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
