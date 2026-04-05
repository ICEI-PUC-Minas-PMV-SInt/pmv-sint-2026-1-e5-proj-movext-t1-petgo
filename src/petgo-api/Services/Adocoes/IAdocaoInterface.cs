using petgo_api.DTOs.Adocao;
using petgo_api.Models;

namespace petgo_api.Services.Adocoes
{
    public interface IAdocaoInterface
    {
        Task<ApiResponse<AdocaoResponseDto>> SolicitarAdocao(AdocaoCreateDto adocaoCreate, Guid usuarioLogadoId);
        Task<ApiResponse<AdocaoResponseDto>> AlterarStatusAdocao(Guid adocaoId, AdocaoStatusUpdateDto adocaoStatusUpdate, Guid usuarioLogadoId);

        // Ver pedidos de adocao como adotante
        Task<ApiResponse<List<AdocaoResponseDto>>> ListarMinhasSolicitacoes(Guid usuarioLogadoId);

        // Ver pedidos como dono/ ONG
        Task<ApiResponse<List<AdocaoResponseDto>>> ListarSolicitacoesRecebidas(Guid usuarioLogadoId);

        Task<ApiResponse<AdocaoResponseDto>> GetAdocaoById(Guid adocaoId);
    }
}