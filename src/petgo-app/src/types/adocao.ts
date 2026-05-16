export interface AdocaoResponseDto {
    id: string;
    dataSolicitacao: string;
    status: string;
    petId: string;
    nomePet: string;
    fotoPetUrl?: string;
    // Adotante
    adotanteId: string;
    nomeAdotante: string;
    emailAdotante: string;
    telefoneAdotante: string;
    fotoAdotanteUrl?: string;
    // Doador (dono original do pet)
    nomeDoador?: string;
    emailDoador?: string;
    telefoneDoador?: string;
    fotoDoadorUrl?: string;
}

export interface AdocaoCreateDto {
    petId: string;
}

export interface AdocaoStatusUpdateDto {
    novoStatus: number; // 0: Pendente, 1: EmAnalise, 2: Aprovado, 3: Recusado
}
