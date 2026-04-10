using petgo_api.DTOs.Pedido;
using petgo_api.Enums;
using petgo_api.Models;

namespace petgo_api.Services.Pedidos
{
    public interface IPedidoInterface
    {
        Task<ApiResponse<PedidoResponseDto>> CriarPedido(PedidoCreateDto pedidoCreate, Guid usuarioLogadoId);
        Task<ApiResponse<PedidoResponseDto>> ConfirmarPagamentoSimulado(Guid pedidoId, Guid usuarioLogadoId);
        Task<ApiResponse<PedidoResponseDto>> GetPedidoById(Guid pedidoId, Guid usuarioLogadoId);
        Task<ApiResponse<List<PedidoResponseDto>>> ListarPedidos(Guid usuarioLogadoId);
        Task<ApiResponse<PedidoResponseDto>> AtualizarStatus(Guid pedidoId, StatusPedido novoStatus, Guid usuarioLogadoId);
        Task<ApiResponse<bool>> CancelarPedido(Guid pedidoId, Guid usuarioLogadoId);
    }
}