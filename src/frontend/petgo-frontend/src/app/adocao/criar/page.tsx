"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";

interface CreatePetInput {
  usuarioId: number;
  nome: string;
  especie: number;
  raca: string;
  idadeMeses: number;
  porte: number;
  cidade: string;
  estado: string;
  observacoes: string;
  fotosJson: string;
}

interface CreateAnuncioInput {
  petId: number;
  status: number;
  descricao: string;
  contatoWhatsapp: string | null;
  moderacao: number;
}

interface ImagePreview {
  url: string;
  file?: File;
}

export default function CriarAnuncioPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dados do formulário
  const [nomePet, setNomePet] = useState("");
  const [especie, setEspecie] = useState<number>(0);
  const [raca, setRaca] = useState("");
  const [anos, setAnos] = useState(0);
  const [meses, setMeses] = useState(0);
  const [porte, setPorte] = useState<number>(0);
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [fotos, setFotos] = useState<ImagePreview[]>([]);
  const [contatoWhatsapp, setContatoWhatsapp] = useState("");

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Converter arquivo para base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handler para adicionar fotos
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: ImagePreview[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} não é uma imagem válida`);
        continue;
      }

      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} é muito grande. Máximo 5MB por imagem.`);
        continue;
      }

      const url = URL.createObjectURL(file);
      newImages.push({ url, file });
    }

    setFotos([...fotos, ...newImages]);

    // Resetar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removerFoto = (index: number) => {
    const novasFotos = fotos.filter((_, i) => i !== index);
    setFotos(novasFotos);
  };

  // Mutation para criar pet e anúncio
  const createAnuncio = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      // Converter imagens para base64
      const fotosBase64: string[] = [];
      for (const foto of fotos) {
        if (foto.file) {
          const base64 = await convertToBase64(foto.file);
          fotosBase64.push(base64);
        }
      }

      // 1. Criar Pet
      const petData: CreatePetInput = {
        usuarioId: user.id,
        nome: nomePet,
        especie,
        raca,
        idadeMeses: anos * 12 + meses,
        porte,
        cidade,
        estado,
        observacoes,
        fotosJson: JSON.stringify(fotosBase64),
      };

      const petResponse = await api.post("/api/Pets", petData);
      const petId = petResponse.data.id;

      // 2. Criar Anúncio
      const anuncioData: CreateAnuncioInput = {
        petId,
        status: 0, // ATIVO
        descricao: observacoes,
        contatoWhatsapp: contatoWhatsapp.trim() || null,
        moderacao: 1, // APROVADO - anúncio já aprovado automaticamente
      };

      await api.post("/api/AnuncioDoacoes", anuncioData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anuncios-doacao"] });
      alert("Anúncio criado com sucesso!");
      router.push("/adocao");
    },
    onError: (error: unknown) => {
      const errObj = error as {
        response?: { data?: { message?: string } };
        message?: string;
      } | null;
      const errorMessage =
        errObj?.response?.data?.message || errObj?.message || "Erro ao criar anúncio";
      alert(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!nomePet.trim()) {
      alert("Informe o nome do pet!");
      return;
    }

    if (!raca.trim()) {
      alert("Informe a raça do pet!");
      return;
    }

    if (anos === 0 && meses === 0) {
      alert("Informe a idade do pet!");
      return;
    }

    if (!cidade.trim() || !estado.trim()) {
      alert("Informe a cidade e estado!");
      return;
    }

    if (!observacoes.trim()) {
      alert("Adicione uma descrição para o anúncio!");
      return;
    }

    if (observacoes.trim().length < 50) {
      alert("A descrição deve ter pelo menos 50 caracteres!");
      return;
    }

    if (fotos.length === 0) {
      alert("Adicione pelo menos uma foto do pet!");
      return;
    }

    createAnuncio.mutate();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/adocao")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Criar Anúncio de Adoção
            </h1>
            <p className="text-gray-600">
              Ajude um pet a encontrar um novo lar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome do Pet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nomePet}
                  onChange={(e) => setNomePet(e.target.value)}
                  required
                  placeholder="Ex: Rex, Luna, Bob..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              {/* Espécie */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Espécie <span className="text-red-500">*</span>
                </label>
                <select
                  value={especie}
                  onChange={(e) => setEspecie(Number(e.target.value))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value={0}>Cachorro</option>
                  <option value={1}>Gato</option>
                  <option value={2}>Outro</option>
                </select>
              </div>

              {/* Raça */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Raça <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={raca}
                  onChange={(e) => setRaca(e.target.value)}
                  required
                  placeholder="Ex: SRD, Vira-lata..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              {/* Idade */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Idade (Anos) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={anos}
                  onChange={(e) => setAnos(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Idade (Meses)
                </label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={meses}
                  onChange={(e) => setMeses(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              {/* Porte */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Porte <span className="text-red-500">*</span>
                </label>
                <select
                  value={porte}
                  onChange={(e) => setPorte(Number(e.target.value))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value={0}>Pequeno</option>
                  <option value={1}>Médio</option>
                  <option value={2}>Grande</option>
                </select>
              </div>

              {/* Cidade */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  required
                  placeholder="Ex: São Paulo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  required
                  placeholder="Ex: SP"
                  maxLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  required
                  rows={6}
                  placeholder="Conte sobre o pet: personalidade, comportamento, se é castrado, vacinado, motivo da doação, cuidados necessários, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Mínimo de 50 caracteres ({observacoes.length}/50)
                </p>
              </div>

              {/* Fotos */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fotos do Pet <span className="text-red-500">*</span>
                </label>

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  className="w-full mb-4"
                >
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Adicionar Fotos
                </Button>

                {/* Preview das Fotos */}
                {fotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {fotos.map((foto, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors"
                      >
                        <img
                          src={foto.url}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-40 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removerFoto(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2">
                          Foto {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  Formatos aceitos: JPG, PNG, GIF. Máximo 5MB por foto.
                </p>
              </div>

              {/* WhatsApp */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp para Contato (Opcional)
                </label>
                <input
                  type="tel"
                  value={contatoWhatsapp}
                  onChange={(e) => setContatoWhatsapp(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Se não informado, usaremos o telefone do seu cadastro
                </p>
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Certifique-se de fornecer
                informações verdadeiras e completas sobre o pet. O anúncio será
                publicado imediatamente após a criação.
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => router.push("/adocao")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createAnuncio.isPending}
              >
                {createAnuncio.isPending ? "Criando..." : "Criar Anúncio"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
