using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using petgo.api.Data;
using petgo.api.Dtos.Passeador;
using petgo.api.Models;

namespace petgo.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PasseadoresController : ControllerBase
    {
        private readonly AppDbContext _context;

        private static readonly Expression<Func<Passeador, PasseadorDto>> _asPasseadorDto = p => new PasseadorDto
    {
        UsuarioId = p.UsuarioId,
        Descricao = p.Descricao,
        ValorCobrado = p.ValorCobrado,
        AvaliacaoMedia = p.AvaliacaoMedia,
        QuantidadeAvaliacoes = p.QuantidadeAvaliacoes,
        Nome = p.Usuario.Nome,
        FotoPerfil = p.Usuario.FotoPerfil,
        Telefone = p.Usuario.Telefone,
        Servicos = p.Servicos.Where(s => s.Ativo)
                   .Select(s => new ServicoPasseadorDto
                   {
                       Id = s.Id,
                       Titulo = s.Titulo,
                       Descricao = s.Descricao,
                       TipoServico = (int)s.TipoServico
                   }).ToList()
    };

        public PasseadoresController(AppDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<PasseadorDto>>> GetPasseadores()
        {
            var passeadores = await _context.Passeadores
                                        .Select(_asPasseadorDto)
                                        .ToListAsync();

            return Ok(passeadores);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PasseadorDto>> GetById(int id)
        {
            var passeador = await _context.Passeadores
                                    .Where(p => p.UsuarioId == id)
                                    .Select(_asPasseadorDto)
                                    .FirstOrDefaultAsync();

            if (passeador == null) return NotFound();
            return Ok(passeador);
        }

        [HttpPost]
        public async Task<ActionResult<PasseadorDto>> CreatePasseador(PasseadorCreateDto passeadorDto)
        {
            var usuario = await _context.Usuarios
                                    .FirstOrDefaultAsync(u => u.Id == passeadorDto.UsuarioId);

            if (usuario == null)
            {
                return BadRequest(new { message = "Usuário não encontrado." });
            }

            var passeadorJaExiste = await _context.Passeadores
                                                .AnyAsync(p => p.UsuarioId == passeadorDto.UsuarioId);

            if (passeadorJaExiste)
            {
                return BadRequest(new { message = "Este usuário já possui um perfil de passeador." });
            }

            var passeador = new Passeador
            {
                UsuarioId = passeadorDto.UsuarioId,
                Descricao = passeadorDto.Descricao,
                ValorCobrado = passeadorDto.ValorCobrado
            };

            try
            {
                _context.Passeadores.Add(passeador);
                await _context.SaveChangesAsync();

                //  DTO de resposta (Sem segunda chamada ao banco)
                var passeadorRetorno = new PasseadorDto
                {
                    UsuarioId = passeador.UsuarioId,
                    Nome = usuario.Nome,
                    FotoPerfil = usuario.FotoPerfil,
                    Descricao = passeador.Descricao,
                    ValorCobrado = passeador.ValorCobrado,
                    AvaliacaoMedia = passeador.AvaliacaoMedia,
                    QuantidadeAvaliacoes = passeador.QuantidadeAvaliacoes,
                    Telefone = usuario.Telefone,
                    Servicos = []
                };
                return CreatedAtAction(nameof(GetById), new { id = passeadorRetorno.UsuarioId }, passeadorRetorno);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao criar passeador: {ex.Message}");
                return StatusCode(500, "Ocorreu um erro interno ao criar o perfil.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePasseador(int id, PasseadorCreateDto passeadorDto)
        {
            var passeador = await _context.Passeadores.FirstOrDefaultAsync(p => p.UsuarioId == id);

            if (passeador == null)
            {
                // Se o ID da URL não existir, retorna 404 Not Found
                return NotFound(new { message = "Perfil de passeador não encontrado." });
            }

            passeador.Descricao = passeadorDto.Descricao;
            passeador.ValorCobrado = passeadorDto.ValorCobrado;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao atualizar passeador: {ex.Message}");
                return StatusCode(500, new { message = "Ocorreu um erro interno ao atualizar o perfil." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePasseador(int id)
        {
            var passeador = await _context.Passeadores.FindAsync(id);

            if (passeador == null) return NotFound(new { message = "Perfil de passeador não encontrado." });

            try
            {
                _context.Passeadores.Remove(passeador);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao deletar passeador: {ex.Message}");
                return StatusCode(500, new { message = "Ocorreu um erro interno ao deletar o perfil." });
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<PasseadorDto>>> SearchPasseadores([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(new { message = "Nome de busca é obrigatório." });
            }

            var likeQuery = $"%{name}%";

            var passeadoresDto = await _context.Passeadores
                                        .Where(p => EF.Functions.Like(p.Descricao, likeQuery) || 
                                                    EF.Functions.Like(p.Usuario.Nome, likeQuery)
                                        )
                                        .Select(_asPasseadorDto)
                                        .ToListAsync();
            return Ok(passeadoresDto);
        }

        [HttpGet("servico/{tipoServico}")]
        public async Task<ActionResult<IEnumerable<PasseadorDto>>> FilterByService(TipoServico tipoServico)
        {
            var passeadoresDto = await _context.Passeadores
                                        .Where(p => p.Servicos.Any(s => s.TipoServico == tipoServico && s.Ativo))
                                        .Select(_asPasseadorDto)
                                        .ToListAsync();
            return Ok(passeadoresDto);
        }
    }
}