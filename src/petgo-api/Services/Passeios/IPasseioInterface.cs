using System.Runtime.InteropServices;
using petgo_api.DTOs.Passeio;
using petgo_api.Enums;
using petgo_api.Models;

namespace petgo_api.Services.Passeios
{
    public interface IPasseioInterface
    {
        Task<ApiResponse<PasseioResponseDto>> CriarPasseio(PasseioCreateDto passeioCreate, Guid usuarioLogadoId);
        Task<ApiResponse<List<PasseioResponseDto>>> ListarPasseiosPorTutor(Guid usuarioLogadoId);
        Task<ApiResponse<List<PasseioResponseDto>>> ListarPasseiosPorPasseador(Guid usuarioLogadoId);
        Task<ApiResponse<PasseioResponseDto>> AlterarStatusPasseio(Guid passeioId, StatusPasseio statusPasseio, Guid usuarioLogadoId, TipoUsuario tipoUsuario);
        Task<ApiResponse<bool>> CancelarPasseio(Guid passeioId, Guid usuarioLogadoId, TipoUsuario tipoUsuario);
        Task<ApiResponse<PasseioResponseDto>> GetPasseioById(Guid passeioId, Guid usuarioLogadoId, TipoUsuario tipoUsuario);
    }
}