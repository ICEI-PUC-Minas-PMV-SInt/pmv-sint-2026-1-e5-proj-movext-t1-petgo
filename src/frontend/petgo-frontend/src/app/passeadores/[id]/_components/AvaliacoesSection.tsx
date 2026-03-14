"use client";

import { useState } from "react";
import { Avaliacao } from "@/types";
import { useAuth } from "@/components/AuthContext";
import AvaliacaoCard from "@/app/passeadores/[id]/_components/AvaliacaoCard";
import AvaliacaoForm from "@/app/passeadores/[id]/_components/AvaliacaoForm";
import { Star } from "lucide-react";

interface AvaliacoesSectionProps {
  passeadorId: number;
  passeadorUsuarioId: number;
  avaliacoes: Avaliacao[];
  isLoading: boolean;
}

export default function AvaliacoesSection({
  passeadorId,
  passeadorUsuarioId,
  avaliacoes,
  isLoading,
}: AvaliacoesSectionProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const podeAvaliar = user && user.id !== passeadorUsuarioId;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Avaliações</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Avaliações</h2>
          <p className="text-gray-600 mt-1">
            {avaliacoes.length}{" "}
            {avaliacoes.length === 1 ? "avaliação" : "avaliações"}
          </p>
        </div>

        {podeAvaliar && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Avaliar
          </button>
        )}
      </div>

      {/* Formulário de Nova Avaliação */}
      {podeAvaliar && showForm && (
        <div className="mb-6">
          <AvaliacaoForm
            passeadorId={passeadorId}
            onCancel={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Mensagem se não pode avaliar */}
      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            Faça login para avaliar este passeador
          </p>
        </div>
      )}

      {user && user.id === passeadorUsuarioId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            Você não pode avaliar seu próprio perfil
          </p>
        </div>
      )}

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        {avaliacoes.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Ainda não há avaliações para este passeador
            </p>
            {podeAvaliar && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Seja o primeiro a avaliar!
              </button>
            )}
          </div>
        ) : (
          avaliacoes.map((avaliacao) => (
            <AvaliacaoCard
              key={avaliacao.id}
              avaliacao={avaliacao}
              canEdit={user?.id === passeadorUsuarioId}
            />
          ))
        )}
      </div>
    </div>
  );
}
