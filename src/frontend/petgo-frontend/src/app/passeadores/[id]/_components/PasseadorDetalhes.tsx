import { PasseadorDto, TipoServico } from "@/types";
import { Star, Phone, MapPin, DollarSign } from "lucide-react";

interface PasseadorDetalhesProps {
  passeador: PasseadorDto;
}

const SERVICO_LABELS: Record<number, string> = {
  [TipoServico.PASSEIO]: "Passeio",
  [TipoServico.CUIDADO_DIARIO]: "Cuidado Diário",
  [TipoServico.HOSPEDAGEM]: "Hospedagem",
  [TipoServico.OUTRO]: "Outro",
};

const SERVICO_COLORS: Record<number, string> = {
  [TipoServico.PASSEIO]: "bg-blue-100 text-blue-800",
  [TipoServico.CUIDADO_DIARIO]: "bg-green-100 text-green-800",
  [TipoServico.HOSPEDAGEM]: "bg-purple-100 text-purple-800",
  [TipoServico.OUTRO]: "bg-gray-100 text-gray-800",
};

export default function PasseadorDetalhes({
  passeador,
}: PasseadorDetalhesProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="md:flex">
        {/* Foto do Passeador */}
        <div className="md:w-1/3">
          <div className="aspect-square relative bg-gray-200">
            {passeador.fotoPerfil ? (
              <img
                src={passeador.fotoPerfil}
                alt={passeador.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-2">👤</div>
                  <p className="text-sm">Sem foto</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informações do Passeador */}
        <div className="md:w-2/3 p-6">
          {/* Nome e Avaliação */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {passeador.nome}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-lg font-semibold text-gray-900">
                  {passeador.avaliacaoMedia.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-500">
                ({passeador.quantidadeAvaliacoes}{" "}
                {passeador.quantidadeAvaliacoes === 1
                  ? "avaliação"
                  : "avaliações"}
                )
              </span>
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Sobre</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {passeador.descricao}
            </p>
          </div>

          {/* Serviços Oferecidos */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Serviços Oferecidos
            </h2>
            <div className="flex flex-wrap gap-2">
              {passeador.servicos && passeador.servicos.length > 0 ? (
                passeador.servicos.map((servico) => (
                  <span
                    key={servico.id}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      SERVICO_COLORS[servico.tipoServico] ||
                      SERVICO_COLORS[TipoServico.OUTRO]
                    }`}
                  >
                    {SERVICO_LABELS[servico.tipoServico] || "Outro"}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  Nenhum serviço cadastrado
                </p>
              )}
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-semibold">Valor:</span>
                <span>R$ {passeador.valorCobrado.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">Telefone:</span>
                <span>{passeador.telefone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
