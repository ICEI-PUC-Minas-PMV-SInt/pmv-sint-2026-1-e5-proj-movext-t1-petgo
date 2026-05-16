
export interface ApiResponse<T> {
    status: boolean;
    dados: T;
    messagem: string;
}

export interface UsuarioResponseDto {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    tipo: string;
    documento: string;
    endereco: string;
    dataCadastro: string;
    fotoUrl: string | null;
}

export interface UsuarioCreateDto {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    documento: string;
    endereco: string;
    tipo: number; // 0: Adotante, 1: Ong, 2: Passeador
    fotoUrl?: string;
}

export interface UsuarioUpdateDto {
    nome: string;
    email: string;
    endereco: string;
    telefone: string;
    fotoUrl?: string;
}