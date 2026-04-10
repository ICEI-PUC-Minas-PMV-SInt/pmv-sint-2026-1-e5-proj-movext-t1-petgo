using System.ComponentModel.DataAnnotations;
using petgo_api.DTOs.ItemPedido;

namespace petgo_api.DTOs.Pedido
{
    public class PedidoCreateDto
    {
        [Required]
        public Guid UsuarioId { get; set; }

        [Required]
        public List<ItemPedidoCreateDto> Itens { get; set; } = new();
    }
}