using FluentAssertions;
using petgo_api.DTOs.ItemPedido;
using petgo_api.DTOs.Pedido;
using petgo_api.Enums;
using petgo_api.Models;
using petgo_api.Services.Pedidos;
using petgo_test.Base;


namespace petgo_test.Services.Pedidos
{
    public class PedidoServiceTests : TestBase
    {
        [Fact]
        public async Task CriarPedido_DeveReduzirEstoqueECalcularTotal_QuandoSucesso()
        {
            var context = GetContext();
            var service = new PedidoService(context);

            var usuarioId = Guid.NewGuid();
            var produtoId = Guid.NewGuid();

            var produto = new Produto
            {
                Id = produtoId,
                Nome = "Ração Premium",
                Preco = 50.00m,
                Estoque = 10,
                Descricao = "Ração de altissíma qualidade",
                Categoria = "Alimentos"
            };

            context.Produtos.Add(produto);
            await context.SaveChangesAsync();

            var pedidoDto = new PedidoCreateDto
            {
                Itens = new List<ItemPedidoCreateDto>
                {
                        new ItemPedidoCreateDto { ProdutoId = produtoId, Quantidade = 2 }
                }
            };

            var resultado = await service.CriarPedido(pedidoDto, usuarioId);

            resultado.Status.Should().BeTrue();
            resultado.Dados.ValorTotal.Should().Be(100.00m);

            var produtoNoBanco = await context.Produtos.FindAsync(produtoId);

            produtoNoBanco.Should().NotBeNull();
            produtoNoBanco.Estoque.Should().Be(8);
        }

        [Fact]
        public async Task CriarPedido_DeveRetornarErro_QuandoEstoqueForInsuficiente()
        {
            var context = GetContext();
            var service = new PedidoService(context);

            var usuarioId = Guid.NewGuid();
            var produtoId = Guid.NewGuid();

            var produto = new Produto
            {
                Id = produtoId,
                Nome = "Coleira",
                Preco = 30.00m,
                Estoque = 5,
                Descricao = "Acessório de coleira",
                Categoria = "Acessórios"
            };
            context.Produtos.Add(produto);
            await context.SaveChangesAsync();

            var pedidoDto = new PedidoCreateDto
            {
                Itens = new List<ItemPedidoCreateDto>
                    {
                        new ItemPedidoCreateDto { ProdutoId = produtoId, Quantidade = 6 }
                    }
            };

            var resultado = await service.CriarPedido(pedidoDto, usuarioId);

            resultado.Status.Should().BeFalse();
            resultado.Messagem.Should().Contain("Estoque insuficiente");
        }

        [Fact]
        public async Task CancelarPedido_DeveDevolverProdutosAoEstoque()
        {
            var context = GetContext();
            var service = new PedidoService(context);

            var usuarioId = Guid.NewGuid();
            var produtoId = Guid.NewGuid();
            var pedidoId = Guid.NewGuid();

            var produto = new Produto
            {
                Id = produtoId,
                Nome = "Ração Premium",
                Preco = 50.00m,
                Estoque = 10,
                Descricao = "Ração de altissíma qualidade",
                Categoria = "Alimentos"
            };

            context.Produtos.Add(produto);

            produto.Estoque = 7;

            var pedido = new Pedido
            {
                Id = pedidoId,
                UsuarioId = usuarioId,
                Status = StatusPedido.Pendente,
                ValorTotal = 75.00m,
                Itens = new List<ItemPedido>
                    {
                     new ItemPedido
                    {
                        Id = Guid.NewGuid(),
                        ProdutoId = produtoId,
                        Quantidade = 3,
                        PrecoUnitario = 25.00m
                    }
                    }
            };

            context.Pedidos.Add(pedido);
            await context.SaveChangesAsync();

            var resultado = await service.CancelarPedido(pedidoId, usuarioId);

            resultado.Status.Should().BeTrue();
            resultado.Messagem.Should().Contain("produtos devolvidos ao estoque");

            var produtoNoBanco = await context.Produtos.FindAsync(produtoId);
            produtoNoBanco.Should().NotBeNull();
            produtoNoBanco.Estoque.Should().Be(10);

            var pedidoNoBanco = await context.Pedidos.FindAsync(pedidoId);
            pedidoNoBanco.Should().NotBeNull();
            pedidoNoBanco.Status.Should().Be(StatusPedido.Cancelado);
        }

        [Fact]
        public async Task CancelarPedido_DeveRetornarErro_QuandoUsuarioNaoForODono()
        {
            var context = GetContext();
            var service = new PedidoService(context);

            var donoDoPedidoId = Guid.NewGuid();
            var usuarioInvasorId = Guid.NewGuid();
            var pedidoId = Guid.NewGuid();

            var pedido = new Pedido
            {
                Id = pedidoId,
                UsuarioId = donoDoPedidoId,
                Status = StatusPedido.Pendente,
                ValorTotal = 100
            };
            context.Pedidos.Add(pedido);
            await context.SaveChangesAsync();

            var resultado = await service.CancelarPedido(pedidoId, usuarioInvasorId);

            resultado.Status.Should().BeFalse();
            resultado.Messagem.Should().Be("Você não tem permissão para cancelar este pedido.");

            var pedidoNoBanco = await context.Pedidos.FindAsync(pedidoId);
            pedidoNoBanco.Should().NotBeNull();
            pedidoNoBanco.Status.Should().Be(StatusPedido.Pendente);
        }

        [Fact]
        public async Task CancelarPedido_DeveRetornarErro_QuandoStatusJaForEnviado()
        {
            var context = GetContext();
            var service = new PedidoService(context);

            var usuarioId = Guid.NewGuid();
            var pedidoId = Guid.NewGuid();

            var pedido = new Pedido
            {
                Id = pedidoId,
                UsuarioId = usuarioId,
                Status = StatusPedido.Enviado,
                DataPedido = DateTime.UtcNow,
                ValorTotal = 80.00m
            };

            context.Pedidos.Add(pedido);
            await context.SaveChangesAsync();

            var resultado = await service.CancelarPedido(pedidoId, usuarioId);

            resultado.Status.Should().BeFalse();
            resultado.Messagem.Should().Be("Não é possível cancelar um pedido que já foi enviado ou concluído.");

            var pedidoNoBanco = await context.Pedidos.FindAsync(pedidoId);
            pedidoNoBanco.Should().NotBeNull();
            pedidoNoBanco.Status.Should().Be(StatusPedido.Enviado);
        }
    }
}