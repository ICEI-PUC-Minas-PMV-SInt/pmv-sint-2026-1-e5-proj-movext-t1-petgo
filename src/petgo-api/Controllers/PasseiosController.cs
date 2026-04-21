using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using petgo_api.DTOs.Passeio;
using petgo_api.Enums;
using petgo_api.Models;
using petgo_api.Services.Passeios;

namespace petgo_api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PasseiosController : BaseController
    {
        private readonly IPasseioInterface _passeioInterface;

        public PasseiosController(IPasseioInterface passeioInterface)
        {
            _passeioInterface = passeioInterface;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<PasseioResponseDto>>> CriarPasseio(PasseioCreateDto passeioCreate)
        {
            var response = await _passeioInterface.CriarPasseio(passeioCreate, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return CreatedAtAction(nameof(GetPasseioById), new { id = response.Dados.Id }, response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<PasseioResponseDto>>> GetPasseioById(Guid id)
        {
            var response = await _passeioInterface.GetPasseioById(id, GetUsuarioLogadoId(), GetUsuarioLogadoTipo());

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [HttpGet("meus-agendamentos")]
        public async Task<ActionResult<ApiResponse<List<PasseioResponseDto>>>> ListarPasseiosPorTutor()
        {
            var response = await _passeioInterface.ListarPasseiosPorTutor(GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpGet("minha-agenda")]
        public async Task<ActionResult<ApiResponse<List<PasseioResponseDto>>>> ListarPasseiosPorPasseador()
        {
            var response = await _passeioInterface.ListarPasseiosPorPasseador(GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }


        [HttpPatch("atualizar-status/{id}")]
        public async Task<ActionResult<ApiResponse<PasseioResponseDto>>> AtualizarStatus(Guid id, StatusPasseio novoStatus)
        {
            var response = await _passeioInterface.AlterarStatusPasseio(id, novoStatus, GetUsuarioLogadoId(), GetUsuarioLogadoTipo());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPatch("cancelar-passeio/{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> CancelarPasseio(Guid id)
        {
            var response = await _passeioInterface.CancelarPasseio(id, GetUsuarioLogadoId(), GetUsuarioLogadoTipo());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }
    }
}