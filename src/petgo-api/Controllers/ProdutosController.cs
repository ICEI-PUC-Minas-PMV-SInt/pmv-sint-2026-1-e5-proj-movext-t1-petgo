using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using petgo.api.Data;
using petgo.api.Models;

namespace petgo.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProdutosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProdutosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Produtos
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetProdutos(
            [FromQuery] int? categoriaId = null,
            [FromQuery] StatusProduto? status = null,
            [FromQuery] string? busca = null)
        {
            var query = _context.Produtos
                .Include(p => p.Categoria)
                .AsQueryable();

            // Filtrar por categoria
            if (categoriaId.HasValue)
            {
                query = query.Where(p => p.CategoriaProdutoId == categoriaId.Value);
            }

            // Filtrar por status (se especificado)
            if (status.HasValue)
            {
                query = query.Where(p => p.Status == status.Value);
            }
            // Se não especificar status, retorna TODOS os produtos (ATIVO + RASCUNHO)

            // Busca por nome ou descrição
            if (!string.IsNullOrEmpty(busca))
            {
                query = query.Where(p => 
                    p.Nome.Contains(busca) || 
                    p.Descricao.Contains(busca));
            }

            var produtos = await query
                .OrderBy(p => p.Nome)
                .Select(p => new
                {
                    p.Id,
                    p.Nome,
                    p.Descricao,
                    p.Preco,
                    p.Estoque,
                    p.Status,
                    p.CategoriaProdutoId,
                    Categoria = p.Categoria != null ? new
                    {
                        p.Categoria.Id,
                        p.Categoria.Nome,
                        p.Categoria.Descricao
                    } : null,
                    p.AvaliacaoMedia,
                    p.QuantidadeAvaliacoes,
                    Imagens = p.Imagens
                })
                .ToListAsync();

            return Ok(produtos);
        }

        // GET: api/Produtos/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProduto(int id)
        {
            var produto = await _context.Produtos
                .Include(p => p.Categoria)
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Nome,
                    p.Descricao,
                    p.Preco,
                    p.Estoque,
                    p.Status,
                    p.CategoriaProdutoId,
                    Categoria = p.Categoria != null ? new
                    {
                        p.Categoria.Id,
                        p.Categoria.Nome,
                        p.Categoria.Descricao
                    } : null,
                    p.AvaliacaoMedia,
                    p.QuantidadeAvaliacoes,
                    Imagens = p.Imagens
                })
                .FirstOrDefaultAsync();

            if (produto == null)
            {
                return NotFound(new { message = "Produto não encontrado" });
            }

            return Ok(produto);
        }

        // POST: api/Produtos
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<Produto>> CreateProduto(Produto produto)
        {
            // Validar categoria
            var categoriaExists = await _context.CategoriasProdutos
                .AnyAsync(c => c.Id == produto.CategoriaProdutoId);

            if (!categoriaExists)
            {
                return BadRequest(new { message = "Categoria não encontrada" });
            }

            _context.Produtos.Add(produto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetProduto),
                new { id = produto.Id },
                produto);
        }

        // PUT: api/Produtos/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateProduto(int id, Produto produto)
        {
            if (id != produto.Id)
            {
                return BadRequest(new { message = "ID do produto não corresponde" });
            }

            // Buscar produto existente do banco
            var produtoExistente = await _context.Produtos.FindAsync(id);
            
            if (produtoExistente == null)
            {
                return NotFound(new { message = "Produto não encontrado" });
            }

            // Validar categoria
            var categoriaExists = await _context.CategoriasProdutos
                .AnyAsync(c => c.Id == produto.CategoriaProdutoId);

            if (!categoriaExists)
            {
                return BadRequest(new { message = "Categoria não encontrada" });
            }

            // Atualizar APENAS as propriedades editáveis
            // Preservar AvaliacaoMedia e QuantidadeAvaliacoes
            produtoExistente.Nome = produto.Nome;
            produtoExistente.Descricao = produto.Descricao;
            produtoExistente.Preco = produto.Preco;
            produtoExistente.Estoque = produto.Estoque;
            produtoExistente.Status = produto.Status;
            produtoExistente.CategoriaProdutoId = produto.CategoriaProdutoId;
            produtoExistente.ImagensJson = produto.ImagensJson;
            // NÃO atualizar: AvaliacaoMedia, QuantidadeAvaliacoes

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await ProdutoExists(id))
                {
                    return NotFound(new { message = "Produto não encontrado" });
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Produtos/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteProduto(int id)
        {
            var produto = await _context.Produtos.FindAsync(id);
            
            if (produto == null)
            {
                return NotFound(new { message = "Produto não encontrado" });
            }

            _context.Produtos.Remove(produto);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Produtos/Categorias
        [HttpGet("Categorias")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CategoriaProduto>>> GetCategorias()
        {
            var categorias = await _context.CategoriasProdutos
                .OrderBy(c => c.Nome)
                .ToListAsync();

            return Ok(categorias);
        }

        private async Task<bool> ProdutoExists(int id)
        {
            return await _context.Produtos.AnyAsync(e => e.Id == id);
        }
    }
}