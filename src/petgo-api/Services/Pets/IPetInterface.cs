using petgo_api.DTOs.Pet;
using petgo_api.Models;

namespace petgo_api.Services.Pets
{
    public interface IPetInterface
    {
        Task<ApiResponse<List<PetResponseDto>>> ListarPets();
        Task<ApiResponse<PetResponseDto>> GetPetById(Guid idPet);
        Task<ApiResponse<List<PetResponseDto>>> GetPetsByUsuarioId(Guid idUsuario);
        Task<ApiResponse<PetResponseDto>> CriarPet(PetCreateDto pet, Guid usuarioLogadoId);
        Task<ApiResponse<PetResponseDto>> EditarPet(Guid idPet, PetUpdateDto petUpdate, Guid usuarioLogadoId);
        Task<ApiResponse<PetResponseDto>> AlterarStatusPet(Guid idPet, PetStatusUpdateDto petStatusUpdate, Guid usuarioLogadoId);
        Task<ApiResponse<bool>> ExcluirPet(Guid idPet, Guid usuarioLogadoId);
    }
}