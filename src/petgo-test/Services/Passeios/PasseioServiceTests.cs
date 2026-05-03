using FluentAssertions;
using petgo_api.DTOs.Passeio;
using petgo_api.Enums;
using petgo_api.Models;
using petgo_api.Services.Passeios;
using petgo_test.Base;


namespace petgo_test.Services.Passeios
{
    public class PasseioServiceTests : TestBase
    {
        [Fact]
        public async Task CriarPasseio_DeveRetornarSucesso_QuandoDadosForemValidados()
        {
            var context = GetContext();
            var service = new PasseioService(context);

            var tutorId = Guid.NewGuid();
            var passeadorId = Guid.NewGuid();

            var passeador = new Usuario
            {
                Id = passeadorId,
                Nome = "Passeador de Teste",
                Email = "passeador@teste.com",
                SenhaHash = "senhaQualquer",
                Documento = "111.111.111-11",
                Telefone = "31999998888",
                Tipo = TipoUsuario.Passeador
            };
            context.Usuarios.Add(passeador);

            var tipoPasseio = new TipoPasseio
            {
                Id = Guid.NewGuid(),
                Nome = "Passeio Curto",
                PrecoBase = 50
            };

            var pet = new Pet
            {
                Id = Guid.NewGuid(),
                Nome = "Rex",
                UsuarioId = tutorId,
                Especie = Especie.Cachorro,
                Status = StatusPet.DisponivelPasseio,
                DataCadastro = DateTime.Now
            };

            context.TiposPasseios.Add(tipoPasseio);
            context.Pets.Add(pet);
            await context.SaveChangesAsync();

            var dto = new PasseioCreateDto
            {
                PasseadorId = passeadorId,
                PetId = pet.Id,
                TipoPasseioId = tipoPasseio.Id,
                DataHoraPasseio = DateTime.Now.AddDays(1),
                DescricaoPasseio = "Passeio de tarde no parque"
            };

            var resultado = await service.CriarPasseio(dto, tutorId);

            resultado.Status.Should().BeTrue();
            resultado.Messagem.Should().Be("Passeio agendado com sucesso!");
            resultado.Dados.ValorTotal.Should().Be(50);
            resultado.Dados.NomePet.Should().Be("Rex");
        }

        [Fact]
        public async Task AlterarStatusPassio_DeveRetornarErro_QuandoUsuarioNaoTemPermissao()
        {
            var context = GetContext();
            var service = new PasseioService(context);

            var tutorDonoId = Guid.NewGuid();
            var tutorDonoDoPasseioId = Guid.NewGuid();
            var usuarioInvasorId = Guid.NewGuid();
            var passeioId = Guid.NewGuid();

            var tipo = new TipoPasseio { Id = Guid.NewGuid(), Nome = "Teste", PrecoBase = 10 };
            var passeador = new Usuario { Id = Guid.NewGuid(), Nome = "P", Email = "a@a.com", SenhaHash = "SenhaSegurs", Documento = "1", Telefone = "1", Tipo = TipoUsuario.Passeador };
            var pet = new Pet { Id = Guid.NewGuid(), Nome = "Rex", UsuarioId = tutorDonoId, Especie = Especie.Cachorro, Status = StatusPet.DisponivelPasseio };

            context.TiposPasseios.Add(tipo);
            context.Usuarios.Add(passeador);
            context.Pets.Add(pet);

            var passeio = new Passeio
            {
                Id = passeioId,
                TutorId = tutorDonoDoPasseioId,
                Status = StatusPasseio.Pendente,
                PetId = pet.Id,
                PasseadorId = passeador.Id,
                TipoPasseioId = tipo.Id
            };
            context.Passeios.Add(passeio);
            await context.SaveChangesAsync();

            var resultado = await service.AlterarStatusPasseio(
                passeioId,
                StatusPasseio.Cancelado,
                usuarioInvasorId,
                TipoUsuario.Adotante
            );

            resultado.Status.Should().BeFalse();
            resultado.Messagem.Should().Be("Você não tem permissão para alterar este passeio.");
        }

        [Fact]
        public async Task AlterarStatusPasseio_DeveRetornarErro_QuandoTutorCancelaPasseioEmAndamento()
        {
            var context = GetContext();
            var service = new PasseioService(context);

            var tutorId = Guid.NewGuid();
            var passeioId = Guid.NewGuid();

            var tipo = new TipoPasseio { Id = Guid.NewGuid(), Nome = "Passeio Longo", PrecoBase = 80 };
            var passeador = new Usuario { Id = Guid.NewGuid(), Nome = "Passeador", Email = "p@p.com", SenhaHash = "123", Documento = "2", Telefone = "2", Tipo = TipoUsuario.Passeador };
            var pet = new Pet { Id = Guid.NewGuid(), Nome = "Thor", UsuarioId = tutorId, Especie = Especie.Cachorro, Status = StatusPet.DisponivelPasseio };

            context.TiposPasseios.Add(tipo);
            context.Usuarios.Add(passeador);
            context.Pets.Add(pet);

            var passeio = new Passeio
            {
                Id = passeioId,
                TutorId = tutorId,
                Status = StatusPasseio.EmAndamento,
                PetId = pet.Id,
                PasseadorId = passeador.Id,
                TipoPasseioId = tipo.Id,
                DataHoraPasseio = DateTime.Now
            };

            context.Passeios.Add(passeio);
            await context.SaveChangesAsync();

            var resultado = await service.AlterarStatusPasseio(
                passeioId,
                StatusPasseio.Cancelado,
                tutorId,
                TipoUsuario.Adotante
            );

            resultado.Status.Should().BeFalse();
            resultado.Messagem.Should().Be("Não é possível cancelar um passeio em andamento ou concluído.");
        }
    }
}