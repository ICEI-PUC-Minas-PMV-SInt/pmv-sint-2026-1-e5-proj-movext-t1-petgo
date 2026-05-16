export interface PetResponseDto {
    id: string;
    nome: string;
    especie: string;
    raca: string;
    idade: number;
    status: string;
    descricao: string;
    fotoUrl: string | null;
    usuarioId: string;
    nomeDono: string;
    tipoDono: string;
    dataCadastro: string;
}

export interface PetCreateDto {
    nome: string;
    especie: number;
    raca: string;
    idade: number;
    status: number;
    descricao: string;
    fotoUrl?: string;
    usuarioId?: string;
}

export interface PetUpdateDto {
    nome?: string;
    descricao?: string;
    fotoUrl?: string;
    idade?: number;
}

export interface PetStatusUpdateDto {
    novoStatus: number;
}
