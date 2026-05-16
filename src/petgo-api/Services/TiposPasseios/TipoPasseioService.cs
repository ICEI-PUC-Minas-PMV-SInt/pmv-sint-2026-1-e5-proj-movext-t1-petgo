using Microsoft.EntityFrameworkCore;
using petgo_api.Data;
using petgo_api.DTOs.Passeio;
using petgo_api.Models;

namespace petgo_api.Services.TiposPasseios
{
    public class TipoPasseioService : ITipoPasseioInterface
    {
        private readonly AppDbContext _context;

        public TipoPasseioService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<TipoPasseioResponseDto>> CriarTipoPasseio(TipoPasseioCreateDto tipoCreate)
        {
            var response = new ApiResponse<TipoPasseioResponseDto>();

            try
            {
                var novoTipo = new TipoPasseio
                {
                    Id = Guid.NewGuid(),
                    Nome = tipoCreate.Nome,
                    DuracaoMinutos = tipoCreate.DuracaoMinutos,
                    PrecoBase = tipoCreate.PrecoBase
                };

                _context.TiposPasseios.Add(novoTipo);
                await _context.SaveChangesAsync();

                response.Dados = MaptoDto(novoTipo);
                response.Messagem = "Tipo de passeio criado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<TipoPasseioResponseDto>> EditarTipoPasseio(Guid id, TipoPasseioCreateDto tipoEditar)
        {
            var response = new ApiResponse<TipoPasseioResponseDto>();

            try
            {
                var tipoPasseio = await _context.TiposPasseios.FirstOrDefaultAsync(t => t.Id == id);

                if (tipoPasseio == null)
                {
                    response.Status = false;
                    response.Messagem = "Tipo de passeio não encontrado";
                    return response;
                }

                tipoPasseio.Nome = tipoEditar.Nome;
                tipoPasseio.DuracaoMinutos = tipoEditar.DuracaoMinutos;
                tipoPasseio.PrecoBase = tipoEditar.PrecoBase;

                _context.TiposPasseios.Update(tipoPasseio);
                await _context.SaveChangesAsync();

                response.Dados = MaptoDto(tipoPasseio);
                response.Messagem = "Tipo de passeio atualizado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<bool>> ExcluirTipoPasseio(Guid id)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var tipoPasseio = await _context.TiposPasseios.FirstOrDefaultAsync(t => t.Id == id);

                if (tipoPasseio == null)
                {
                    response.Status = false;
                    response.Messagem = "Tipo de passeio não encontrado";
                    return response;
                }

                _context.TiposPasseios.Remove(tipoPasseio);
                await _context.SaveChangesAsync();

                response.Messagem = "Tipo de passeio apagado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<TipoPasseioResponseDto>> GetTipoPasseioById(Guid id)
        {
            var response = new ApiResponse<TipoPasseioResponseDto>();

            try
            {
                var tipoPasseio = await _context.TiposPasseios.FirstOrDefaultAsync(t => t.Id == id);

                if (tipoPasseio == null)
                {
                    response.Status = false;
                    response.Messagem = "Tipo de passeio não encontrado!";
                    return response;
                }

                response.Dados = MaptoDto(tipoPasseio);
                response.Messagem = $"Tipo de passeio - {tipoPasseio.Nome} - encontrado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<List<TipoPasseioResponseDto>>> ListarTodos()
        {
            var response = new ApiResponse<List<TipoPasseioResponseDto>>();

            try
            {
                var tiposPasseios = await _context.TiposPasseios.ToListAsync();

                response.Dados = tiposPasseios.Select(t => MaptoDto(t)).ToList();
                response.Messagem = "Lista de tipos de passeios recuperada com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }


        private static TipoPasseioResponseDto MaptoDto(TipoPasseio tipoPasseio)
        {
            return new TipoPasseioResponseDto
            {
                Id = tipoPasseio.Id,
                Nome = tipoPasseio.Nome,
                DuracaoMinutos = tipoPasseio.DuracaoMinutos,
                PrecoBase = tipoPasseio.PrecoBase
            };
        }
    }
}