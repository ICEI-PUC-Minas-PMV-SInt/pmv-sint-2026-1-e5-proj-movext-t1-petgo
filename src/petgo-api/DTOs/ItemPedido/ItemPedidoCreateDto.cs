using System.ComponentModel.DataAnnotations;

namespace petgo_api.DTOs.ItemPedido
{
    public class ItemPedidoCreateDto
    {
        [Required]
        public Guid ProdutoId { get; set; }

        [Required]
        public int Quantidade { get; set; }
    }
}