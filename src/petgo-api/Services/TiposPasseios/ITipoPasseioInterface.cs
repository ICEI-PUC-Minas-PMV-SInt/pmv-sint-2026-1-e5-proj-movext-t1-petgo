using petgo_api.DTOs.Passeio;
using petgo_api.Models;

namespace petgo_api.Services.TiposPasseios
{
    public interface ITipoPasseioInterface
    {
        Task<ApiResponse<List<TipoPasseioResponseDto>>> ListarTodos();
        Task<ApiResponse<TipoPasseioResponseDto>> GetTipoPasseioById(Guid id);
        Task<ApiResponse<TipoPasseioResponseDto>> CriarTipoPasseio(TipoPasseioCreateDto tipoCreate);
        Task<ApiResponse<TipoPasseioResponseDto>> EditarTipoPasseio(Guid id, TipoPasseioCreateDto tipoEditar);
        Task<ApiResponse<bool>> ExcluirTipoPasseio(Guid id);
    }
}