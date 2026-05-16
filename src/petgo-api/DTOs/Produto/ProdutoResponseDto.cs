
namespace petgo_api.DTOs.Produto
{
    public class ProdutoResponseDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public decimal Preco { get; set; }
        public int Estoque { get; set; }
        public string FotoUrl { get; set; }
        public string Categoria { get; set; } = "Geral";
        public string? OngId { get; set; }
        public string? NomeOng { get; set; }
    }
}