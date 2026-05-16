export interface PetResponseDto {
    id: string;
    nome: string;
    especie: string;
    raca: string;
    idade: number;
    status: string;
    descricao: string;
    fotoUrl: string | null;
    sexo: string;
    porte: string;
    saude: string;
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
    sexo: number;
    porte: number;
    usuarioId?: string;
}

export interface PetUpdateDto {
    nome?: string;
    descricao?: string;
    fotoUrl?: string;
    idade?: number;
    sexo?: number;
    porte?: number;
    saude?: string;
    status?: string;
}

export interface PetStatusUpdateDto {
    novoStatus: number;
}
