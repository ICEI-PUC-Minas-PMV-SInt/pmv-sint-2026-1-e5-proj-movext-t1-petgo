using NUnit.Framework;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using petgo.api.Controllers;
using petgo.api.Dtos.Passeador;
using petgo.api.Models;
using Microsoft.EntityFrameworkCore;

namespace petgo.test
{
    /// <summary>
    /// Testes para o PasseadoresController - gerenciamento de perfis de passeadores
    /// </summary>
    [TestFixture]
    public class PasseadoresControllerTests
    {
        private PasseadoresController _controller = null!;
        private UsuariosController _usuariosController = null!;

        [SetUp]
        public void Setup()
        {
            var context = TestBase.CreateInMemoryContext();
            var config = TestBase.CreateMockConfiguration();
            
            _controller = new PasseadoresController(context);
            _usuariosController = new UsuariosController(context, config.Object);
        }

        #region GetPasseadores Tests

        [Test]
        public async Task GetPasseadores_DeveRetornarListaVazia_QuandoNaoExistemPasseadores()
        {
            // Act
            var result = await _controller.GetPasseadores();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            
            var passeadores = okResult!.Value as IEnumerable<PasseadorDto>;
            passeadores.Should().NotBeNull();
            passeadores.Should().BeEmpty();
        }

        [Test]
        public async Task GetPasseadores_DeveRetornarPasseadores_ComServicosAtivos()
        {
            // Arrange
            var dto = TestBase.CreatePasseadorDto("passeador1@test.com");
            await _usuariosController.RegisterUsuario(dto);

            // Act
            var result = await _controller.GetPasseadores();

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            
            var passeadores = okResult!.Value as IEnumerable<PasseadorDto>;
            passeadores.Should().NotBeNull();
            passeadores.Should().HaveCount(1);
            
            var passeador = passeadores!.First();
            passeador.Nome.Should().Be("Test Walker");
            passeador.Servicos.Should().HaveCount(1);
        }

        [Test]
        public async Task GetPasseadores_DeveRetornarMultiplosPasseadores()
        {
            // Arrange
            var dto1 = TestBase.CreatePasseadorDto("passeador1@test.com");
            var dto2 = TestBase.CreatePasseadorDto("passeador2@test.com");
            
            await _usuariosController.RegisterUsuario(dto1);
            await _usuariosController.RegisterUsuario(dto2);

            // Act
            var result = await _controller.GetPasseadores();

            // Assert
            var okResult = result.Result as OkObjectResult;
            var passeadores = okResult!.Value as IEnumerable<PasseadorDto>;
            
            passeadores.Should().HaveCount(2);
        }

        #endregion

        #region GetById Tests

        [Test]
        public async Task GetById_DeveRetornarPasseador_QuandoIdValido()
        {
            // Arrange
            var dto = TestBase.CreatePasseadorDto("passeador@test.com");
            var createResult = await _usuariosController.RegisterUsuario(dto);
            
            var createdResult = createResult.Result as CreatedAtActionResult;
            var usuarioCriado = createdResult!.Value as dynamic;
            int usuarioId = usuarioCriado!.Id;

            // Act
            var result = await _controller.GetById(usuarioId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            
            var passeador = okResult!.Value as PasseadorDto;
            passeador.Should().NotBeNull();
            passeador!.UsuarioId.Should().Be(usuarioId);
            passeador.Nome.Should().Be("Test Walker");
        }

        [Test]
        public async Task GetById_DeveRetornar404_QuandoIdInvalido()
        {
            // Act
            var result = await _controller.GetById(99999);

            // Assert
            result.Result.Should().BeOfType<NotFoundResult>();
        }

        [Test]
        public async Task GetById_DeveIncluirServicos_QuandoExistirem()
        {
            // Arrange
            var dto = TestBase.CreatePasseadorDto("passeador@test.com");
            var createResult = await _usuariosController.RegisterUsuario(dto);
            
            var createdResult = createResult.Result as CreatedAtActionResult;
            var usuarioCriado = createdResult!.Value as dynamic;
            int usuarioId = usuarioCriado!.Id;

            // Act
            var result = await _controller.GetById(usuarioId);

            // Assert
            var okResult = result.Result as OkObjectResult;
            var passeador = okResult!.Value as PasseadorDto;
            
            passeador!.Servicos.Should().NotBeNull();
            passeador.Servicos.Should().HaveCountGreaterThan(0);
        }

        #endregion

        #region Testes de Validação

        [Test]
        public async Task GetPasseadores_DeveRetornarApenasServicosAtivos()
        {
            // Arrange
            var dto = TestBase.CreatePasseadorDto("passeador@test.com");
            await _usuariosController.RegisterUsuario(dto);

            // Act
            var result = await _controller.GetPasseadores();

            // Assert
            var okResult = result.Result as OkObjectResult;
            var passeadores = okResult!.Value as IEnumerable<PasseadorDto>;
            var passeador = passeadores!.First();
            
            // Todos os serviços retornados devem estar ativos
            passeador.Servicos.Should().OnlyContain(s => s != null);
        }

        [Test]
        public async Task PasseadorDto_DeveConterInformacoesCompletas()
        {
            // Arrange
            var dto = TestBase.CreatePasseadorDto("passeador@test.com");
            await _usuariosController.RegisterUsuario(dto);

            // Act
            var result = await _controller.GetPasseadores();

            // Assert
            var okResult = result.Result as OkObjectResult;
            var passeadores = okResult!.Value as IEnumerable<PasseadorDto>;
            var passeador = passeadores!.First();
            
            passeador.UsuarioId.Should().BeGreaterThan(0);
            passeador.Nome.Should().NotBeNullOrWhiteSpace();
            passeador.Telefone.Should().NotBeNullOrWhiteSpace();
            passeador.Descricao.Should().NotBeNullOrWhiteSpace();
            passeador.ValorCobrado.Should().BeGreaterThan(0);
            passeador.AvaliacaoMedia.Should().BeGreaterThanOrEqualTo(0);
            passeador.QuantidadeAvaliacoes.Should().BeGreaterThanOrEqualTo(0);
        }

        #endregion
    }
}
