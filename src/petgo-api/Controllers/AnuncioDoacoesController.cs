using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using petgo.api.Data;
using petgo.api.Models;

namespace petgo.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnuncioDoacoesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AnuncioDoacoesController> _logger;

        public AnuncioDoacoesController(AppDbContext context, ILogger<AnuncioDoacoesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/AnuncioDoacoes
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<object>>> GetAnuncios()
        {
            try
            {
                // Query em duas etapas para evitar problemas com null
                var anunciosDb = await _context.AnuncioDoacoes
                    .Where(a => a.Status == Status.ATIVO)
                    .Include(a => a.Pet)
                    .ThenInclude(p => p!.Usuario)
                    .OrderByDescending(a => a.Id)
                    .AsNoTracking()
                    .ToListAsync();

                var resultado = anunciosDb.Select(a => new
                {
                    a.Id,
                    a.PetId,
                    a.Status,
                    a.Descricao,
                    a.ContatoWhatsapp,
                    a.Moderacao,
                    Pet = a.Pet != null ? new
                    {
                        a.Pet.Id,
                        a.Pet.Nome,
                        a.Pet.Especie,
                        a.Pet.Raca,
                        IdadeMeses = a.Pet.idadeMeses,
                        a.Pet.Porte,
                        a.Pet.Cidade,
                        a.Pet.Estado,
                        Fotos = string.IsNullOrEmpty(a.Pet.FotosJson)
                            ? new List<string>()
                            : System.Text.Json.JsonSerializer.Deserialize<List<string>>(a.Pet.FotosJson) ?? new List<string>(),
                        a.Pet.Observacoes,
                        Usuario = a.Pet.Usuario != null ? new
                        {
                            a.Pet.Usuario.Id,
                            a.Pet.Usuario.Nome,
                            a.Pet.Usuario.Email,
                            a.Pet.Usuario.Telefone
                        } : null
                    } : null
                }).ToList();

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar anúncios de doação");
                return StatusCode(500, new { message = "Erro ao buscar anúncios de doação" });
            }
        }

        // GET: api/AnuncioDoacoes/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> GetAnuncio(int id)
        {
            try
            {
                var anuncio = await _context.AnuncioDoacoes
                    .Include(a => a.Pet)
                    .ThenInclude(p => p!.Usuario)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (anuncio == null)
                {
                    return NotFound(new { message = "Anúncio não encontrado" });
                }

                var resultado = new
                {
                    anuncio.Id,
                    anuncio.PetId,
                    anuncio.Status,
                    anuncio.Descricao,
                    anuncio.ContatoWhatsapp,
                    anuncio.Moderacao,
                    Pet = anuncio.Pet != null ? new
                    {
                        anuncio.Pet.Id,
                        anuncio.Pet.Nome,
                        anuncio.Pet.Especie,
                        anuncio.Pet.Raca,
                        IdadeMeses = anuncio.Pet.idadeMeses,
                        anuncio.Pet.Porte,
                        anuncio.Pet.Cidade,
                        anuncio.Pet.Estado,
                        Fotos = string.IsNullOrEmpty(anuncio.Pet.FotosJson)
                            ? new List<string>()
                            : System.Text.Json.JsonSerializer.Deserialize<List<string>>(anuncio.Pet.FotosJson) ?? new List<string>(),
                        anuncio.Pet.Observacoes,
                        Usuario = anuncio.Pet.Usuario != null ? new
                        {
                            anuncio.Pet.Usuario.Id,
                            anuncio.Pet.Usuario.Nome,
                            anuncio.Pet.Usuario.Email,
                            anuncio.Pet.Usuario.Telefone
                        } : null
                    } : null
                };

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar anúncio {Id}", id);
                return StatusCode(500, new { message = "Erro ao buscar anúncio" });
            }
        }

        // POST: api/AnuncioDoacoes
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<AnuncioDoacao>> CreateAnuncio([FromBody] AnuncioDoacao anuncio)
        {
            try
            {
                // Verificar se o pet existe
                var petExists = await _context.Pets.AnyAsync(p => p.Id == anuncio.PetId);
                if (!petExists)
                {
                    return NotFound(new { message = "Pet não encontrado" });
                }

                // Verificar se já existe anúncio ativo para este pet
                var anuncioExistente = await _context.AnuncioDoacoes
                    .FirstOrDefaultAsync(a => a.PetId == anuncio.PetId && a.Status == Status.ATIVO);

                if (anuncioExistente != null)
                {
                    return BadRequest(new { message = "Já existe um anúncio ativo para este pet" });
                }

                _context.AnuncioDoacoes.Add(anuncio);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetAnuncio), new { id = anuncio.Id }, anuncio);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao criar anúncio de doação");
                return StatusCode(500, new { message = "Erro ao criar anúncio de doação" });
            }
        }

        // PUT: api/AnuncioDoacoes/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateAnuncio(int id, [FromBody] AnuncioDoacao anuncio)
        {
            if (id != anuncio.Id)
            {
                return BadRequest(new { message = "ID do anúncio não corresponde" });
            }

            try
            {
                _context.Entry(anuncio).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.AnuncioDoacoes.AnyAsync(a => a.Id == id))
                {
                    return NotFound(new { message = "Anúncio não encontrado" });
                }
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar anúncio {Id}", id);
                return StatusCode(500, new { message = "Erro ao atualizar anúncio" });
            }
        }

        // DELETE: api/AnuncioDoacoes/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAnuncio(int id)
        {
            try
            {
                var anuncio = await _context.AnuncioDoacoes.FindAsync(id);
                if (anuncio == null)
                {
                    return NotFound(new { message = "Anúncio não encontrado" });
                }

                _context.AnuncioDoacoes.Remove(anuncio);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao deletar anúncio {Id}", id);
                return StatusCode(500, new { message = "Erro ao deletar anúncio" });
            }
        }
    }
}
