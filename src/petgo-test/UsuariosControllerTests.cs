using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using petgo.api.Controllers;
using petgo.api.Data;
using petgo.api.Dtos.Usuario;
using petgo.api.Models;

namespace petgo.test
{
    [TestFixture]
    public class UsuariosControllerTests
    {
        private AppDbContext _context = null!;
        private IConfiguration _config = null!;
        private UsuariosController _controller = null!;

        [SetUp]
        public async Task Setup()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);

            var myConfiguration = new Dictionary<string, string?>
            {
                {"Jwt:Key", "UMA_CHAVE_FALSA_PARA_TESTES_BEM_LONGA_E_SEGURA_123456789"},
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"}
            };
            _config = new ConfigurationBuilder()
                .AddInMemoryCollection(myConfiguration)
                .Build();

            var hashCliente = BCrypt.Net.BCrypt.HashPassword("senha_cliente_123");
            var hashPasseador = BCrypt.Net.BCrypt.HashPassword("senha_passeador_123");

            _context.Usuarios.AddRange(
                new Usuario { Id = 1, Nome = "Cliente Teste", Email = "cliente@teste.com", Tipo = TipoUsuario.CLIENTE, Telefone = "11999992222", Senha = hashCliente },
                new Usuario { Id = 2, Nome = "Passeador Teste", Email = "passeador@teste.com", Tipo = TipoUsuario.PASSEADOR, Telefone = "11999991111", Senha = hashPasseador }
            );
            _context.Passeadores.Add(
                new Passeador { UsuarioId = 2, Descricao = "Descricao Antiga", ValorCobrado = 25.0m }
            );
            await _context.SaveChangesAsync();

