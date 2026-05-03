using FluentAssertions;
using petgo_api.DTOs.Usuario;
using petgo_api.Enums;
using petgo_api.Models;
using petgo_api.Services.Usuarios;
using petgo_test.Base;

namespace petgo_test.Services.Usuarios
{
    public class UsuarioServiceTests : TestBase
    {
        [Fact]
        public async Task CriarUsuario_DeveRetornarSucesso_QuandoDadosValidos()
        {
            var context = GetContext();
            var config = GetConfiguration();
            var service = new UsuarioService(context, config);

            var dto = new UsuarioCreateDto
            {
                Nome = "Marcello Teste",
                Email = "marcello@petgo.com",
                Senha = "SenhaForte123",
                Telefone = "31999999999",
                Tipo = TipoUsuario.Adotante
            };

            var resultado = await service.CriarUsuario(dto);

            resultado.Status.Should().BeTrue();

            resultado.Messagem.Should().Be("Usuário cadastrado com sucesso");

            resultado.Dados.Should().NotBeNull();

            resultado.Dados.Email.Should().Be(dto.Email);

            var usuarioNoBanco = context.Usuarios.Count();
            usuarioNoBanco.Should().Be(1);
        }

        [Fact]
        public async Task CriarUsuario_DeveRetornarErro_QuandoEmailJaExiste()
        {
            var context = GetContext();
            var config = GetConfiguration();
            var service = new UsuarioService(context, config);

            var emailRepetido = "marcello@teste.com";

            var usuarioJaNoBanco = new Usuario
            {
                Id = Guid.NewGuid(),
                Nome = "Usuario Original",
                Email = emailRepetido,
                SenhaHash = "hash_qualquer",
                Tipo = TipoUsuario.Adotante,
                Documento = "123.456.789-00",
                Telefone = "31988887777"
            };

            context.Usuarios.Add(usuarioJaNoBanco);
            await context.SaveChangesAsync();

            var dtoEmailDuplicado = new UsuarioCreateDto
            {
                Nome = "Marcello Novo",
                Email = emailRepetido,
                Senha = "123",
                Tipo = TipoUsuario.Passeador,
                Documento = "123.456.789-02",
                Telefone = "31988887744"
            };

            var resultado = await service.CriarUsuario(dtoEmailDuplicado);

            resultado.Status.Should().BeFalse();
            resultado.Messagem.Should().Be("E-mail já existe");
        }

        [Fact]
        public async Task Login_DeveRetornarToken_QuandoCredenciaisForemCorretas()
        {
            var context = GetContext();
            var config = GetConfiguration();
            var service = new UsuarioService(context, config);

            var email = "login@teste.com";
            var senhaLimpa = "SenhaSegura123";

            var usuario = new Usuario
            {
                Id = Guid.NewGuid(),
                Nome = "Usuario Teste",
                Email = email,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(senhaLimpa),
                Documento = "000.000.000-00",
                Telefone = "31999999999",
                Tipo = TipoUsuario.Adotante
            };

            context.Usuarios.Add(usuario);
            await context.SaveChangesAsync();

            var loginDto = new UsuarioLoginDto
            {
                Email = email,
                Senha = senhaLimpa
            };

            var resultado = await service.Login(loginDto);

            resultado.Status.Should().BeTrue();
            resultado.Messagem.Should().Be("Usuário logado com sucesso!");
            resultado.Dados.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async Task Login_DeveRetornarErro_QuandoCredenciaisForemErradas()
        {
            var context = GetContext();
            var config = GetConfiguration();
            var service = new UsuarioService(context, config);

            var email = "login@teste.com";
            var senhaLimpa = "SenhaSegura123";

            var usuario = new Usuario
            {
                Id = Guid.NewGuid(),
                Nome = "Usuario Teste",
                Email = email,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(senhaLimpa),
                Documento = "000.000.000-00",
                Telefone = "31999999999",
                Tipo = TipoUsuario.Adotante
            };

            context.Usuarios.Add(usuario);
            await context.SaveChangesAsync();

            var loginDto = new UsuarioLoginDto
            {
                Email = email,
                Senha = "senhaErrada"
            };

            var resultado = await service.Login(loginDto);

            resultado.Status.Should().BeFalse();
            resultado.Messagem.Should().Be("E-mail ou senha incorretos");
            resultado.Dados.Should().BeNull();
        }
    }
}