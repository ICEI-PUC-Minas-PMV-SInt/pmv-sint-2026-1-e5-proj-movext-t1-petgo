using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace petgo.api.Models
{
    public class CarrinhoItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [Required]
        public int ProdutoId { get; set; }

        [Required]
        public int Quantidade { get; set; } = 1;

        [Required]
        public DateTime DataAdicao { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }

        [ForeignKey("ProdutoId")]
        public Produto? Produto { get; set; }
    }
}