            _controller = new UsuariosController(_context, _config);
        }
        [TearDown]
        public void TearDown()
        {
            _context.Dispose();
        }

        private void MockUser(int id, string tipoUsuario)
        {
            var claims = new List<Claim>
            {
                new Claim(System.Security.Claims.ClaimTypes.NameIdentifier, id.ToString()), 
                new Claim(System.Security.Claims.ClaimTypes.Role, tipoUsuario)
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }

        [Test]
        public async Task RegisterUsuario_WhenValidData_ReturnsCreatedUsuario()
        {
            var novoUsuarioDto = new UsuarioCreateDto
            {
                Nome = "Novo Usuário",
                Email = "novo@email.com",
                Senha = "senhaForte123",
                Telefone = "123456789",
                TipoUsuario = (int)TipoUsuario.CLIENTE
            };

            var result = await _controller.RegisterUsuario(novoUsuarioDto);

            var createdResult = result.Result as CreatedAtActionResult;
            Assert.That(createdResult, Is.Not.Null);

            var usuarioRetornado = createdResult.Value as UsuarioDto;
            Assert.That(usuarioRetornado, Is.Not.Null);
            Assert.That(usuarioRetornado.Email, Is.EqualTo("novo@email.com"));

            // Verifique se o usuário foi salvo no banco de dados falso
            var usuarioDb = await _context.Usuarios
                                            .FirstOrDefaultAsync(u => u.Email == "novo@email.com");
            Assert.That(usuarioDb, Is.Not.Null);
            Assert.That(usuarioDb.Nome, Is.EqualTo("Novo Usuário"));

            // Verifica se a senha foi hasheada e não texto puro
            Assert.That(usuarioDb.Senha, Is.Not.EqualTo("senhaForte123"));
        }

        [Test]
        public async Task RegisterUsuario_WhenEmailAlreadyExists_ReturnsBadRequest()
        {
            var usuarioDtoDuplicado = new UsuarioCreateDto
            {
                Nome = "Usuario Fantasma",
                Email = "cliente@teste.com",
                Senha = "senhaQualquer123",
                Telefone = "000000000",
                TipoUsuario = (int)TipoUsuario.CLIENTE
            };

            var result = await _controller.RegisterUsuario(usuarioDtoDuplicado);

            var badRequestResult = result.Result as BadRequestObjectResult;
            Assert.That(badRequestResult, Is.Not.Null, "O resultado não foi um BadRequestObjectResult");

            var responseValue = badRequestResult.Value;
            Assert.That(responseValue, Is.Not.Null, "O valor do BadRequest estava nulo");

            Assert.That(responseValue, Has.Property("message").EqualTo("Este email já está cadastrado."));

            var count = await _context.Usuarios.CountAsync();
            Assert.That(count, Is.EqualTo(2));
        }

        [Test]
        public async Task Login_WhenCredentialsAreValid_ReturnsTokenAndUsuario()
        {
            var loginDto = new LoginDto
            {
                Email = "cliente@teste.com",
                Senha = "senha_cliente_123"
            };

            var result = await _controller.Login(loginDto);

            var okResult = result.Result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null, "O resultado não foi um OkObjectresult");

            var loginResponse = okResult.Value as LoginResponseDto;
            Assert.That(loginResponse, Is.Not.Null, "A resposta do login (LoginResponseDto) estava nula");

            Assert.Multiple(() =>
            {
                Assert.That(loginResponse.Token, Is.Not.Empty, "O Token JWT estava vazio");

                Assert.That(loginResponse.Usuario.Email, Is.EqualTo("cliente@teste.com"));
            });
        }

        [Test]
        public async Task Login_WhenPasswordIsInvalid_ReturnsUnauthorized()
        {
            var loginDto = new LoginDto
            {
                Email = "cliente@teste.com",
                Senha = "senha-errada-123"
            };

            var result = await _controller.Login(loginDto);

            var okResult = result.Result as UnauthorizedObjectResult;
            Assert.That(okResult, Is.Not.Null, "O resultado não foi Unauthorized");
        }

        [Test]
        public async Task GetById_WhenIdExists_ReturnsUsuario()
        {
            var result = await _controller.GetById(1);

            var okResult = result.Result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null, "Não foi um OkObjectresult");

            var usuarioDto = okResult.Value as UsuarioDto;
            Assert.That(usuarioDto, Is.Not.Null, "O UsuarioDto estava nulo");
            Assert.That(usuarioDto.Id, Is.EqualTo(1));
            Assert.That(usuarioDto.Email, Is.EqualTo("cliente@teste.com"));
        }

        [Test]
        public async Task GetById_WhenIdDoesNotExist_ReturnsNotFound()
        {
            int idQueNaoExiste = 999;

            var result = await _controller.GetById(idQueNaoExiste);

            Assert.That(result.Result, Is.InstanceOf<NotFoundObjectResult>(), "Não foi um NotFound");
        }

        [Test]
        public async Task GetUsuarios_ReturnsAllUsuarios()
        {
            var result = await _controller.GetUsuarios();

            var okResult = result.Result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null, "Não foi um OkObjectresult");

            var usuariosList = okResult.Value as IEnumerable<UsuarioDto>;
            Assert.That(usuariosList, Is.Not.Null, "A lista de UsuarioDto estava nula");

            Assert.That(usuariosList.Count(), Is.EqualTo(2));

            var primeiroUsuario = usuariosList.First(u => u.Id == 1);
            Assert.That(primeiroUsuario.Email, Is.EqualTo("cliente@teste.com"));
        }

        [Test]
        public async Task UpdateUsuario_WhenDataIsValid_ReturnsOkWithDto()
        {
            MockUser(1, "CLIENTE");

            var updateDto = new UsuarioUpdateDto
            {
                Nome = "Nome Atualizado",
                Telefone = "111111111",
                FotoPerfil = "http://nova.foto/url"
            };

            var result = await _controller.UpdateUsuario(1, updateDto);
            Assert.That(result.Result, Is.InstanceOf<OkObjectResult>(), "A resposta não foi NoContent");

            _context.ChangeTracker.Clear();

            var usuarioAtualizadoDb = await _context.Usuarios.FindAsync(1);
            Assert.That(usuarioAtualizadoDb, Is.Not.Null, "Usuário não encontrado no banco pós update");
            Assert.Multiple(() =>
            {
                Assert.That(usuarioAtualizadoDb.Nome, Is.EqualTo("Nome Atualizado"));
                Assert.That(usuarioAtualizadoDb.Telefone, Is.EqualTo("111111111"));
            });
        }

        [Test]
        public async Task UpdateUsuario_WhenIdDoesNotExist_ReturnsNotFound()
        {
            int idQueNaoExiste = 999;

            var updateDto = new UsuarioUpdateDto
            {
                Nome = "Usuário Fantasma",
                Telefone = "000000000",
                FotoPerfil = "http://foto.fantasma/url"
            };

            MockUser(idQueNaoExiste, "CLIENTE");

            var result = await _controller.UpdateUsuario(idQueNaoExiste, updateDto);
            Assert.That(result.Result, Is.InstanceOf<NotFoundObjectResult>(), "A resposta não foi NotFoundObjectResult");
        }

        [Test]
        public async Task UpdateUsuario_WhenUserIsPasseador_UpdatesPasseadorFields()
        {
            MockUser(2, "PASSEADOR");

            var dto = new UsuarioUpdateDto
            {
                Nome = "Passeador Nome Novo",
                Telefone = "987",
                Descricao = "Nova Descrição",
                ValorCobrado = 50.0m
            };

            // Act
            var result = await _controller.UpdateUsuario(2, dto);

            Assert.That(result.Result, Is.TypeOf<OkObjectResult>());

            var passeadorDoDb = await _context.Passeadores.FindAsync(2);
            Assert.That(passeadorDoDb, Is.Not.Null);
            Assert.Multiple(() =>
            {
                Assert.That(passeadorDoDb.Descricao, Is.EqualTo("Nova Descrição"));
                Assert.That(passeadorDoDb.ValorCobrado, Is.EqualTo(50.0m));
            });
        }

        [Test]
        public async Task DeleteUsuario_WhenIdExists_ReturnsNoContent()
        {
            var result = await _controller.DeleteUsuario(1);

            Assert.That(result, Is.InstanceOf<NoContentResult>(), "A resposta não foi NoContent");

            var usuarioDeletado = await _context.Usuarios.FindAsync(1);
            Assert.That(usuarioDeletado, Is.Null, "O usuário não foi deletado do banco");
        }

        [Test]
        public async Task DeleteUsuario_WhenIdDoesNotExist_ReturnsNotFound()
        {
            var idQueNaoExiste = 999;

            var result = await _controller.DeleteUsuario(idQueNaoExiste);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>(), "A resposta não foi NotFoundObjectResult");
        }
    }
}