using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using petgo_api.Data;
using petgo_api.DTOs.Produto;
using petgo_api.Models;

namespace petgo_api.Services.Produtos
{
    public class ProdutoService : IProdutoInterface
    {
        private readonly AppDbContext _context;

        public ProdutoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<ProdutoResponseDto>> CriarProduto(ProdutoCreateDto produtoCreate, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<ProdutoResponseDto>();

            try
            {
                var produtoExiste = await _context.Produtos.AnyAsync(p => p.Nome == produtoCreate.Nome);

                if (produtoExiste)
                {
                    response.Status = false;
                    response.Messagem = "Esse produto já existe";
                    return response;
                }

                var novoProduto = new Produto
                {
                    Id = Guid.NewGuid(),
                    Nome = produtoCreate.Nome,
                    Descricao = produtoCreate.Descricao,
                    Estoque = produtoCreate.Estoque,
                    Categoria = produtoCreate.Categoria,
                    FotoUrl = produtoCreate.FotoUrl,
                    Preco = produtoCreate.Preco,
                    DataCadastro = DateTime.UtcNow
                };

                _context.Produtos.Add(novoProduto);
                await _context.SaveChangesAsync();

                response.Dados = MapToDto(novoProduto);
                response.Messagem = "Produto criado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }
            return response;
        }

        public async Task<ApiResponse<ProdutoResponseDto>> EditarProduto(ProdutoCreateDto produtoUpdate, Guid produtoId, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<ProdutoResponseDto>();

            try
            {
                var produto = await _context.Produtos.FirstOrDefaultAsync(p => p.Id == produtoId);

                if (produto == null)
                {
                    response.Status = false;
                    response.Messagem = "Produto não encontrado.";
                    return response;
                }

                produto.Nome = produtoUpdate.Nome;
                produto.Descricao = produtoUpdate.Descricao;
                produto.Estoque = produtoUpdate.Estoque;
                produto.Preco = produtoUpdate.Preco;
                produto.FotoUrl = produtoUpdate.FotoUrl;
                produto.Categoria = produtoUpdate.Categoria;

                _context.Update(produto);
                await _context.SaveChangesAsync();

                response.Dados = MapToDto(produto);
                response.Messagem = "Produto atualizado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<bool>> ExcluirProduto(Guid produtoId, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var produto = await _context.Produtos.FirstOrDefaultAsync(p => p.Id == produtoId);

                if (produto == null)
                {
                    response.Status = false;
                    response.Messagem = "Produto não encontrado.";
                    return response;
                }

                _context.Remove(produto);
                await _context.SaveChangesAsync();

                response.Dados = true;
                response.Messagem = "Produto excluido com sucesso";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;

        }

        public async Task<ApiResponse<ProdutoResponseDto>> GetProdutoById(Guid produtoId)
        {
            var response = new ApiResponse<ProdutoResponseDto>();

            try
            {
                var produto = await _context.Produtos.FirstOrDefaultAsync(p => p.Id == produtoId);

                if (produto == null)
                {
                    response.Status = false;
                    response.Messagem = "Produto não encontrado.";
                    return response;
                }

                response.Dados = MapToDto(produto);
                response.Messagem = "Produto encotnrado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<List<ProdutoResponseDto>>> ListarProdutos()
        {
            var response = new ApiResponse<List<ProdutoResponseDto>>();

            try
            {
                var produtos = await _context.Produtos.ToListAsync();

                response.Dados = produtos.Select(p => MapToDto(p)).ToList();
                response.Messagem = "Lista de produtos carregada com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        private static ProdutoResponseDto MapToDto(Produto produto)
        {
            return new ProdutoResponseDto
            {
                Id = produto.Id,
                Nome = produto.Nome,
                Descricao = produto.Descricao,
                Preco = produto.Preco,
                Estoque = produto.Estoque,
                FotoUrl = produto.FotoUrl,
                Categoria = produto.Categoria
            };
        }
    }
}