using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using petgo_api.Enums;

namespace petgo_api.Models
{

    public class Pedido
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public DateTime DataPedido { get; set; } = DateTime.UtcNow;

        [Required]
        public StatusPedido Status { get; set; } = StatusPedido.Pendente;

        [Column(TypeName = "decimal(18,2)")]
        public decimal ValorTotal { get; set; }

        [Required]
        public Guid UsuarioId { get; set; }

        [ForeignKey("UsuarioId")]
        public virtual Usuario Usuario { get; set; }
        public virtual ICollection<ItemPedido> Itens { get; set; } = new List<ItemPedido>();
    }
}