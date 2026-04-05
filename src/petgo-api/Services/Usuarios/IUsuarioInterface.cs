using petgo_api.DTOs.Usuario;
using petgo_api.Models;

namespace petgo_api.Services.Usuarios
{
    public interface IUsuarioInterface
    {
        Task<ApiResponse<List<UsuarioResponseDto>>> ListarUsuarios();
        Task<ApiResponse<UsuarioResponseDto>> GetUsuarioById(Guid idUsuario);
        Task<ApiResponse<UsuarioResponseDto>> GetUsuarioByPetId(Guid petId);
        Task<ApiResponse<UsuarioResponseDto>> CriarUsuario(UsuarioCreateDto usuario);
        Task<ApiResponse<UsuarioResponseDto>> EditarUsuario(Guid idUsuario, UsuarioUpdateDto usuarioUpdateDto, Guid usuarioLogadoId);
        Task<ApiResponse<bool>> ExcluirUsuario(Guid idUsuario);
        Task<ApiResponse<string>> Login(UsuarioLoginDto loginDto);
    }
}