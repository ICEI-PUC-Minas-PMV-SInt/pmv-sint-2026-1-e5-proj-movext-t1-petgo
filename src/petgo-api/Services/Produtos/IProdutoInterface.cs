using petgo_api.DTOs.Produto;
using petgo_api.Models;

namespace petgo_api.Services.Produtos
{
    public interface IProdutoInterface
    {
        Task<ApiResponse<List<ProdutoResponseDto>>> ListarProdutos();
        Task<ApiResponse<ProdutoResponseDto>> GetProdutoById(Guid produtoId);
        Task<ApiResponse<ProdutoResponseDto>> CriarProduto(ProdutoCreateDto produtoCreate, Guid usuarioLogadoId);
        Task<ApiResponse<ProdutoResponseDto>> EditarProduto(ProdutoCreateDto produtoUpdate, Guid produtoId, Guid usuarioLogadoId);
        Task<ApiResponse<bool>> ExcluirProduto(Guid produtoId, Guid usuarioLogadoId);
    }
}