using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using petgo_api.DTOs.Passeio;
using petgo_api.Models;
using petgo_api.Services.PasseadorServicos;

namespace petgo_api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PasseadorServicosController : BaseController
    {
        private readonly IPasseadorServicoInterface _service;

        public PasseadorServicosController(IPasseadorServicoInterface service)
        {
            _service = service;
        }

        [HttpGet("{passeadorId}")]
        public async Task<ActionResult<ApiResponse<List<PasseadorServicoResponseDto>>>> ListarPorPasseador(Guid passeadorId)
        {
            var response = await _service.ListarServicosPorPasseador(passeadorId);
            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<PasseadorServicoResponseDto>>> SalvarPreco(PasseadorServicoCreateDto dto)
        {
            var response = await _service.SalvarServicoPasseador(GetUsuarioLogadoId(), dto);

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> ExcluirPreco(Guid id)
        {
            var response = await _service.ExcluirServicoPasseador(GetUsuarioLogadoId(), id);

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }
    }
}
