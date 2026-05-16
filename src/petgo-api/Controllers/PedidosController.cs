using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using petgo_api.DTOs.Pedido;
using petgo_api.Enums;
using petgo_api.Models;
using petgo_api.Services.Pedidos;

namespace petgo_api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : BaseController
    {
        private readonly IPedidoInterface _pedidoInterface;

        public PedidosController(IPedidoInterface pedidoInterface)
        {
            _pedidoInterface = pedidoInterface;
        }

        [HttpGet("meus-pedidos")]
        public async Task<ActionResult<ApiResponse<List<PedidoResponseDto>>>> ListarPedidos()
        {
            var pedidos = await _pedidoInterface.ListarPedidos(GetUsuarioLogadoId());
            return Ok(pedidos);
        }

        [HttpGet("minhas-vendas")]
        public async Task<ActionResult<ApiResponse<List<PedidoResponseDto>>>> ListarVendas()
        {
            var vendas = await _pedidoInterface.ListarVendas(GetUsuarioLogadoId());
            return Ok(vendas);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<PedidoResponseDto>>> CriarPedido(PedidoCreateDto pedidoCreate)
        {
            var response = await _pedidoInterface.CriarPedido(pedidoCreate, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return CreatedAtAction(nameof(GetPedidoById), new { id = response.Dados.Id }, response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<PedidoResponseDto>>> GetPedidoById(Guid id)
        {
            var response = await _pedidoInterface.GetPedidoById(id, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [HttpPut("pagar/{id}")]
        public async Task<ActionResult<ApiResponse<PedidoResponseDto>>> PagarPedido(Guid id)
        {
            var response = await _pedidoInterface.ConfirmarPagamentoSimulado(id, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPut("cancelar/{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> CancelarPedido(Guid id)
        {
            var response = await _pedidoInterface.CancelarPedido(id, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPatch("atualizar-status/{id}")]
        public async Task<ActionResult<ApiResponse<PedidoResponseDto>>> AtualizarStatus(Guid id, StatusPedido novoStatus)
        {
            var tipo = GetUsuarioLogadoTipo();

            if (tipo != TipoUsuario.Admin && tipo != TipoUsuario.Ong)
            {
                var erroResponse = new ApiResponse<string>
                {
                    Status = false,
                    Messagem = "Apenas administradores e ongs podem realizar esta ação."
                };

                return StatusCode(StatusCodes.Status403Forbidden, erroResponse);
            }

            var response = await _pedidoInterface.AtualizarStatus(id, novoStatus, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }
    }
}