using FluentAssertions;
using petgo_api.DTOs.Adocao;
using petgo_api.Enums;
using petgo_api.Models;
using petgo_api.Services.Adocoes;
using petgo_test.Base;

namespace petgo_test.Services.Adocoes
{
    public class AdocaoServiceTests : TestBase
    {
        [Fact]
        public async Task SolicitarAdocao_DeveRetornarSucesso_QuandoDadosForemValidados()
        {
            var context = GetContext();
            var service = new AdocaoService(context);

            var donoOriginalId = Guid.NewGuid();
            var adotanteId = Guid.NewGuid();

            var pet = new Pet
            {
                Id = Guid.NewGuid(),
                Nome = "Bolinha",
                Especie = Especie.Cachorro,
                Status = StatusPet.DisponivelAdocao,
                UsuarioId = donoOriginalId
            };

            var donoOriginal = new Usuario
            {
                Id = donoOriginalId,
                Nome = "Dono Antigo",
                Email = "antigo@teste.com",
                SenhaHash = "SenhaHash",
                Documento = "000.000.000-00",
                Telefone = "31999999999",
                Tipo = TipoUsuario.Ong
            };

            var adotante = new Usuario
            {
                Id = adotanteId,
                Nome = "Marcello Adotante",
                Email = "adotante@teste.com",
                SenhaHash = "SenhaHash",
                Documento = "111",
                Telefone = "111",
                Tipo = TipoUsuario.Adotante
            };

            context.Usuarios.AddRange(donoOriginal, adotante);
            context.Pets.Add(pet);
            await context.SaveChangesAsync();

            var dto = new AdocaoCreateDto { PetId = pet.Id, };
            var resultado = await service.SolicitarAdocao(dto, adotanteId);

            resultado.Status.Should().BeTrue();
            resultado.Messagem.Should().Be("Solicitação de adoção enviada com sucesso!");
        }

        [Fact]
        public async Task AlterarStatusAdocao_DeveRetornarErro_QuandoUsuarioNaoForODono()
        {
            var context = GetContext();
            var service = new AdocaoService(context);

            var donoRealId = Guid.NewGuid();
            var usuarioInvasorId = Guid.NewGuid();
            var adocaoId = Guid.NewGuid();

            var pet = new Pet { Id = Guid.NewGuid(), Nome = "Rex", UsuarioId = donoRealId, Status = StatusPet.DisponivelAdocao, Especie = Especie.Cachorro };
            var adotante = new Usuario { Id = Guid.NewGuid(), Nome = "Adotante", SenhaHash = "SenhaHash", Email = "a@a.com", Documento = "1", Telefone = "1", Tipo = TipoUsuario.Adotante };

            var adocao = new Adocao
            {
                Id = adocaoId,
                Pet = pet,
                Adotante = adotante,
                Status = StatusAdocao.Pendente
            };

            context.Adocoes.Add(adocao);
            await context.SaveChangesAsync();

            var dto = new AdocaoStatusUpdateDto { NovoStatus = StatusAdocao.Aprovado };
            var resultado = await service.AlterarStatusAdocao(adocaoId, dto, usuarioInvasorId);

            resultado.Status.Should().BeFalse();
            resultado.Messagem.Should().Be("Você não tem permissão de aprovar ou recusar esta adoção");
        }

        [Fact]
        public async Task AlterarStatusAdocao_DeveAtualizarPetParaAdotado_QuandoAprovado()
        {
            var context = GetContext();
            var service = new AdocaoService(context);

            var donoId = Guid.NewGuid();
            var adotanteId = Guid.NewGuid();
            var petId = Guid.NewGuid();
            var adocaoId = Guid.NewGuid();

            var dono = new Usuario { Id = donoId, Nome = "Dono Original", Email = "dono@teste.com", SenhaHash = "SenhaHash", Documento = "1", Telefone = "1", Tipo = TipoUsuario.Ong };
            var adotante = new Usuario { Id = adotanteId, Nome = "Candidato Adotante", Email = "adot@teste.com", SenhaHash = "SenhaHash", Documento = "2", Telefone = "2", Tipo = TipoUsuario.Adotante };
            context.Usuarios.AddRange(dono, adotante);

            var pet = new Pet
            {
                Id = petId,
                Nome = "Fred",
                UsuarioId = donoId,
                Especie = Especie.Cachorro,
                Status = StatusPet.DisponivelAdocao
            };
            context.Pets.Add(pet);

            var adocao = new Adocao
            {
                Id = adocaoId,
                PetId = petId,
                AdotanteId = adotanteId,
                Status = StatusAdocao.Pendente,
                DataSolicitacao = DateTime.Now
            };
            context.Adocoes.Add(adocao);

            await context.SaveChangesAsync();

            var updateDto = new AdocaoStatusUpdateDto { NovoStatus = StatusAdocao.Aprovado };
            var resultado = await service.AlterarStatusAdocao(adocaoId, updateDto, donoId);

            resultado.Status.Should().BeTrue();
            resultado.Messagem.Should().Contain("aprovado com sucesso");

            var petNoBanco = await context.Pets.FindAsync(petId);

            petNoBanco.Should().NotBeNull();
            petNoBanco.Status.Should().Be(StatusPet.Adotado);
        }

        [Fact]
        public async Task AlterarStatusAdocao_DeveManterPetDisponivel_QuandoRecusado()
        {
            var context = GetContext();
            var service = new AdocaoService(context);

            var donoId = Guid.NewGuid();
            var adocaoId = Guid.NewGuid();
            var petId = Guid.NewGuid();
            var adotanteId = Guid.NewGuid();

            var dono = new Usuario { Id = donoId, Nome = "Dono", Email = "d@d.com", SenhaHash = "SenhaHash", Documento = "1", Telefone = "1", Tipo = TipoUsuario.Passeador };
            var adotante = new Usuario { Id = adotanteId, Nome = "Adotante", Email = "a@a.com", SenhaHash = "SenhaHash", Documento = "2", Telefone = "2", Tipo = TipoUsuario.Adotante };
            context.Usuarios.AddRange(dono, adotante);

            var pet = new Pet { Id = petId, Nome = "Pipoca", Status = StatusPet.DisponivelAdocao, UsuarioId = donoId, Especie = Especie.Gato };

            var adocao = new Adocao
            {
                Id = adocaoId,
                PetId = petId,
                Status = StatusAdocao.Pendente,
                AdotanteId = adotanteId
            };

            context.Pets.Add(pet);
            context.Adocoes.Add(adocao);
            await context.SaveChangesAsync();

            var updateDto = new AdocaoStatusUpdateDto { NovoStatus = StatusAdocao.Recusado };
            var resultado = await service.AlterarStatusAdocao(adocaoId, updateDto, donoId);

            resultado.Status.Should().BeTrue();

            var petNoBanco = await context.Pets.FindAsync(petId);

            petNoBanco.Should().NotBeNull();
            petNoBanco.Status.Should().Be(StatusPet.DisponivelAdocao);
        }
    }
}