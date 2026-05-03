
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using petgo_api.Data;

namespace petgo_test.Base
{
    public class TestBase
    {
        protected AppDbContext GetContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            return new AppDbContext(options);
        }

        protected IConfiguration GetConfiguration()
        {
            var inMemorySettings = new Dictionary<string, string> {
                {"AppSettings:Token", "chave-secreta-de-teste-com-pelo-menos-32-caracteres"}
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();
        }
    }
}