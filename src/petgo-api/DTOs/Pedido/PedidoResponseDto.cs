using petgo_api.DTOs.ItemPedido;

namespace petgo_api.DTOs.Pedido
{
    public class PedidoResponseDto
    {
        public Guid Id { get; set; }
        public DateTime DataPedido { get; set; }
        public string Status { get; set; }
        public decimal ValorTotal { get; set; }
        public Guid UsuarioId { get; set; }
        public List<ItemPedidoResponseDto> Itens { get; set; } = new();
    }
}