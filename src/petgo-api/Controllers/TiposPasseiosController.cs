using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using petgo_api.DTOs.Passeio;
using petgo_api.Enums;
using petgo_api.Models;
using petgo_api.Services.TiposPasseios;

namespace petgo_api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TiposPasseiosController : BaseController
    {
        private readonly ITipoPasseioInterface _tipoPasseioInterface;

        public TiposPasseiosController(ITipoPasseioInterface tipoPasseioInterface)
        {
            _tipoPasseioInterface = tipoPasseioInterface;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<TipoPasseioResponseDto>>>> ListarTodos()
        {
            var response = await _tipoPasseioInterface.ListarTodos();

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<TipoPasseioResponseDto>>> GetTipoPasseioById(Guid id)
        {
            var response = await _tipoPasseioInterface.GetTipoPasseioById(id);

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<TipoPasseioResponseDto>>> CriarTipoPasseio(TipoPasseioCreateDto tipoPasseioCreate)
        {
            if (GetUsuarioLogadoTipo() != TipoUsuario.Admin)
            {
                return ForbiddenResponse("Apenas administradores podem criar o tipo de serviço.");
            }

            var response = await _tipoPasseioInterface.CriarTipoPasseio(tipoPasseioCreate);

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return CreatedAtAction(nameof(GetTipoPasseioById), new { id = response.Dados.Id }, response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<TipoPasseioResponseDto>>> EditarTipoPasseio(Guid id, TipoPasseioCreateDto tipoEditar)
        {
            if (GetUsuarioLogadoTipo() != TipoUsuario.Admin)
            {
                return ForbiddenResponse("Apenas administradores podem editar o tipo de serviço.");
            }

            var response = await _tipoPasseioInterface.EditarTipoPasseio(id, tipoEditar);

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> ExcluirTipoPasseio(Guid id)
        {
            if (GetUsuarioLogadoTipo() != TipoUsuario.Admin)
            {
                return ForbiddenResponse("Apenas administradores podem excluir o tipo de serviço.");
            }

            var response = await _tipoPasseioInterface.ExcluirTipoPasseio(id);

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        private ObjectResult ForbiddenResponse(string mensagem)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiResponse<string>
            {
                Status = false,
                Messagem = mensagem
            });
        }
    }
}