export interface PasseadorServicoResponseDto {
    id: string;
    passeadorId: string;
    tipoPasseioId: string;
    nomeTipoPasseio: string;
    duracaoMinutos: number;
    precoCustomizado: number;
}

export interface PasseadorServicoCreateDto {
    tipoPasseioId: string;
    precoCustomizado: number;
}
