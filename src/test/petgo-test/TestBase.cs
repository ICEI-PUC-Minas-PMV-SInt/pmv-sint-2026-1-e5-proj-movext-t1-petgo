using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using petgo.api.Data;
using petgo.api.Dtos.Usuario;

namespace petgo.test;

public static class TestBase
{
    public static AppDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new AppDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    public static Mock<IConfiguration> CreateMockConfiguration()
    {
        var mockConfig = new Mock<IConfiguration>();
        mockConfig.Setup(c => c["JWT:Secret"])
            .Returns("test_secret_key_minimum_32_characters_for_testing_purposes_only");
        return mockConfig;
    }

    public static UsuarioCreateDto CreatePasseadorDto(string email)
    {
        return new UsuarioCreateDto
        {
            Nome = "Test Walker",
            Email = email,
            Senha = "senha123",
            Telefone = "11999999999",
            TipoUsuario = 1, // PASSEADOR (enum: 0=CLIENTE, 1=PASSEADOR, 2=ADMIN)
            DescricaoPasseador = "Experienced professional walker with over 5 years",
            ValorCobradoPasseador = 50.00m,
            TiposServico = new List<int> { 0 } // PASSEIO
        };
    }
}
