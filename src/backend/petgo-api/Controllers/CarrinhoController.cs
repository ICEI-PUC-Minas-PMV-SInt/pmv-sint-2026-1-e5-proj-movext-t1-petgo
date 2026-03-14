using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using petgo.api.Data;
using petgo.api.Models;

namespace petgo.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarrinhoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CarrinhoController> _logger;

        public CarrinhoController(AppDbContext context, ILogger<CarrinhoController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/carrinho/{usuarioId}
        [HttpGet("{usuarioId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCarrinhoByUsuario(int usuarioId)
        {
            try
            {
                var itensDb = await _context.CarrinhoItens
                    .Where(c => c.UsuarioId == usuarioId)
                    .Include(c => c.Produto)
                    .ThenInclude(p => p!.Categoria)
                    .OrderByDescending(c => c.DataAdicao)
                    .ToListAsync();

                var itens = itensDb.Select(c => new
                {
                    c.Id,
                    c.UsuarioId,
                    c.ProdutoId,
                    c.Quantidade,
                    c.DataAdicao,
                    Produto = c.Produto != null ? new
                    {
                        c.Produto.Id,
                        c.Produto.Nome,
                        c.Produto.Descricao,
                        c.Produto.Preco,
                        c.Produto.Estoque,
                        c.Produto.Status,
                        Imagens = string.IsNullOrEmpty(c.Produto.ImagensJson) 
                            ? new List<string>() 
                            : System.Text.Json.JsonSerializer.Deserialize<List<string>>(c.Produto.ImagensJson) ?? new List<string>(),
                        c.Produto.AvaliacaoMedia,
                        c.Produto.QuantidadeAvaliacoes,
                        CategoriaProduto = c.Produto.Categoria != null ? new
                        {
                            c.Produto.Categoria.Id,
                            c.Produto.Categoria.Nome,
                            c.Produto.Categoria.Descricao
                        } : null
                    } : null
                }).ToList();

                return Ok(itens);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar carrinho do usuário {UsuarioId}", usuarioId);
                return StatusCode(500, new { message = "Erro ao buscar carrinho" });
            }
        }

        // POST: api/carrinho
        [HttpPost]
        public async Task<ActionResult<CarrinhoItem>> AdicionarItem([FromBody] CarrinhoItem item)
        {
            try
            {
                // Verificar se o produto existe
                var produto = await _context.Produtos.FindAsync(item.ProdutoId);
                if (produto == null)
                {
                    return NotFound(new { message = "Produto não encontrado" });
                }

                // Verificar se já existe o item no carrinho
                var itemExistente = await _context.CarrinhoItens
                    .FirstOrDefaultAsync(c => c.UsuarioId == item.UsuarioId && c.ProdutoId == item.ProdutoId);

                if (itemExistente != null)
                {
                    // Atualizar quantidade
                    itemExistente.Quantidade += item.Quantidade;
                    
                    // Verificar estoque
                    if (itemExistente.Quantidade > produto.Estoque)
                    {
                        return BadRequest(new { message = "Quantidade solicitada excede o estoque disponível" });
                    }

                    await _context.SaveChangesAsync();
                    return Ok(itemExistente);
                }

                // Verificar estoque
                if (item.Quantidade > produto.Estoque)
                {
                    return BadRequest(new { message = "Quantidade solicitada excede o estoque disponível" });
                }

                // Adicionar novo item
                item.DataAdicao = DateTime.UtcNow;
                _context.CarrinhoItens.Add(item);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCarrinhoByUsuario), new { usuarioId = item.UsuarioId }, item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao adicionar item ao carrinho");
                return StatusCode(500, new { message = "Erro ao adicionar item ao carrinho" });
            }
        }

        // PUT: api/carrinho/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> AtualizarQuantidade(int id, [FromBody] int quantidade)
        {
            try
            {
                var item = await _context.CarrinhoItens
                    .Include(c => c.Produto)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (item == null)
                {
                    return NotFound(new { message = "Item não encontrado no carrinho" });
                }

                if (quantidade <= 0)
                {
                    return BadRequest(new { message = "Quantidade deve ser maior que zero" });
                }

                // Verificar estoque
                if (item.Produto != null && quantidade > item.Produto.Estoque)
                {
                    return BadRequest(new { message = "Quantidade solicitada excede o estoque disponível" });
                }

                item.Quantidade = quantidade;
                await _context.SaveChangesAsync();

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao atualizar item do carrinho");
                return StatusCode(500, new { message = "Erro ao atualizar item do carrinho" });
            }
        }

        // DELETE: api/carrinho/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoverItem(int id)
        {
            try
            {
                var item = await _context.CarrinhoItens.FindAsync(id);
                if (item == null)
                {
                    return NotFound(new { message = "Item não encontrado no carrinho" });
                }

                _context.CarrinhoItens.Remove(item);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao remover item do carrinho");
                return StatusCode(500, new { message = "Erro ao remover item do carrinho" });
            }
        }

        // DELETE: api/carrinho/limpar/{usuarioId}
        [HttpDelete("limpar/{usuarioId}")]
        public async Task<IActionResult> LimparCarrinho(int usuarioId)
        {
            try
            {
                var itens = await _context.CarrinhoItens
                    .Where(c => c.UsuarioId == usuarioId)
                    .ToListAsync();

                _context.CarrinhoItens.RemoveRange(itens);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao limpar carrinho");
                return StatusCode(500, new { message = "Erro ao limpar carrinho" });
            }
        }

        // GET: api/carrinho/total/{usuarioId}
        [HttpGet("total/{usuarioId}")]
        public async Task<ActionResult<object>> GetTotalCarrinho(int usuarioId)
        {
            try
            {
                var total = await _context.CarrinhoItens
                    .Where(c => c.UsuarioId == usuarioId)
                    .Include(c => c.Produto)
                    .SumAsync(c => c.Produto!.Preco * c.Quantidade);

                var quantidadeItens = await _context.CarrinhoItens
                    .Where(c => c.UsuarioId == usuarioId)
                    .CountAsync();

                return Ok(new { total, quantidadeItens });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao calcular total do carrinho");
                return StatusCode(500, new { message = "Erro ao calcular total do carrinho" });
            }
        }
    }
}
