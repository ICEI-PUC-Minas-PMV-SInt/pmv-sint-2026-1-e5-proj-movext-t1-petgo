export interface TipoPasseioResponseDto {
    id: string;
    nome: string;
    descricao: string;
    precoBase: number;
    duracaoMinutos: number;
    passeadorId?: string;
}

export interface TipoPasseioCreateDto {
    nome: string;
    duracaoMinutos: number;
    precoBase: number;
}

export interface PasseioCreateDto {
    dataHoraPasseio: string; // ISO String
    descricaoPasseio: string;
    petId: string;
    passeadorId: string;
    tipoPasseioId: string;
}

export interface PasseioResponseDto {
    id: string;
    dataHoraPasseio: string;
    valorTotal: number;
    descricaoPasseio: string;
    status: string;
    tutorId: string;
    nomePet: string;
    nomePasseador: string;
    nomeTipoPasseio: string;
    fotoPetUrl?: string;
    fotoPasseadorUrl?: string;
}