using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using petgo_api.DTOs.Pet;
using petgo_api.Models;
using petgo_api.Services.Pets;

namespace petgo_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PetsController : BaseController
    {
        private readonly IPetInterface _petInterface;
        public PetsController(IPetInterface petInterface)
        {
            _petInterface = petInterface;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<PetResponseDto>>>> ListarPets()
        {
            var pets = await _petInterface.ListarPets();

            return Ok(pets);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<PetResponseDto>>> CriarPet(PetCreateDto pet)
        {
            var response = await _petInterface.CriarPet(pet, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return CreatedAtAction(nameof(GetPetById), new { id = response.Dados.Id }, response);

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<PetResponseDto>>> GetPetById(Guid id)
        {
            var response = await _petInterface.GetPetById(id);

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<PetResponseDto>>> EditarPet(Guid id, PetUpdateDto petUpdate)
        {
            var response = await _petInterface.EditarPet(id, petUpdate, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [Authorize]
        [HttpPut("{id}/status")]
        public async Task<ActionResult<ApiResponse<PetResponseDto>>> AlterarStatusPet(Guid id, PetStatusUpdateDto statusUpdate)
        {
            var response = await _petInterface.AlterarStatusPet(id, statusUpdate, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> ExcluirPet(Guid id)
        {
            var response = await _petInterface.ExcluirPet(id, GetUsuarioLogadoId());

            if (!response.Status)
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        [Authorize]
        [HttpGet("meus-pets")]
        public async Task<ActionResult<ApiResponse<List<PetResponseDto>>>> GetPetsByUsuarioId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new ApiResponse<List<PetResponseDto>>
                {
                    Status = false,
                    Messagem = "Usuário não indetificado no token"
                });
            }

            var response = await _petInterface.GetPetsByUsuarioId(GetUsuarioLogadoId());

            if (!response.Status)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

    }
}