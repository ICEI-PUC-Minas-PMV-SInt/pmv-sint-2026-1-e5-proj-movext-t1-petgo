using petgo_api.DTOs.Passeio;
using petgo_api.Models;

namespace petgo_api.Services.PasseadorServicos
{
    public interface IPasseadorServicoInterface
    {
        Task<ApiResponse<List<PasseadorServicoResponseDto>>> ListarServicosPorPasseador(Guid passeadorId);
        Task<ApiResponse<PasseadorServicoResponseDto>> SalvarServicoPasseador(Guid passeadorId, PasseadorServicoCreateDto dto);
        Task<ApiResponse<bool>> ExcluirServicoPasseador(Guid passeadorId, Guid id);
    }
}
