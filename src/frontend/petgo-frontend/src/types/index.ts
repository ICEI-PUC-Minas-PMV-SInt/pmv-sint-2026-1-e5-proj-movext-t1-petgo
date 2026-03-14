import { z } from "zod";

// Enums baseados no backend
export enum TipoUsuario {
  CLIENTE = 0,
  PASSEADOR = 1,
  ADMIN = 2,
}

export enum EspeciePet {
  CACHORRO = 0,
  GATO = 1,
  OUTRO = 2,
}

export enum PortePet {
  PEQUENO = 0,
  MEDIO = 1,
  GRANDE = 2,
}

export enum StatusProduto {
  RASCUNHO = 0,
  ATIVO = 1,
  INATIVO = 2,
}

export enum StatusAnuncio {
  ATIVO = 0,
  PAUSADO = 1,
  ADOTADO = 2,
  REMOVIDO = 3,
}

export enum Moderacao {
  PENDENTE = 0,
  APROVADO = 1,
  REJEITADO = 2,
}

export enum AlvoTipo {
  PASSEADOR = 0,
  SERVICO = 1,
  PRODUTO = 2,
}

export enum TipoServico {
  PASSEIO = 0,
  CUIDADO_DIARIO = 1,
  HOSPEDAGEM = 2,
  OUTRO = 3,
}

// Schemas Zod para validação

export const ServicoPasseadorSchema = z.object({
  id: z.number(),
  titulo: z.string(),
  descricao: z.string(),
  tipoServico: z.nativeEnum(TipoServico),
});

export const PasseadorSchema = z.object({
  usuarioId: z.number(),
  descricao: z.string(),
  valorCobrado: z.number(),
  avaliacaoMedia: z.number(),
  quantidadeAvaliacoes: z.number(),
  nome: z.string(),
  fotoPerfil: z.string(),
  telefone: z.string(),
  servicos: z.array(ServicoPasseadorSchema),
});

export const EnderecoSchema = z.object({
  id: z.number(),
  usuarioId: z.number(),
  rua: z.string(),
  estado: z.string(),
  cep: z.string(),
  pais: z.string(),
});

export const UsuarioSchema = z.object({
  id: z.number(),
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  tipo: z.nativeEnum(TipoUsuario),
  fotoPerfil: z.string(),
  dataCriacao: z.string(),

  enderecos: z.array(EnderecoSchema).optional(),
  pets: z.array(z.lazy(() => PetSchema)).optional(),
  passeador: PasseadorSchema.nullable().optional(),
});

export const PetSchema: z.ZodType = z.object({
  id: z.number(),
  usuarioId: z.number(),
  nome: z.string().min(1, "Nome é obrigatório"),
  especie: z.nativeEnum(EspeciePet),
  raca: z.string().min(1, "Raça é obrigatória"),
  idadeMeses: z.number().min(0, "Idade deve ser positiva"),
  porte: z.nativeEnum(PortePet),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(1, "Estado é obrigatório"),
  fotos: z.array(z.string()),
  observacoes: z.string(),
  usuario: z.lazy(() => UsuarioSchema).optional(),
  anuncioDoacao: z.lazy(() => AnuncioDoacaoSchema).optional(),
});

export const ProdutoSchema = z.object({
  id: z.number(),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  preco: z.number().min(0, "Preço deve ser positivo"),
  imagens: z.array(z.string()),
  categoriaId: z.number(),
  estoque: z.number().min(0, "Estoque deve ser positivo"),
  status: z.nativeEnum(StatusProduto),
  categoriaProdutoId: z.number(),
  categoriaProduto: z.any().optional(),
  avaliacaoMedia: z.number(),
  quantidadeAvaliacoes: z.number(),
});

export const AnuncioDoacaoSchema: z.ZodType = z.object({
  id: z.number(),
  petId: z.number(),
  status: z.nativeEnum(StatusAnuncio),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  contatoWhatsapp: z.string().optional(),
  moderacao: z.nativeEnum(Moderacao),
  pet: z.lazy(() => PetSchema).optional(),
});

// Types inferidos dos schemas
export type Usuario = z.infer<typeof UsuarioSchema>;
export type Pet = z.infer<typeof PetSchema>;
export type Produto = z.infer<typeof ProdutoSchema>;
export type AnuncioDoacao = z.infer<typeof AnuncioDoacaoSchema>;

export type PasseadorDto = z.infer<typeof PasseadorSchema>;
export type Passeador = PasseadorDto; // Alias para compatibilidade
export type ServicoPasseadorDto = z.infer<typeof ServicoPasseadorSchema>;
export type EnderecoDto = z.infer<typeof EnderecoSchema>;

// Types para formulários
export type CreateProdutoInput = Omit<
  Produto,
  "id" | "categoriaProduto" | "avaliacaoMedia" | "quantidadeAvaliacoes"
>;
export type UpdateProdutoInput = Partial<CreateProdutoInput>;
export type CreatePetInput = Omit<Pet, "id" | "usuario" | "anuncioDoacao">;
export type UpdatePetInput = Partial<CreatePetInput>;

// Types para passeadores
export type CreatePasseadorInput = {
  usuarioId: number;
  descricao: string;
  valorCobrado: number;
};
export type UpdatePasseadorInput = Partial<
  Omit<CreatePasseadorInput, "usuarioId">
>;

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ProdutoDetalhado extends Produto {
  avaliacoes?: Avaliacao[];
  relacionados?: Produto[];
}

export interface Avaliacao {
  id: number;
  alvoTipo: AlvoTipo;
  alvoId: number;
  nota: number;
  titulo: string;
  comentario: string;
  autorNome: string | null;
  dataCriacao: string;
}

export interface CreateAvaliacaoInput {
  alvoTipo: AlvoTipo;
  alvoId: number;
  nota: number;
  titulo: string;
  comentario: string;
  autorNome?: string;
}

export interface LoginDto {
  email: string;
  senha: string;
}

export interface LoginResponseDto {
  token: string;
  usuario: Usuario;
}

// Carrinho de compras
export const CarrinhoItemSchema = z.object({
  id: z.number(),
  usuarioId: z.number(),
  produtoId: z.number(),
  quantidade: z.number(),
  dataAdicao: z.string(),
  produto: ProdutoSchema.nullable().optional(),
});

export type CarrinhoItem = z.infer<typeof CarrinhoItemSchema>;

export type CreateCarrinhoItemInput = {
  usuarioId: number;
  produtoId: number;
  quantidade: number;
};

export interface CarrinhoTotal {
  total: number;
  quantidadeItens: number;
}
