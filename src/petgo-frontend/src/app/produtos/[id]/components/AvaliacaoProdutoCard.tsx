"use client";

import { Avaliacao } from "@/types";
import { Star, User } from "lucide-react";

interface AvaliacaoProdutoCardProps {
  avaliacao: Avaliacao;
}

export default function AvaliacaoProdutoCard({
  avaliacao,
}: AvaliacaoProdutoCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {avaliacao.autorNome || "Usuário Anônimo"}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(avaliacao.dataCriacao)}
            </p>
          </div>
        </div>

        {/* Estrelas */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= avaliacao.nota
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">
          {avaliacao.titulo}
        </h4>
        <p className="text-gray-700 text-sm leading-relaxed">
          {avaliacao.comentario}
        </p>
      </div>
    </div>
  );
}
