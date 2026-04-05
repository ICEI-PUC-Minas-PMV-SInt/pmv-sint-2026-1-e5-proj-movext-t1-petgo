using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using petgo_api.DTOs.Adocao;
using petgo_api.Models;
using petgo_api.Services.Adocoes;

namespace petgo_api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AdocoesController : BaseController
    {
        private readonly IAdocaoInterface _adocaoInterface;

        public AdocoesController(IAdocaoInterface adocaoInterface)
        {
            _adocaoInterface = adocaoInterface;
        }

        [HttpPost("solicitar")]
        public async Task<ActionResult<ApiResponse<AdocaoResponseDto>>> SolicitarAdocao(AdocaoCreateDto adocaoCreate)
        {
            var response = await _adocaoInterface.SolicitarAdocao(adocaoCreate, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<ApiResponse<AdocaoResponseDto>>> AlterarStatus(Guid id, AdocaoStatusUpdateDto statusUpdate)
        {
            var response = await _adocaoInterface.AlterarStatusAdocao(id, statusUpdate, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpGet("minhas-solicitacoes")]
        public async Task<ActionResult<ApiResponse<List<AdocaoResponseDto>>>> ListarMinhasSolicitacoes()
        {
            var response = await _adocaoInterface.ListarMinhasSolicitacoes(GetUsuarioLogadoId());

            return Ok(response);
        }

        [HttpGet("solicitacoes-recebidas")]
        public async Task<ActionResult<ApiResponse<List<AdocaoResponseDto>>>> ListarSolicitacoesRecebidas()
        {
            var response = await _adocaoInterface.ListarSolicitacoesRecebidas(GetUsuarioLogadoId());

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<AdocaoResponseDto>>> GetAdocaoById(Guid id)
        {
            var response = await _adocaoInterface.GetAdocaoById(id);

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

    }
}