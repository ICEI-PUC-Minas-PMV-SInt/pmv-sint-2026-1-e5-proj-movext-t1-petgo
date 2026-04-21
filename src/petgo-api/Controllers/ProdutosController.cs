using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using petgo_api.DTOs.Produto;
using petgo_api.Enums;
using petgo_api.Models;
using petgo_api.Services.Produtos;

namespace petgo_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProdutosController : BaseController
    {
        private readonly IProdutoInterface _produtoInterface;

        public ProdutosController(IProdutoInterface produtoInterface)
        {
            _produtoInterface = produtoInterface;
        }

        [HttpGet]
        public async Task<ActionResult<List<ProdutoResponseDto>>> ListarProdutos()
        {
            var produtos = await _produtoInterface.ListarProdutos();

            return Ok(produtos);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<ProdutoResponseDto>> CriarProduto(ProdutoCreateDto produtoCreate)
        {
            var tipo = GetUsuarioLogadoTipo();

            if (tipo != TipoUsuario.Admin && tipo != TipoUsuario.Ong)
            {
                var erroResponse = new ApiResponse<string>
                {
                    Status = false,
                    Messagem = "Apenas administradores e ongs podem realizar esta ação."
                };

                return StatusCode(StatusCodes.Status403Forbidden, erroResponse);
            }

            var response = await _produtoInterface.CriarProduto(produtoCreate, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return CreatedAtAction(nameof(GetProdutoById), new { response.Dados.Id }, response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProdutoResponseDto>> GetProdutoById(Guid id)
        {
            var response = await _produtoInterface.GetProdutoById(id);

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<ProdutoResponseDto>> EditarProduto(ProdutoCreateDto produtoUpdate, Guid id)
        {
            var tipo = GetUsuarioLogadoTipo();

            if (tipo != TipoUsuario.Admin && tipo != TipoUsuario.Ong)
            {
                var erroResponse = new ApiResponse<string>
                {
                    Status = false,
                    Messagem = "Apenas administradores e ongs podem realizar esta ação."
                };

                return StatusCode(StatusCodes.Status403Forbidden, erroResponse);
            }

            var response = await _produtoInterface.EditarProduto(produtoUpdate, id, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> ExcluirProduto(Guid id)
        {
            var tipo = GetUsuarioLogadoTipo();

            if (tipo != TipoUsuario.Admin && tipo != TipoUsuario.Ong)
            {
                var erroResponse = new ApiResponse<string>
                {
                    Status = false,
                    Messagem = "Apenas administradores e ongs podem realizar esta ação."
                };

                return StatusCode(StatusCodes.Status403Forbidden, erroResponse);
            }

            var response = await _produtoInterface.ExcluirProduto(id, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }
    }
}