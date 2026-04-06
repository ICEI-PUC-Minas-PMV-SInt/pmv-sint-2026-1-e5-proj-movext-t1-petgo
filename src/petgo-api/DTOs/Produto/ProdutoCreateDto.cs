using System.ComponentModel.DataAnnotations;

namespace petgo_api.DTOs.Produto
{
    public class ProdutoCreateDto
    {
        public Guid Id { get; set; }
        [Required(ErrorMessage = "O nome do produto é obrigatório.")]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "A descrição é obrigatória.")]
        [MaxLength(500)]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "O preço é obrigatório.")]
        public decimal Preco { get; set; }

        [Required(ErrorMessage = "A quantidade em estoque é obrigatória.")]
        public int Estoque { get; set; }

        public string? FotoUrl { get; set; }

        public string Categoria { get; set; } = "Geral";
    }
}