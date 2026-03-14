using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using petgo.api.Data;
using petgo.api.Models;

namespace petgo.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PetsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PetsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Pets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pet>>> GetPets(
            [FromQuery] EspeciePet? especie = null,
            [FromQuery] PortePet? porte = null,
            [FromQuery] string? cidade = null,
            [FromQuery] string? estado = null)
        {
            var query = _context.Pets
                .Include(p => p.Usuario)
                .AsQueryable();

            if (especie.HasValue)
            {
                query = query.Where(p => p.Especie == especie.Value);
            }

            if (porte.HasValue)
            {
                query = query.Where(p => p.Porte == porte.Value);
            }

            if (!string.IsNullOrEmpty(cidade))
            {
                query = query.Where(p => p.Cidade.Contains(cidade));
            }

            if (!string.IsNullOrEmpty(estado))
            {
                query = query.Where(p => p.Estado.Contains(estado));
            }

            var pets = await query
                .OrderBy(p => p.Nome)
                .ToListAsync();

            return Ok(pets);
        }

        // GET: api/Pets/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Pet>> GetPet(int id)
        {
            var pet = await _context.Pets
                .Include(p => p.Usuario)
                .Include(p => p.AnuncioDoacao)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pet == null)
            {
                return NotFound(new { message = "Pet não encontrado" });
            }

            return Ok(pet);
        }

        // GET: api/Pets/usuario/{usuarioId}
        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<Pet>>> GetPetsByUsuario(int usuarioId)
        {
            var pets = await _context.Pets
                .Where(p => p.UsuarioId == usuarioId)
                .OrderBy(p => p.Nome)
                .ToListAsync();

            return Ok(pets);
        }

        // POST: api/Pets
        [HttpPost]
        public async Task<ActionResult<Pet>> CreatePet(Pet pet)
        {
            // Validar usuário
            var usuarioExists = await _context.Usuarios
                .AnyAsync(u => u.Id == pet.UsuarioId);

            if (!usuarioExists)
            {
                return BadRequest(new { message = "Usuário não encontrado" });
            }

            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetPet),
                new { id = pet.Id },
                pet);
        }

        // PUT: api/Pets/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePet(int id, Pet pet)
        {
            if (id != pet.Id)
            {
                return BadRequest(new { message = "ID do pet não corresponde" });
            }

            _context.Entry(pet).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Pets.AnyAsync(e => e.Id == id))
                {
                    return NotFound(new { message = "Pet não encontrado" });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Pets/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePet(int id)
        {
            var pet = await _context.Pets.FindAsync(id);
            
            if (pet == null)
            {
                return NotFound(new { message = "Pet não encontrado" });
            }

            _context.Pets.Remove(pet);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}