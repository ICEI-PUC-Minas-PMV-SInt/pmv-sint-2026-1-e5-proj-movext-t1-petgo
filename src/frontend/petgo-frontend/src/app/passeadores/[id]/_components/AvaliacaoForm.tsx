"use client";

import { useState } from "react";
import { useCreateAvaliacao } from "@/hooks/useAvaliacoes";
import { AlvoTipo } from "@/types";
import { useAuth } from "@/components/AuthContext";
import { Star, X } from "lucide-react";

interface AvaliacaoFormProps {
  passeadorId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AvaliacaoForm({
  passeadorId,
  onCancel,
  onSuccess,
}: AvaliacaoFormProps) {
  const { user } = useAuth();
  const [nota, setNota] = useState(5);
  const [titulo, setTitulo] = useState("");
  const [comentario, setComentario] = useState("");
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const createMutation = useCreateAvaliacao();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !comentario.trim()) {
      return;
    }

    createMutation.mutate(
      {
        alvoTipo: AlvoTipo.PASSEADOR,
        alvoId: passeadorId,
        nota,
        titulo: titulo.trim(),
        comentario: comentario.trim(),
        autorNome: user?.nome || "Usuário Anônimo",
      },
      {
        onSuccess: () => {
          onSuccess();
        },
      }
    );
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Nova Avaliação</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nota */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nota *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNota(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoveredStar || nota)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <div>
          <label
            htmlFor="titulo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Título *
          </label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Resuma sua experiência"
            maxLength={100}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {titulo.length}/100 caracteres
          </p>
        </div>

        {/* Comentário */}
        <div>
          <label
            htmlFor="comentario"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Comentário *
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Conte sobre sua experiência com este passeador"
            rows={4}
            maxLength={500}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {comentario.length}/500 caracteres
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={
              !titulo.trim() || !comentario.trim() || createMutation.isPending
            }
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? "Enviando..." : "Enviar Avaliação"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
