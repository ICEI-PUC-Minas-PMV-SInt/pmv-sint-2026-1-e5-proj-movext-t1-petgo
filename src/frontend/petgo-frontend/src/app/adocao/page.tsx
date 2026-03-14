"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { Heart, PawPrint, MapPin, Calendar, Plus } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

interface Pet {
  id: number;
  nome: string;
  especie: number;
  raca: string;
  idadeMeses: number;
  porte: number;
  cidade: string;
  estado: string;
  fotos: string[];
  observacoes: string;
  usuario: Usuario | null;
}

interface AnuncioDoacao {
  id: number;
  petId: number;
  status: number;
  descricao: string;
  contatoWhatsapp: string | null;
  moderacao: number;
  pet: Pet | null;
}

const getEspecieLabel = (especie: number) => {
  switch (especie) {
    case 0:
      return "Cachorro";
    case 1:
      return "Gato";
    case 2:
      return "Outro";
    default:
      return "Desconhecido";
  }
};

const getPorteLabel = (porte: number) => {
  switch (porte) {
    case 0:
      return "Pequeno";
    case 1:
      return "Médio";
    case 2:
      return "Grande";
    default:
      return "Desconhecido";
  }
};

const getIdadeAnos = (idadeMeses: number) => {
  const anos = Math.floor(idadeMeses / 12);
  const meses = idadeMeses % 12;
  if (anos > 0 && meses > 0) {
    return `${anos} ano${anos > 1 ? "s" : ""} e ${meses} ${
      meses > 1 ? "meses" : "mês"
    }`;
  } else if (anos > 0) {
    return `${anos} ano${anos > 1 ? "s" : ""}`;
  } else {
    return `${meses} ${meses > 1 ? "meses" : "mês"}`;
  }
};

export default function AdocaoPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const {
    data: anuncios = [],
    isLoading,
    error,
  } = useQuery<AnuncioDoacao[]>({
    queryKey: ["anuncios-doacao"],
    queryFn: async () => {
      const response = await api.get("/api/AnuncioDoacoes");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando pets para adoção...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="container mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h3 className="font-semibold">Erro ao carregar anúncios</h3>
            <p>{(error as { message?: string })?.message || "Erro desconhecido"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Adoção de Pets
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Encontre seu novo melhor amigo! Todos esses pets estão esperando por
            um lar cheio de amor.
          </p>

          {/* Botão Criar Anúncio */}
          {isAuthenticated && (
            <Button
              onClick={() => router.push("/adocao/criar")}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Criar Anúncio de Adoção
            </Button>
          )}
        </div>

        {/* Lista de Pets */}
        {anuncios.length === 0 ? (
          <div className="text-center py-16">
            <PawPrint className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Nenhum pet disponível no momento
            </h2>
            <p className="text-gray-500">
              Volte mais tarde para ver novos pets para adoção.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {anuncios.map((anuncio) => {
              const pet = anuncio.pet;
              if (!pet) return null;

              const primeiraFoto =
                pet.fotos && pet.fotos.length > 0
                  ? pet.fotos[0]
                  : "/placeholder-pet.jpg";

              return (
                <div
                  key={anuncio.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => router.push(`/adocao/${anuncio.id}`)}
                >
                  {/* Imagem */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    <Image
                      src={primeiraFoto}
                      alt={pet.nome}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-md">
                      {getEspecieLabel(pet.especie)}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {pet.nome}
                    </h2>

                    <p className="text-md text-purple-600 font-semibold mb-4">
                      {pet.raca || "SRD"} • {getPorteLabel(pet.porte)}
                    </p>

                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{getIdadeAnos(pet.idadeMeses)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>
                          {pet.cidade}, {pet.estado}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                      {anuncio.descricao || pet.observacoes}
                    </p>

                    <Button className="w-full" variant="primary">
                      <Heart className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
