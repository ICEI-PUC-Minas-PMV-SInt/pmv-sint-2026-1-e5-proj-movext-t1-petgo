"use client";

import { useParams } from "next/navigation";
import { usePasseador } from "@/hooks/usePasseadores";
import { useAvaliacoes } from "@/hooks/useAvaliacoes";
import { AlvoTipo } from "@/types";
import PasseadorDetalhes from "@/app/passeadores/[id]/_components/PasseadorDetalhes";
import AvaliacoesSection from "@/app/passeadores/[id]/_components/AvaliacoesSection";

export default function PasseadorPage() {
  const params = useParams();
  const passeadorId = Number(params.id);

  const { data: passeador, isLoading: loadingPasseador } =
    usePasseador(passeadorId);
  const { data: avaliacoes, isLoading: loadingAvaliacoes } = useAvaliacoes(
    AlvoTipo.PASSEADOR,
    passeadorId
  );

  if (loadingPasseador) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!passeador) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Passeador não encontrado
          </h1>
          <p className="text-gray-600">
            O passeador que você procura não existe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Detalhes do Passeador */}
        <PasseadorDetalhes passeador={passeador} />

        {/* Seção de Avaliações */}
        <div className="mt-8">
          <AvaliacoesSection
            passeadorId={passeadorId}
            passeadorUsuarioId={passeador.usuarioId}
            avaliacoes={avaliacoes || []}
            isLoading={loadingAvaliacoes}
          />
        </div>
      </div>
    </div>
  );
}
