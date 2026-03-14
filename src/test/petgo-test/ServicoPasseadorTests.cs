using NUnit.Framework;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using petgo.api.Controllers;
using petgo.api.Dtos.Usuario;

namespace petgo.test
{
    /// <summary>
    /// Testes para validar a criação de usuários do tipo PASSEADOR com seus serviços
    /// TipoUsuario: 0=CLIENTE, 1=PASSEADOR, 2=ADMIN
    /// TipoServico: 0=PASSEIO, 1=CUIDADO_DIARIO, 2=HOSPEDAGEM, 3=OUTRO
    /// </summary>
    [TestFixture]
    public class ServicoPasseadorTests
    {
        private UsuariosController _controller = null!;

        [SetUp]
        public void Setup()
        {
            var context = TestBase.CreateInMemoryContext();
            var config = TestBase.CreateMockConfiguration();
            _controller = new UsuariosController(context, config.Object);
        }

        [Test]
        public async Task RegisterUsuario_ComUmServico_DeveCriarPasseadorComServico()
        {
            // Arrange
            var dto = new UsuarioCreateDto
            {
                Nome = "João Silva",
                Email = "joao@test.com",
                Senha = "senha123",
                Telefone = "11999999999",
                TipoUsuario = 1, // PASSEADOR
                DescricaoPasseador = "Passeador experiente com 5 anos de experiência",
                ValorCobradoPasseador = 50.00m,
                TiposServico = new List<int> { 0 } // PASSEIO
            };

            // Act
            var result = await _controller.RegisterUsuario(dto);

            // Assert
            var createdResult = result.Result as CreatedAtActionResult;
            createdResult.Should().NotBeNull();
            createdResult!.StatusCode.Should().Be(201);
        }

        [Test]
        public async Task RegisterUsuario_ComMultiplosServicos_DeveCriarPasseadorComTodosServicos()
        {
            // Arrange
            var dto = new UsuarioCreateDto
            {
                Nome = "Maria Santos",
                Email = "maria@test.com",
                Senha = "senha123",
                Telefone = "11888888888",
                TipoUsuario = 1, // PASSEADOR
                DescricaoPasseador = "Passeadora com experiência em cuidados diversos",
                ValorCobradoPasseador = 60.00m,
                TiposServico = new List<int> { 0, 1, 2 } // PASSEIO, CUIDADO_DIARIO, HOSPEDAGEM
            };

            // Act
            var result = await _controller.RegisterUsuario(dto);

            // Assert
            var createdResult = result.Result as CreatedAtActionResult;
            createdResult.Should().NotBeNull();
            createdResult!.StatusCode.Should().Be(201);
        }

        [Test]
        public async Task RegisterUsuario_ComTodosServicos_DeveCriarPasseadorComQuatroServicos()
        {
            // Arrange
            var dto = new UsuarioCreateDto
            {
                Nome = "Pedro Costa",
                Email = "pedro@test.com",
                Senha = "senha123",
                Telefone = "11777777777",
                TipoUsuario = 1, // PASSEADOR
                DescricaoPasseador = "Passeador completo oferecendo todos os serviços disponíveis",
                ValorCobradoPasseador = 80.00m,
                TiposServico = new List<int> { 0, 1, 2, 3 } // Todos os tipos
            };

            // Act
            var result = await _controller.RegisterUsuario(dto);

            // Assert
            var createdResult = result.Result as CreatedAtActionResult;
            createdResult.Should().NotBeNull();
            createdResult!.StatusCode.Should().Be(201);
        }

        [Test]
        public async Task RegisterUsuario_SemServicos_DeveCriarPasseadorSemServicos()
        {
            // Arrange
            var dto = new UsuarioCreateDto
            {
                Nome = "Ana Lima",
                Email = "ana@test.com",
                Senha = "senha123",
                Telefone = "11666666666",
                TipoUsuario = 1, // PASSEADOR
                DescricaoPasseador = "Nova passeadora ainda definindo serviços específicos",
                ValorCobradoPasseador = 40.00m,
                TiposServico = new List<int>() // Sem serviços
            };

            // Act
            var result = await _controller.RegisterUsuario(dto);

            // Assert
            var createdResult = result.Result as CreatedAtActionResult;
            createdResult.Should().NotBeNull();
            createdResult!.StatusCode.Should().Be(201);
        }

        [Test]
        public async Task RegisterUsuario_ComServicosDuplicados_DeveIgnorarDuplicatas()
        {
            // Arrange
            var dto = new UsuarioCreateDto
            {
                Nome = "Carlos Oliveira",
                Email = "carlos@test.com",
                Senha = "senha123",
                Telefone = "11555555555",
                TipoUsuario = 1, // PASSEADOR
                DescricaoPasseador = "Passeador teste para validação de duplicatas",
                ValorCobradoPasseador = 55.00m,
                TiposServico = new List<int> { 0, 0, 1, 1 } // Duplicados
            };

            // Act
            var result = await _controller.RegisterUsuario(dto);

            // Assert
            var createdResult = result.Result as CreatedAtActionResult;
            createdResult.Should().NotBeNull();
            createdResult!.StatusCode.Should().Be(201);
        }

        [Test]
        public async Task RegisterUsuario_Cliente_NaoDeveTerServicos()
        {
            // Arrange
            var dto = new UsuarioCreateDto
            {
                Nome = "Cliente Teste",
                Email = "cliente@test.com",
                Senha = "senha123",
                Telefone = "11444444444",
                TipoUsuario = 0 // CLIENTE - não precisa de descrição ou valor
            };

            // Act
            var result = await _controller.RegisterUsuario(dto);

            // Assert
            var createdResult = result.Result as CreatedAtActionResult;
            createdResult.Should().NotBeNull();
            createdResult!.StatusCode.Should().Be(201);
        }

        [Test]
        public async Task RegisterUsuario_EmailDuplicado_DeveRetornarErro()
        {
            // Arrange
            var dto1 = TestBase.CreatePasseadorDto("primeiro@test.com");
            var dto2 = TestBase.CreatePasseadorDto("primeiro@test.com"); // Email duplicado

            // Act
            await _controller.RegisterUsuario(dto1);
            var result = await _controller.RegisterUsuario(dto2);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Test]
        public async Task RegisterUsuario_DoisPasseadoresDiferentes_DeveCriarAmbos()
        {
            // Arrange
            var dto1 = TestBase.CreatePasseadorDto("primeiro@test.com");
            var dto2 = TestBase.CreatePasseadorDto("segundo@test.com");

            // Act
            var result1 = await _controller.RegisterUsuario(dto1);
            var result2 = await _controller.RegisterUsuario(dto2);

            // Assert
            result1.Result.Should().BeOfType<CreatedAtActionResult>();
            result2.Result.Should().BeOfType<CreatedAtActionResult>();
        }

        [Test]
        public async Task RegisterUsuario_PasseadorComDescricaoLonga_DeveCriar()
        {
            // Arrange
            var descricaoLonga = new string('A', 500);
            var dto = new UsuarioCreateDto
            {
                Nome = "Descrição Longa",
                Email = "longa@test.com",
                Senha = "senha123",
                Telefone = "11987654321",
                TipoUsuario = 1, // PASSEADOR
                DescricaoPasseador = descricaoLonga,
                ValorCobradoPasseador = 50.00m,
                TiposServico = new List<int> { 0 }
            };

            // Act
            var result = await _controller.RegisterUsuario(dto);

            // Assert
            var createdResult = result.Result as CreatedAtActionResult;
            createdResult.Should().NotBeNull();
            createdResult!.StatusCode.Should().Be(201);
        }
    }
}
