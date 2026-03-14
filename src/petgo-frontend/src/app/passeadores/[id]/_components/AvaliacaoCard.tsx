import { Avaliacao } from "@/types";
import { Star } from "lucide-react";

interface AvaliacaoCardProps {
  avaliacao: Avaliacao;
  canEdit?: boolean;
}

export default function AvaliacaoCard({
  avaliacao,
  canEdit,
}: AvaliacaoCardProps) {
  const renderStars = (nota: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= nota ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dataString;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header com autor e data */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">
            {avaliacao.autorNome || "Usuário Anônimo"}
          </p>
          <p className="text-sm text-gray-500">
            {formatarData(avaliacao.dataCriacao)}
          </p>
        </div>
        {renderStars(avaliacao.nota)}
      </div>

      {/* Título */}
      <h3 className="font-semibold text-gray-900 mb-2">{avaliacao.titulo}</h3>

      {/* Comentário */}
      <p className="text-gray-700 whitespace-pre-wrap">
        {avaliacao.comentario}
      </p>
    </div>
  );
}
