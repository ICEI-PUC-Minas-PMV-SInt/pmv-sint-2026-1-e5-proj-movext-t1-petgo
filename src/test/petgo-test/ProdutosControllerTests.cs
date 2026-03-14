using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using petgo.api.Controllers;
using petgo.api.Data;
using petgo.api.Models;

namespace petgo.test
{
    [TestFixture]
    public class ProdutosControllerTests
    {
        private AppDbContext _context = null!;
        private ProdutosController _controller = null!;

        [SetUp]
        public async Task SetUp()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                            .UseInMemoryDatabase(Guid.NewGuid().ToString())
                            .Options;

            _context = new AppDbContext(options);
            _context.CategoriasProdutos.Add(new petgo.api.Models.CategoriaProduto { Id = 1, Nome = "Cães", Descricao = "Geral" });
            await _context.SaveChangesAsync();

            _context.Produtos.Add(new Produto
            {
                Id = 1,
                Nome = "Ração",
                Descricao = "Ração para cães",
                Preco = 50,
                Estoque = 10,
                CategoriaProdutoId = 1,
                Status = StatusProduto.ATIVO
            });

            await _context.SaveChangesAsync();
            _context.ChangeTracker.Clear();

            _controller = new ProdutosController(_context);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Dispose();
        }


        [Test]
        public async Task GetProdutos_ReturnsAllItens()
        {
            var result = await _controller.GetProdutos();
            var okResult = result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null, "O resultado não foi um OkObjectResult");

            var produtos = okResult!.Value as System.Collections.IEnumerable;
            Assert.That(produtos, Is.Not.Null, "O valor retornado estava nulo");

            var count = produtos!.Cast<object>().Count();
            Assert.That(count, Is.EqualTo(1));
        }

        [Test]
        public async Task GetById_ExistingId_ReturnsProduto()
        {
            var result = await _controller.GetProduto(1);
            var okResult = result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null, "O resultado não foi um OkObjectResult");

            var produtoObj = okResult!.Value;
            Assert.That(produtoObj, Is.Not.Null, "O valor retornado estava nulo");

            Assert.That(produtoObj, Has.Property("Id").EqualTo(1));
            Assert.That(produtoObj, Has.Property("Nome").EqualTo("Ração"));
        }

        [Test]
        public async Task Create_WhenValidProdutoPassed_ReturnsCreatedProduto()
        {
            var novoProduto = new Produto
            {
                Id = 2,
                Nome = "Coleira",
                Descricao = "Coleira para cães",
                Preco = 30,
                Estoque = 15,
                CategoriaProdutoId = 1,
                Status = StatusProduto.ATIVO
            };

            var result = await _controller.CreateProduto(novoProduto);
            var createdResult = result.Result as CreatedAtActionResult;
            var produtoCriado = createdResult?.Value as Produto;

            Assert.Multiple(() =>
            {
                Assert.That(createdResult, Is.Not.Null);
                Assert.That(produtoCriado, Is.Not.Null);
                Assert.That(produtoCriado!.Id, Is.EqualTo(novoProduto.Id));
                Assert.That(produtoCriado.Nome, Is.EqualTo(novoProduto.Nome));
                Assert.That(produtoCriado.Preco, Is.EqualTo(novoProduto.Preco));
                Assert.That(produtoCriado.Estoque, Is.EqualTo(novoProduto.Estoque));
                Assert.That(produtoCriado.CategoriaProdutoId, Is.EqualTo(novoProduto.CategoriaProdutoId));
                Assert.That(produtoCriado.Status, Is.EqualTo(novoProduto.Status));
            });

            var produtoDb = await _context.Produtos.FindAsync(novoProduto.Id);
            Assert.That(produtoDb, Is.Not.Null);
            Assert.That(produtoDb!.Nome, Is.EqualTo("Coleira"));
        }


        [Test]
        public async Task Update_ExistingProduto_ReturnsNoContent()
        {
            var produtoAtualizado = new Produto
            {
                Id = 1,
                Nome = "Ração Premium",
                Descricao = "Ração de alta qualidade",
                Preco = 70,
                Estoque = 20,
                CategoriaProdutoId = 1,
                Status = StatusProduto.ATIVO
            };

            var result = await _controller.UpdateProduto(1, produtoAtualizado) as NoContentResult;

            var produtoDb = await _context.Produtos.FindAsync(1);

            Assert.Multiple(() =>
            {
                Assert.That(result, Is.InstanceOf<NoContentResult>());
                Assert.That(produtoDb!.Nome, Is.EqualTo("Ração Premium"));
                Assert.That(produtoDb.Descricao, Is.EqualTo("Ração de alta qualidade"));
                Assert.That(produtoDb.Preco, Is.EqualTo(70));
                Assert.That(produtoDb.Estoque, Is.EqualTo(20));
                Assert.That(produtoDb.CategoriaProdutoId, Is.EqualTo(1));
                Assert.That(produtoDb.Status, Is.EqualTo(StatusProduto.ATIVO));
            });

        }

        [Test]
        public async Task Delete_ExistingProduto_ReturnsNoContent()
        {
            var result = await _controller.DeleteProduto(1) as NoContentResult;

            var produtoDb = await _context.Produtos.FindAsync(1);

            Assert.That(result, Is.InstanceOf<NoContentResult>());
            Assert.That(produtoDb, Is.Null);
        }
    }
}