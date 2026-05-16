using Microsoft.EntityFrameworkCore;
using petgo_api.Data;
using petgo_api.DTOs.ItemPedido;
using petgo_api.DTOs.Pedido;
using petgo_api.Enums;
using petgo_api.Models;

namespace petgo_api.Services.Pedidos
{
    public class PedidoService : IPedidoInterface
    {
        private readonly AppDbContext _context;

        public PedidoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<PedidoResponseDto>> AtualizarStatus(Guid pedidoId, StatusPedido novoStatus, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<PedidoResponseDto>();

            try
            {
                var pedido = await _context.Pedidos
                                        .Include(p => p.Itens)
                                        .FirstOrDefaultAsync(p => p.Id == pedidoId);

                if (pedido == null)
                {
                    response.Status = false;
                    response.Messagem = "pedido não encontrado.";
                    return response;
                }

                pedido.Status = novoStatus;

                _context.Pedidos.Update(pedido);
                await _context.SaveChangesAsync();

                response.Dados = MapToDto(pedido);
                response.Messagem = $"Status atualizado para {novoStatus} com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<bool>> CancelarPedido(Guid pedidoId, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<bool>();

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var pedido = await _context.Pedidos
                                        .Include(p => p.Itens)
                                        .FirstOrDefaultAsync(p => p.Id == pedidoId);

                if (pedido == null)
                {
                    response.Status = false;
                    response.Messagem = "pedido não encontrado";
                    return response;
                }

                if (pedido.UsuarioId != usuarioLogadoId)
                {
                    response.Status = false;
                    response.Messagem = "Você não tem permissão para cancelar este pedido.";
                    return response;
                }

                if (pedido.Status == StatusPedido.Enviado || pedido.Status == StatusPedido.Entregue)
                {
                    response.Status = false;
                    response.Messagem = "Não é possível cancelar um pedido que já foi enviado ou concluído.";
                    return response;
                }

                foreach (var item in pedido.Itens)
                {
                    var produto = await _context.Produtos.FindAsync(item.ProdutoId);
                    if (produto != null)
                    {
                        produto.Estoque += item.Quantidade;
                        _context.Produtos.Update(produto);
                    }
                }


                pedido.Status = StatusPedido.Cancelado;
                _context.Pedidos.Update(pedido);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                response.Dados = true;
                response.Messagem = "Pedido cancelado e produtos devolvidos ao estoque!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<PedidoResponseDto>> CriarPedido(PedidoCreateDto pedidoCreate, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<PedidoResponseDto>();

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var novoPedido = new Pedido
                {
                    Id = Guid.NewGuid(),
                    UsuarioId = usuarioLogadoId,
                    DataPedido = DateTime.UtcNow,
                    Status = StatusPedido.Pendente,
                    ValorTotal = 0
                };

                decimal totalAcumulado = 0;

                foreach (var itemDto in pedidoCreate.Itens)
                {
                    var produto = await _context.Produtos
                                            .FirstOrDefaultAsync(p => p.Id == itemDto.ProdutoId);
                    if (produto == null)
                    {
                        response.Status = false;
                        response.Messagem = $"Produto com ID {itemDto.ProdutoId} não encontrado.";
                        return response;
                    }

                    if (produto.Estoque < itemDto.Quantidade)
                    {
                        response.Status = false;
                        response.Messagem = $"Estoque insuficiente para o produto: {produto.Nome}. Disponível: {produto.Estoque}";
                        return response;
                    }

                    var novoItem = new ItemPedido
                    {
                        Id = Guid.NewGuid(),
                        PedidoId = novoPedido.Id,
                        ProdutoId = produto.Id,
                        Produto = produto, // Set product navigation property to ensure MapToDto works
                        Quantidade = itemDto.Quantidade,
                        PrecoUnitario = produto.Preco
                    };

                    produto.Estoque -= itemDto.Quantidade;
                    _context.Produtos.Update(produto);

                    totalAcumulado += novoItem.PrecoUnitario * novoItem.Quantidade;
                    novoPedido.Itens.Add(novoItem);
                }

                novoPedido.ValorTotal = totalAcumulado;

                _context.Pedidos.Add(novoPedido);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                response.Dados = MapToDto(novoPedido);
                response.Messagem = "Pedido realizado e estoque atualizado!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
                await transaction.RollbackAsync();
            }
            return response;
        }

