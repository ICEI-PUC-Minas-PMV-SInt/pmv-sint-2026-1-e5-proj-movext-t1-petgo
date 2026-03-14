using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using petgo.api.Data;
using petgo.api.Models;
using petgo.api.Dtos.Avaliacao;

namespace petgo.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AvaliacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AvaliacoesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Avaliacoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AvaliacaoDto>>> GetAvaliacoes()
        {
            var avaliacoes = await _context.Avaliacoes
                .OrderByDescending(a => a.DataCriacao)
                .ToListAsync();

            var avaliacoesDto = avaliacoes.Select(a => new AvaliacaoDto
            {
                Id = a.Id,
                AlvoTipo = a.AlvoTipo,
                AlvoId = a.AlvoId,
                Nota = a.Nota,
                Titulo = a.Titulo,
                Comentario = a.Comentario,
                AutorNome = a.AutorNome,
                DataCriacao = a.DataCriacao
            });

            return Ok(avaliacoesDto);
        }

        // GET: api/Avaliacoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AvaliacaoDto>> GetAvaliacao(int id)
        {
            var avaliacao = await _context.Avaliacoes.FindAsync(id);

            if (avaliacao == null)
            {
                return NotFound(new { message = "Avaliação não encontrada." });
            }

            var avaliacaoDto = new AvaliacaoDto
            {
                Id = avaliacao.Id,
                AlvoTipo = avaliacao.AlvoTipo,
                AlvoId = avaliacao.AlvoId,
                Nota = avaliacao.Nota,
                Titulo = avaliacao.Titulo,
                Comentario = avaliacao.Comentario,
                AutorNome = avaliacao.AutorNome,
                DataCriacao = avaliacao.DataCriacao
            };

            return Ok(avaliacaoDto);
        }

        // GET: api/Avaliacoes/alvo/{alvoTipo}/{alvoId}
        [HttpGet("alvo/{alvoTipo}/{alvoId}")]
        public async Task<ActionResult<IEnumerable<AvaliacaoDto>>> GetAvaliacoesByAlvo(AlvoTipo alvoTipo, int alvoId)
        {
            var avaliacoes = await _context.Avaliacoes
                .Where(a => a.AlvoTipo == alvoTipo && a.AlvoId == alvoId)
                .OrderByDescending(a => a.DataCriacao)
                .ToListAsync();

            var avaliacoesDto = avaliacoes.Select(a => new AvaliacaoDto
            {
                Id = a.Id,
                AlvoTipo = a.AlvoTipo,
                AlvoId = a.AlvoId,
                Nota = a.Nota,
                Titulo = a.Titulo,
                Comentario = a.Comentario,
                AutorNome = a.AutorNome,
                DataCriacao = a.DataCriacao
            });

            return Ok(avaliacoesDto);
        }

        // POST: api/Avaliacoes
        [HttpPost]
        public async Task<ActionResult<AvaliacaoDto>> CreateAvaliacao(AvaliacaoCreateDto avaliacaoDto)
        {
            // Validar se o alvo existe baseado no tipo
            if (avaliacaoDto.AlvoTipo == AlvoTipo.PASSEADOR)
            {
                var passeadorExists = await _context.Passeadores.AnyAsync(p => p.UsuarioId == avaliacaoDto.AlvoId);
                if (!passeadorExists)
                {
                    return BadRequest(new { message = "Passeador não encontrado." });
                }
            }
            else if (avaliacaoDto.AlvoTipo == AlvoTipo.PRODUTO)
            {
                var produtoExists = await _context.Produtos.AnyAsync(p => p.Id == avaliacaoDto.AlvoId);
                if (!produtoExists)
                {
                    return BadRequest(new { message = "Produto não encontrado." });
                }
            }

            var avaliacao = new Avaliacao
            {
                AlvoTipo = avaliacaoDto.AlvoTipo,
                AlvoId = avaliacaoDto.AlvoId,
                Nota = avaliacaoDto.Nota,
                Titulo = avaliacaoDto.Titulo,
                Comentario = avaliacaoDto.Comentario,
                AutorNome = avaliacaoDto.AutorNome,
                DataCriacao = DateTime.UtcNow
            };

            _context.Avaliacoes.Add(avaliacao);
            await _context.SaveChangesAsync();

            // Atualizar média de avaliações
            if (avaliacaoDto.AlvoTipo == AlvoTipo.PASSEADOR)
            {
                await AtualizarMediaPasseador(avaliacaoDto.AlvoId);
            }
            else if (avaliacaoDto.AlvoTipo == AlvoTipo.PRODUTO)
            {
                await AtualizarMediaProduto(avaliacaoDto.AlvoId);
            }

            var avaliacaoRetorno = new AvaliacaoDto
            {
                Id = avaliacao.Id,
                AlvoTipo = avaliacao.AlvoTipo,
                AlvoId = avaliacao.AlvoId,
                Nota = avaliacao.Nota,
                Titulo = avaliacao.Titulo,
                Comentario = avaliacao.Comentario,
                AutorNome = avaliacao.AutorNome,
                DataCriacao = avaliacao.DataCriacao
            };

            return CreatedAtAction(nameof(GetAvaliacao), new { id = avaliacao.Id }, avaliacaoRetorno);
        }

        // PUT: api/Avaliacoes/5
        [HttpPut("{id}")]
        public async Task<ActionResult<AvaliacaoDto>> UpdateAvaliacao(int id, AvaliacaoUpdateDto avaliacaoDto)
        {
            var avaliacao = await _context.Avaliacoes.FindAsync(id);

            if (avaliacao == null)
            {
                return NotFound(new { message = "Avaliação não encontrada." });
            }

            if (avaliacaoDto.Nota.HasValue)
                avaliacao.Nota = avaliacaoDto.Nota.Value;

            if (!string.IsNullOrWhiteSpace(avaliacaoDto.Titulo))
                avaliacao.Titulo = avaliacaoDto.Titulo;

            if (!string.IsNullOrWhiteSpace(avaliacaoDto.Comentario))
                avaliacao.Comentario = avaliacaoDto.Comentario;

            try
            {
                await _context.SaveChangesAsync();

                // Atualizar média se necessário
                if (avaliacao.AlvoTipo == AlvoTipo.PASSEADOR)
                {
                    await AtualizarMediaPasseador(avaliacao.AlvoId);
                }
                else if (avaliacao.AlvoTipo == AlvoTipo.PRODUTO)
                {
                    await AtualizarMediaProduto(avaliacao.AlvoId);
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AvaliacaoExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            var avaliacaoRetorno = new AvaliacaoDto
            {
                Id = avaliacao.Id,
                AlvoTipo = avaliacao.AlvoTipo,
                AlvoId = avaliacao.AlvoId,
                Nota = avaliacao.Nota,
                Titulo = avaliacao.Titulo,
                Comentario = avaliacao.Comentario,
                AutorNome = avaliacao.AutorNome,
                DataCriacao = avaliacao.DataCriacao
            };

            return Ok(avaliacaoRetorno);
        }

        // DELETE: api/Avaliacoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAvaliacao(int id)
        {
            var avaliacao = await _context.Avaliacoes.FindAsync(id);
            if (avaliacao == null)
            {
                return NotFound(new { message = "Avaliação não encontrada." });
            }

            var alvoTipo = avaliacao.AlvoTipo;
            var alvoId = avaliacao.AlvoId;

            _context.Avaliacoes.Remove(avaliacao);
            await _context.SaveChangesAsync();

            // Atualizar média
            if (alvoTipo == AlvoTipo.PASSEADOR)
            {
                await AtualizarMediaPasseador(alvoId);
            }
            else if (alvoTipo == AlvoTipo.PRODUTO)
            {
                await AtualizarMediaProduto(alvoId);
            }

            return NoContent();
        }

        private bool AvaliacaoExists(int id)
        {
            return _context.Avaliacoes.Any(e => e.Id == id);
        }

        private async Task AtualizarMediaPasseador(int usuarioId)
        {
            // UsuarioId é a chave primária do Passeador
            var passeador = await _context.Passeadores
                .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);
            
            if (passeador == null) return;

            var avaliacoes = await _context.Avaliacoes
                .Where(a => a.AlvoTipo == AlvoTipo.PASSEADOR && a.AlvoId == usuarioId)
                .ToListAsync();

            if (avaliacoes.Any())
            {
                passeador.AvaliacaoMedia = avaliacoes.Average(a => a.Nota);
                passeador.QuantidadeAvaliacoes = avaliacoes.Count;
            }
            else
            {
                passeador.AvaliacaoMedia = 0;
                passeador.QuantidadeAvaliacoes = 0;
            }

            await _context.SaveChangesAsync();
        }

        private async Task AtualizarMediaProduto(int produtoId)
        {
            var produto = await _context.Produtos.FindAsync(produtoId);
            if (produto == null) return;

            var avaliacoes = await _context.Avaliacoes
                .Where(a => a.AlvoTipo == AlvoTipo.PRODUTO && a.AlvoId == produtoId)
                .ToListAsync();

            if (avaliacoes.Any())
            {
                produto.AvaliacaoMedia = avaliacoes.Average(a => a.Nota);
                produto.QuantidadeAvaliacoes = avaliacoes.Count;
            }
            else
            {
                produto.AvaliacaoMedia = 0;
                produto.QuantidadeAvaliacoes = 0;
            }

            await _context.SaveChangesAsync();
        }
    }
}
