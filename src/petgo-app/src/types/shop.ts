export interface ProdutoResponseDto {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
    estoque: number;
    fotoUrl: string | null;
    categoria: string;
    ongId?: string;
    nomeOng?: string;
}

export interface ProdutoCreateDto {
    nome: string;
    descricao: string;
    preco: number;
    estoque: number;
    fotoUrl?: string;
    categoria: string;
}

export interface PedidoResponseDto {
    id: string;
    dataPedido: string;
    valorTotal: number;
    status: string;
    itens: ItemPedidoResponseDto[];
}

export interface ItemPedidoResponseDto {
    id: string;
    produtoId: string;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
}

export interface PedidoCreateDto {
    itens: ItemPedidoCreateDto[];
}

export interface ItemPedidoCreateDto {
    produtoId: string;
    quantidade: number;
}
