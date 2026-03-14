import React from "react";
import Link from "next/link";
import { Passeador, TipoServico } from "../types";
import { Star, Phone, Briefcase, Home, Heart, Eye } from "lucide-react";
import { SafeImage } from "./SafeImage";

interface PasseadorCardProps {
  passeador: Passeador;
  onContact?: (passeador: Passeador) => void;
}

// Mapeamento de tipos de serviço para labels
const SERVICO_LABELS: Record<TipoServico, string> = {
  [TipoServico.PASSEIO]: "Passeio",
  [TipoServico.CUIDADO_DIARIO]: "Cuidado Diário",
  [TipoServico.HOSPEDAGEM]: "Hospedagem",
  [TipoServico.OUTRO]: "Outro",
};

// Cores para cada tipo de serviço
const SERVICO_COLORS: Record<TipoServico, string> = {
  [TipoServico.PASSEIO]: "bg-green-100 text-green-700",
  [TipoServico.CUIDADO_DIARIO]: "bg-blue-100 text-blue-700",
  [TipoServico.HOSPEDAGEM]: "bg-purple-100 text-purple-700",
  [TipoServico.OUTRO]: "bg-gray-100 text-gray-700",
};

export function PasseadorCard({ passeador, onContact }: PasseadorCardProps) {
  // Formatar telefone para exibição
  const formatarTelefone = (telefone: string) => {
    if (!telefone) return "";
    const cleaned = telefone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
        7
      )}`;
    }
    return telefone;
  };

  // Renderizar estrelas de avaliação
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
      {/* Header com foto e informações básicas */}
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          {/* Foto do passeador */}
          <div className="relative flex-shrink-0 w-20 h-20">
            <SafeImage
              src={passeador.fotoPerfil}
              alt={passeador.nome}
              className="rounded-full object-cover border-4 border-blue-100"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white" />
          </div>

          {/* Informações do passeador */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
              {passeador.nome}
            </h3>

            {/* Avaliação */}
            <div className="flex items-center gap-2 mb-2">
              {renderStars(passeador.avaliacaoMedia)}
              <span className="text-sm text-gray-600">
                {passeador.avaliacaoMedia.toFixed(1)} (
                {passeador.quantidadeAvaliacoes}{" "}
                {passeador.quantidadeAvaliacoes === 1
                  ? "avaliação"
                  : "avaliações"}
                )
              </span>
            </div>

            {/* Valor cobrado */}
            <div className="flex items-center gap-2 text-green-600 font-semibold text-lg">
              <span>R$ {passeador.valorCobrado.toFixed(2)}/hora</span>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {passeador.descricao}
        </p>

        {/* Serviços oferecidos */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Serviços Oferecidos:
            </span>
          </div>
          {passeador.servicos && passeador.servicos.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {passeador.servicos.map((servico) => (
                <span
                  key={servico.id}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    SERVICO_COLORS[servico.tipoServico as TipoServico] ||
                    "bg-gray-100 text-gray-700"
                  }`}
                >
                  {SERVICO_LABELS[servico.tipoServico as TipoServico] ||
                    servico.titulo}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">
              Nenhum serviço cadastrado
            </p>
          )}
        </div>

        {/* Telefone */}
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
          <Phone size={16} />
          <span>{formatarTelefone(passeador.telefone)}</span>
        </div>

        {/* Botões de ação */}
        <div className="pt-4 border-t border-gray-100 flex gap-2">
          <Link
            href={`/passeadores/${passeador.usuarioId}`}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <Eye size={18} />
            Ver Perfil
          </Link>
          {onContact && (
            <button
              onClick={() => onContact(passeador)}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
