export interface Pet {
  id: number;
  nome: string;
  descricao: string;
  preco: number; // Será 0 para adoção
  categoriaId: number; // 4 para Adoção
  especie: string;
  raca: string;
  idade?: number; // Ou dataNascimento
  sexo?: 'Macho' | 'Femea';
  imagens: string[]; // Lista de URLs
  castrado: boolean;
  vacinado: boolean;
}
