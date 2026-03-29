using petgo_api.DTOs.Usuario;
using petgo_api.Models;

namespace petgo_api.Services.Usuarios
{
    public interface IUsuarioInterface
    {
        Task<ApiResponse<List<UsuarioResponseDto>>> ListarUsuarios();
        Task<ApiResponse<UsuarioResponseDto>> GetUsuarioById(Guid idUsuario);
        Task<ApiResponse<Usuario>> GetUsuarioByPetId(Guid PetId);
        Task<ApiResponse<UsuarioResponseDto>> CriarUsuario(UsuarioCreateDto usuario);
        Task<ApiResponse<UsuarioResponseDto>> EditarUsuario(Guid idUsuario, UsuarioUpdateDto usuarioUpdateDto);
        Task<ApiResponse<bool>> ExcluirUsuario(Guid idUsuario);
        Task<ApiResponse<string>> Login(UsuarioLoginDto loginDto);
    }
}