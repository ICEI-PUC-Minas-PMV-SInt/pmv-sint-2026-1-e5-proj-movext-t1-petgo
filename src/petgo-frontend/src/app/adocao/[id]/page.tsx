"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import {
  Heart,
  ArrowLeft,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

export default function AnuncioDetalhes() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    data: anuncio,
    isLoading,
    error,
  } = useQuery<AnuncioDoacao>({
    queryKey: ["anuncio-doacao", id],
    queryFn: async () => {
      const response = await api.get(`/api/AnuncioDoacoes/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (error || !anuncio || !anuncio.pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="container mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h3 className="font-semibold">Erro ao carregar anúncio</h3>
            <p>{typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : "Anúncio não encontrado"}</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => router.push("/adocao")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pet = anuncio.pet;
  const fotos =
    pet.fotos && pet.fotos.length > 0 ? pet.fotos : ["/placeholder-pet.jpg"];

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
  };

  const handleContacto = () => {
    if (anuncio.contatoWhatsapp) {
      window.open(
        `https://wa.me/${anuncio.contatoWhatsapp.replace(/\D/g, "")}`,
        "_blank"
      );
    } else if (pet.usuario?.telefone) {
      window.open(
        `https://wa.me/${pet.usuario.telefone.replace(/\D/g, "")}`,
        "_blank"
      );
    } else {
      alert("Informações de contato não disponíveis");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => router.push("/adocao")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Galeria de Imagens */}
            <div className="relative">
              <div className="relative h-96 lg:h-full bg-gray-100">
                <Image
                  src={fotos[currentImageIndex]}
                  alt={pet.nome}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Controles de navegação */}
                {fotos.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-800" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-800" />
                    </button>

                    {/* Indicadores */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {fotos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "bg-white w-8"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  {getEspecieLabel(pet.especie)}
                </div>
              </div>
            </div>

            {/* Informações */}
            <div className="p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {pet.nome}
              </h1>
              <p className="text-xl text-purple-600 font-semibold mb-6">
                {pet.raca || "SRD"} • {getPorteLabel(pet.porte)}
              </p>

              {/* Informações Básicas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Idade</p>
                    <p className="font-semibold text-gray-900">
                      {getIdadeAnos(pet.idadeMeses)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Localização</p>
                    <p className="font-semibold text-gray-900">
                      {pet.cidade}, {pet.estado}
                    </p>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  Sobre {pet.nome}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {anuncio.descricao ||
                    pet.observacoes ||
                    "Sem descrição disponível"}
                </p>
              </div>

              {/* Informações do Responsável */}
              {pet.usuario && (
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Informações do Responsável
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{pet.usuario.nome}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">
                        {pet.usuario.telefone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{pet.usuario.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de Contato */}
              <Button className="w-full text-lg py-6" onClick={handleContacto}>
                <Heart className="mr-2 h-5 w-5" />
                Entrar em Contato
              </Button>

              <p className="text-sm text-gray-500 text-center mt-4">
                Entre em contato com o responsável para iniciar o processo de
                adoção
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
