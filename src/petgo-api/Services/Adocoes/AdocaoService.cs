using Microsoft.EntityFrameworkCore;
using petgo_api.Data;
using petgo_api.DTOs.Adocao;
using petgo_api.Enums;
using petgo_api.Models;

namespace petgo_api.Services.Adocoes
{
    public class AdocaoService : IAdocaoInterface
    {
        private readonly AppDbContext _context;

        public AdocaoService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<ApiResponse<AdocaoResponseDto>> AlterarStatusAdocao(Guid adocaoId, AdocaoStatusUpdateDto adocaoStatusUpdate, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<AdocaoResponseDto>();

            try
            {
                var adocao = await _context.Adocoes
                                        .Include(a => a.Adotante)
                                        .Include(a => a.Pet)
                                            .ThenInclude(p => p.Usuario)
                                        .FirstOrDefaultAsync(a => a.Id == adocaoId);

                if (adocao == null)
                {
                    response.Status = false;
                    response.Messagem = "Solicitação de adoção não encontrada.";
                    return response;
                }

                bool isDono = adocao.Pet.UsuarioId == usuarioLogadoId;
                bool isAdotante = adocao.AdotanteId == usuarioLogadoId;

                if (!isDono && !isAdotante)
                {
                    response.Status = false;
                    response.Messagem = "Você não tem permissão para alterar esta adoção.";
                    return response;
                }

                // Adotante só pode confirmar a retirada (Adotado) e apenas quando já aprovada
                if (isAdotante && !isDono)
                {
                    if (adocaoStatusUpdate.NovoStatus != StatusAdocao.Adotado)
                    {
                        response.Status = false;
                        response.Messagem = "Você não tem permissão para esta operação.";
                        return response;
                    }
                    if (adocao.Status != StatusAdocao.Aprovado)
                    {
                        response.Status = false;
                        response.Messagem = "Só é possível confirmar a retirada após a adoção ser aprovada.";
                        return response;
                    }
                }

                var statusAnterior = adocao.Status;
                adocao.Status = adocaoStatusUpdate.NovoStatus;

                if (adocaoStatusUpdate.NovoStatus == StatusAdocao.Aprovado)
                {
                    if (adocao.Pet.Status == StatusPet.Adotado)
                    {
                        response.Status = false;
                        response.Messagem = "Este pet já está reservado ou foi adotado por outra pessoa.";
                        return response;
                    }

                    // Reservar o pet (some da lista de adoções) sem transferir a posse ainda
                    adocao.Pet.Status = StatusPet.Adotado;

                    // Recusar outras solicitações pendentes para este pet
                    var outrasSolicitacoes = await _context.Adocoes
                        .Where(a => a.PetId == adocao.PetId && a.Id != adocaoId && (a.Status == StatusAdocao.Pendente || a.Status == StatusAdocao.EmAnalise))
                        .ToListAsync();

                    foreach (var solicitacao in outrasSolicitacoes)
                    {
                        solicitacao.Status = StatusAdocao.Recusado;
                    }

                    _context.Pets.Update(adocao.Pet);
                }
                else if (adocaoStatusUpdate.NovoStatus == StatusAdocao.Adotado)
                {
                    // Pickup confirmado: transferir posse e resetar status para o novo dono gerenciar
                    adocao.Pet.UsuarioId = adocao.AdotanteId;
                    adocao.Pet.Status = StatusPet.DisponivelPasseio;
                    _context.Pets.Update(adocao.Pet);
                }
                else if (adocaoStatusUpdate.NovoStatus == StatusAdocao.Recusado && statusAnterior == StatusAdocao.Aprovado)
                {
                    // Adoção cancelada após aprovação: devolver pet à lista de adoções
                    adocao.Pet.Status = StatusPet.DisponivelAdocao;
                    _context.Pets.Update(adocao.Pet);
                }

                _context.Update(adocao);
                await _context.SaveChangesAsync();

                response.Dados = MapToDto(adocao);
                response.Status = true;
                response.Messagem = $"Solicitação de adoção {adocaoStatusUpdate.NovoStatus.ToString().ToLower()} com sucesso";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<AdocaoResponseDto>> GetAdocaoById(Guid adocaoId, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<AdocaoResponseDto>();

            try
            {
                var adocao = await _context.Adocoes
                                    .Include(a => a.Adotante)
                                    .Include(a => a.Pet)
                                        .ThenInclude(p => p.Usuario)
                                    .FirstOrDefaultAsync(a => a.Id == adocaoId);

                if (adocao == null)
                {
                    response.Status = false;
                    response.Messagem = "Solicitação não encontrada";
                    return response;
                }

                bool temAcesso = adocao.AdotanteId == usuarioLogadoId
                              || adocao.Pet.UsuarioId == usuarioLogadoId;

                if (!temAcesso)
                {
                    response.Status = false;
                    response.Messagem = "Sem permissão para acessar esta adoção.";
                    return response;
                }

                response.Dados = MapToDto(adocao);
                response.Messagem = "Adoção encontrada com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<List<AdocaoResponseDto>>> ListarMinhasSolicitacoes(Guid usuarioLogadoId)
        {
            var response = new ApiResponse<List<AdocaoResponseDto>>();

            try
            {
                var solicitacoes = await _context.Adocoes
                                            .Include(a => a.Adotante)
                                            .Include(a => a.Pet)
                                                .ThenInclude(p => p.Usuario)
                                            .Where(a => a.AdotanteId == usuarioLogadoId)
                                            .OrderByDescending(a => a.DataSolicitacao)
                                            .ToListAsync();

                if (solicitacoes.Count == 0)
                {
                    response.Status = true;
                    response.Messagem = "Você não possui solicitações";
                    response.Dados = new List<AdocaoResponseDto>();
                    return response;
                }

                response.Dados = solicitacoes.Select(a => MapToDto(a)).ToList();
                response.Messagem = "Solicitações carregadas com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<List<AdocaoResponseDto>>> ListarSolicitacoesRecebidas(Guid usuarioLogadoId)
        {
            var response = new ApiResponse<List<AdocaoResponseDto>>();

            try
            {
                var solicitacoes = await _context.Adocoes
                                            .Include(a => a.Adotante)
                                            .Include(a => a.Pet)
                                                .ThenInclude(p => p.Usuario)
                                            .Where(a => a.Pet.UsuarioId == usuarioLogadoId)
                                            .OrderByDescending(a => a.DataSolicitacao)
                                            .ToListAsync();

                if (solicitacoes.Count == 0)
                {
                    response.Status = true;
                    response.Messagem = "Você não possui solicitações.";
                    response.Dados = new List<AdocaoResponseDto>();
                    return response;
                }

                response.Dados = solicitacoes.Select(a => MapToDto(a)).ToList();
                response.Messagem = "Solicitações recebidas carregadas com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<AdocaoResponseDto>> SolicitarAdocao(AdocaoCreateDto adocaoCreate, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<AdocaoResponseDto>();

            try
            {
                var pet = await _context.Pets.FirstOrDefaultAsync(p => p.Id == adocaoCreate.PetId);

                if (pet == null)
                {
                    response.Status = false;
                    response.Messagem = "Pet não encontrado!";
                    return response;
                }

                if (pet.UsuarioId == usuarioLogadoId)
                {
                    response.Status = false;
                    response.Messagem = "Você já é o dono deste pet!";
                    return response;
                }

                if (pet.Status == StatusPet.Adotado)
                {
                    response.Status = false;
                    response.Messagem = "Este pet já está reservado ou foi adotado.";
                    return response;
                }

                var jaSolicitou = await _context.Adocoes
                                        .AnyAsync(a => a.PetId == adocaoCreate.PetId &&
                                        a.AdotanteId == usuarioLogadoId &&
                                        a.Status == StatusAdocao.Pendente);

                if (jaSolicitou)
                {
                    response.Status = false;
                    response.Messagem = "Você já tem uma solicitação pendente para este pet.";
                    return response;
                }

                var novaAdocao = new Adocao
                {
                    Id = Guid.NewGuid(),
                    PetId = adocaoCreate.PetId,
                    AdotanteId = usuarioLogadoId,
                    DataSolicitacao = DateTime.UtcNow,
                    Status = StatusAdocao.Pendente
                };

                _context.Adocoes.Add(novaAdocao);
                await _context.SaveChangesAsync();

                var adocaoCompleta = await _context.Adocoes
                                            .Include(a => a.Pet)
                                                .ThenInclude(p => p.Usuario)
                                            .Include(a => a.Adotante)
                                            .FirstOrDefaultAsync(a => a.Id == novaAdocao.Id);
                response.Dados = MapToDto(adocaoCompleta!);
                response.Messagem = "Solicitação de adoção enviada com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }


        private static AdocaoResponseDto MapToDto(Adocao adocao)
        {
            return new AdocaoResponseDto
            {
                Id = adocao.Id,
                PetId = adocao.PetId,
                FotoPetUrl = adocao.Pet?.FotoUrl,
                NomePet = adocao.Pet?.Nome,
                DataSolicitacao = adocao.DataSolicitacao,
                Status = adocao.Status.ToString(),
                // Adotante
                AdotanteId = adocao.AdotanteId,
                NomeAdotante = adocao.Adotante?.Nome,
                EmailAdotante = adocao.Adotante?.Email,
                TelefoneAdotante = adocao.Adotante?.Telefone,
                FotoAdotanteUrl = adocao.Adotante?.FotoUrl,
                // Doador (dono original do pet)
                NomeDoador = adocao.Pet?.Usuario?.Nome,
                EmailDoador = adocao.Pet?.Usuario?.Email,
                TelefoneDoador = adocao.Pet?.Usuario?.Telefone,
                FotoDoadorUrl = adocao.Pet?.Usuario?.FotoUrl,
            };
        }
    }
}