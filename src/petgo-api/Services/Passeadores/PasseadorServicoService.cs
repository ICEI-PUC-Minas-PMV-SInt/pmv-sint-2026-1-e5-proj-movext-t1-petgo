using Microsoft.EntityFrameworkCore;
using petgo_api.Data;
using petgo_api.DTOs.Passeio;
using petgo_api.Models;

namespace petgo_api.Services.PasseadorServicos
{
    public class PasseadorServicoService : IPasseadorServicoInterface
    {
        private readonly AppDbContext _context;

        public PasseadorServicoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<List<PasseadorServicoResponseDto>>> ListarServicosPorPasseador(Guid passeadorId)
        {
            var response = new ApiResponse<List<PasseadorServicoResponseDto>>();

            try
            {
                var servicos = await _context.PasseadorServicos
                    .Include(x => x.TipoPasseio)
                    .Where(x => x.PasseadorId == passeadorId)
                    .ToListAsync();

                response.Dados = servicos.Select(s => new PasseadorServicoResponseDto
                {
                    Id = s.Id,
                    PasseadorId = s.PasseadorId,
                    TipoPasseioId = s.TipoPasseioId,
                    NomeTipoPasseio = s.TipoPasseio.Nome,
                    DuracaoMinutos = s.TipoPasseio.DuracaoMinutos,
                    PrecoCustomizado = s.PrecoCustomizado
                }).ToList();

                response.Messagem = "Serviços do passeador carregados com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<PasseadorServicoResponseDto>> SalvarServicoPasseador(Guid passeadorId, PasseadorServicoCreateDto dto)
        {
            var response = new ApiResponse<PasseadorServicoResponseDto>();

            try
            {
                // Verifica se já existe um preço para este tipo de passeio para este passeador
                var servicoExistente = await _context.PasseadorServicos
                    .FirstOrDefaultAsync(x => x.PasseadorId == passeadorId && x.TipoPasseioId == dto.TipoPasseioId);

                if (servicoExistente != null)
                {
                    servicoExistente.PrecoCustomizado = dto.PrecoCustomizado;
                    _context.PasseadorServicos.Update(servicoExistente);
                }
                else
                {
                    var novoServico = new PasseadorServico
                    {
                        Id = Guid.NewGuid(),
                        PasseadorId = passeadorId,
                        TipoPasseioId = dto.TipoPasseioId,
                        PrecoCustomizado = dto.PrecoCustomizado
                    };
                    _context.PasseadorServicos.Add(novoServico);
                    servicoExistente = novoServico;
                }

                await _context.SaveChangesAsync();

                // Recarrega para trazer o nome do tipo de passeio
                var result = await _context.PasseadorServicos
                    .Include(x => x.TipoPasseio)
                    .FirstAsync(x => x.Id == servicoExistente.Id);

                response.Dados = new PasseadorServicoResponseDto
                {
                    Id = result.Id,
                    PasseadorId = result.PasseadorId,
                    TipoPasseioId = result.TipoPasseioId,
                    NomeTipoPasseio = result.TipoPasseio.Nome,
                    DuracaoMinutos = result.TipoPasseio.DuracaoMinutos,
                    PrecoCustomizado = result.PrecoCustomizado
                };

                response.Messagem = "Preço do serviço atualizado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<bool>> ExcluirServicoPasseador(Guid passeadorId, Guid id)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var servico = await _context.PasseadorServicos
                    .FirstOrDefaultAsync(x => x.Id == id && x.PasseadorId == passeadorId);

                if (servico == null)
                {
                    response.Status = false;
                    response.Messagem = "Serviço não encontrado para este passeador.";
                    return response;
                }

                _context.PasseadorServicos.Remove(servico);
                await _context.SaveChangesAsync();

                response.Dados = true;
                response.Messagem = "Serviço removido com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }
    }
}
