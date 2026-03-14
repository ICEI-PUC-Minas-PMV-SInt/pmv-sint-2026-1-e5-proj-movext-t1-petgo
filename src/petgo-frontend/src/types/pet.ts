export interface Pet {
  id: number;
  nome: string;
  descricao: string;
  preco: number; // 0 para adoção
  categoriaId: number; // 4 para Adoção
  especie: string;
  raca: string;
  idade?: number;
  sexo?: "Macho" | "Femea";
  imagens: string[]; // Lista de URLs
  castrado: boolean;
  vacinado: boolean;
}

export interface AdoptionFormPayload {
  petId: string;
  name: string;
  email: string;
  message: string;
}
