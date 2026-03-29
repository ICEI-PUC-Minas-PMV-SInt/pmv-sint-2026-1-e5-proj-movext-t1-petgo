using Microsoft.AspNetCore.Mvc;
using petgo_api.DTOs.Usuario;
using petgo_api.Models;
using petgo_api.Services.Usuarios;

namespace petgo_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuarioInterface _usuarioInterface;
        public UsuariosController(IUsuarioInterface usuarioInterface)
        {
            _usuarioInterface = usuarioInterface;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<UsuarioResponseDto>>>> ListarUsuarios()
        {
            var usuarios = await _usuarioInterface.ListarUsuarios();

            return Ok(usuarios);
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<UsuarioResponseDto>>> CriarUsuario(UsuarioCreateDto usuario)
        {
            var response = await _usuarioInterface.CriarUsuario(usuario);

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return CreatedAtAction(nameof(GetUsuarioById), new { id = response.Dados.Id }, response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<UsuarioResponseDto>>> GetUsuarioById(Guid id)
        {
            var response = await _usuarioInterface.GetUsuarioById(id);

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<UsuarioResponseDto>>> EditarUsuario(Guid id, UsuarioUpdateDto usuarioUpdate)
        {
            var response = await _usuarioInterface.EditarUsuario(id, usuarioUpdate);

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> ExcluirUsuario(Guid id)
        {
            var response = await _usuarioInterface.ExcluirUsuario(id);

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<string>>> Login(UsuarioLoginDto usuarioLogin)
        {
            var response = await _usuarioInterface.Login(usuarioLogin);

            if (!response.Status)
            {
                return Unauthorized(response);
            }

            return Ok(response);
        }
    }
}