        public async Task<ApiResponse<PedidoResponseDto>> ConfirmarPagamentoSimulado(Guid pedidoId, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<PedidoResponseDto>();

            try
            {
                var pedido = await _context.Pedidos
                                        .Include(p => p.Itens)
                                        .FirstOrDefaultAsync(p => p.Id == pedidoId && p.UsuarioId == usuarioLogadoId);

                if (pedido == null)
                {
                    response.Status = false;
                    response.Messagem = "Pedido não encontrado ou você não tem permisssao.";
                    return response;
                }

                if (pedido.Status != StatusPedido.Pendente)
                {
                    response.Status = false;
                    response.Messagem = "Este pedido já foi processado ou cancelado";
                    return response;
                }

                pedido.Status = StatusPedido.Pago;

                _context.Pedidos.Update(pedido);
                await _context.SaveChangesAsync();

                response.Dados = MapToDto(pedido);
                response.Messagem = "Pagamento aprovado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<PedidoResponseDto>> GetPedidoById(Guid pedidoId, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<PedidoResponseDto>();

            try
            {
                var pedido = await _context.Pedidos
                                    .Include(p => p.Itens)
                                    .ThenInclude(i => i.Produto)
                                    .FirstOrDefaultAsync(p => p.Id == pedidoId);

                if (pedido == null)
                {
                    response.Status = false;
                    response.Messagem = "Pedido não encontrado";
                    return response;
                }

                response.Dados = MapToDto(pedido);
                response.Messagem = "Pedido encontrado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }
            return response;
        }

        public async Task<ApiResponse<List<PedidoResponseDto>>> ListarPedidos(Guid usuarioLogadoId)
        {
            var response = new ApiResponse<List<PedidoResponseDto>>();

            try
            {
                var pedidos = await _context.Pedidos
                                            .Include(p => p.Itens)
                                            .ThenInclude(i => i.Produto)
                                            .Where(p => p.UsuarioId == usuarioLogadoId)
                                            .OrderByDescending(p => p.DataPedido)
                                            .ToListAsync();

                response.Dados = pedidos.Select(p => MapToDto(p)).ToList();
                response.Messagem = "Histórico de pedidos carregado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<List<PedidoResponseDto>>> ListarVendas(Guid usuarioLogadoId)
        {
            var response = new ApiResponse<List<PedidoResponseDto>>();

            try
            {
                // Busca pedidos que contenham pelo menos um item do vendedor logado
                var pedidos = await _context.Pedidos
                                            .Include(p => p.Itens)
                                            .ThenInclude(i => i.Produto)
                                            .Where(p => p.Itens.Any(i => i.Produto.UsuarioId == usuarioLogadoId))
                                            .OrderByDescending(p => p.DataPedido)
                                            .ToListAsync();

                response.Dados = pedidos.Select(p => MapToDto(p)).ToList();
                response.Messagem = "Lista de vendas carregada com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        private static PedidoResponseDto MapToDto(Pedido pedido)
        {
            return new PedidoResponseDto
            {
                Id = pedido.Id,
                DataPedido = pedido.DataPedido,
                Status = pedido.Status.ToString(),
                ValorTotal = pedido.ValorTotal,
                UsuarioId = pedido.UsuarioId,
                Itens = pedido.Itens.Select(i => new ItemPedidoResponseDto
                {
                    Id = i.Id,
                    ProdutoId = i.ProdutoId,
                    NomeProduto = !string.IsNullOrEmpty(i.Produto?.Nome) ? i.Produto.Nome : "Produto",
                    Quantidade = i.Quantidade,
                    PrecoUnitario = i.PrecoUnitario
                }).ToList()
            };
        }


    }
}