"use client";

import React, { useState } from "react";
import { usePasseadores } from "../../hooks/usePasseadores";
import { PasseadorCard } from "../../components/PasseadorCard";
import { PasseadoresGridSkeleton } from "../../components/PasseadorSkeleton";
import { Search, Users } from "lucide-react";
import { Passeador, TipoServico } from "../../types";

export default function PasseadoresContent() {
  const { data: passeadores, isLoading, error } = usePasseadores();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterServico, setFilterServico] = useState<TipoServico | "all">(
    "all"
  );

  // Filtrar passeadores localmente
  const filteredPasseadores = passeadores?.filter((passeador: Passeador) => {
    const matchesSearch =
      passeador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passeador.descricao.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesServico =
      filterServico === "all" ||
      passeador.servicos?.some((s) => s.tipoServico === filterServico);

    return matchesSearch && matchesServico;
  });

  const handleContact = (passeador: Passeador) => {
    // Formatar número de telefone para WhatsApp
    const telefone = passeador.telefone.replace(/\D/g, "");
    const mensagem = encodeURIComponent(
      `Olá ${passeador.nome}, vi seu perfil no PetGo e gostaria de contratar seus serviços!`
    );
    window.open(`https://wa.me/55${telefone}?text=${mensagem}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-3 justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
                Carregando passeadores...
              </h1>
            </div>
            <p className="text-gray-600 animate-pulse">
              Buscando profissionais qualificados 🐾
            </p>
          </div>

          {/* Grid skeleton */}
          <PasseadoresGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
            <h3 className="font-semibold">Erro ao carregar passeadores</h3>
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg mb-4">
          <Users size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Passeadores
        </h1>
        <p className="text-gray-600">
          Encontre o profissional ideal para cuidar do seu pet
        </p>
      </div>

      {/* Filtros e busca */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Campo de busca */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por tipo de serviço */}
          <div>
            <select
              value={filterServico}
              onChange={(e) =>
                setFilterServico(
                  e.target.value === "all"
                    ? "all"
                    : (parseInt(e.target.value) as TipoServico)
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os serviços</option>
              <option value={TipoServico.PASSEIO}>Passeio</option>
              <option value={TipoServico.CUIDADO_DIARIO}>Cuidado Diário</option>
              <option value={TipoServico.HOSPEDAGEM}>Hospedagem</option>
              <option value={TipoServico.OUTRO}>Outro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de passeadores */}
      {filteredPasseadores && filteredPasseadores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPasseadores.map((passeador) => (
            <PasseadorCard
              key={passeador.usuarioId}
              passeador={passeador}
              onContact={handleContact}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <Users size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum passeador encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterServico !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Ainda não há passeadores cadastrados"}
          </p>
          <p className="text-sm text-gray-500">
            Quer se tornar um passeador?{" "}
            <a
              href="/cadastrar"
              className="text-blue-600 hover:underline font-medium"
            >
              Cadastre-se aqui
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
