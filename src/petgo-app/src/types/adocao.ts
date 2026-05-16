export interface AdocaoResponseDto {
    id: string;
    dataSolicitacao: string;
    status: string;
    tutorId: string;
    petId: string;
    nomePet: string;
    fotoPetUrl?: string;
    nomeTutorSolicitante: string;
    nomeDonoAtual: string;
}

export interface AdocaoCreateDto {
    petId: string;
}

export interface AdocaoStatusUpdateDto {
    novoStatus: number; // 0: Pendente, 1: Aprovado, 2: Recusado
}
