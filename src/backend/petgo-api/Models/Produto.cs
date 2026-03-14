using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace petgo.api.Models
{
    public enum StatusProduto
    {
        RASCUNHO = 0,
        ATIVO = 1,
        INATIVO = 2
    }

    public class Produto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Descricao { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Preco { get; set; }

        [Required]
        public int Estoque { get; set; }

        public StatusProduto Status { get; set; } = StatusProduto.ATIVO;

        [Required]
        public double AvaliacaoMedia { get; set; } = 0;
        
        [Required]
        public int QuantidadeAvaliacoes { get; set; } = 0;

        // Foreign Keys
        public int CategoriaProdutoId { get; set; }

        // Navigation Property - ADICIONAR ESTA PROPRIEDADE!
        [ForeignKey("CategoriaProdutoId")]
        public CategoriaProduto? Categoria { get; set; }

        // Imagens em JSON
        [Column(TypeName = "jsonb")]
        public string ImagensJson { get; set; } = "[]";

        [NotMapped]
        public List<string> Imagens
        {
            get => string.IsNullOrEmpty(ImagensJson) 
                ? new List<string>() 
                : System.Text.Json.JsonSerializer.Deserialize<List<string>>(ImagensJson) ?? new List<string>();
            set => ImagensJson = System.Text.Json.JsonSerializer.Serialize(value);
        }
    }
}