using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using petgo_api.Data;
using petgo_api.DTOs.Passeio;
using petgo_api.Enums;
using petgo_api.Models;

namespace petgo_api.Services.Passeios
{
    public class PasseioService : IPasseioInterface
    {
        private readonly AppDbContext _context;

        public PasseioService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<PasseioResponseDto>> AlterarStatusPasseio(Guid passeioId, StatusPasseio statusPasseio, Guid usuarioLogadoId, TipoUsuario tipoUsuario)
        {
            var response = new ApiResponse<PasseioResponseDto>();

            try
            {
                var passeio = await _context.Passeios
                                            .Include(p => p.Pet)
                                            .Include(p => p.Passeador)
                                            .Include(p => p.TipoPasseio)
                                            .FirstOrDefaultAsync(p => p.Id == passeioId);

                if (passeio == null)
                {
                    response.Status = false;
                    response.Messagem = "Passeio não encontrado.";
                    return response;
                }

                if (passeio.TutorId != usuarioLogadoId && passeio.PasseadorId != usuarioLogadoId
                    && tipoUsuario != TipoUsuario.Admin)
                {
                    response.Status = false;
                    response.Messagem = "Voçê não tem permissão para alterar esse passeio.";
                    return response;
                }

                passeio.Status = statusPasseio;

                _context.Passeios.Update(passeio);
                await _context.SaveChangesAsync();

                response.Dados = MapToDto(passeio);
                response.Messagem = $"Status do passeio atualizado para {passeio.Status}";

            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<bool>> CancelarPasseio(Guid passeioId, Guid usuarioLogadoId, TipoUsuario tipoUsuario)
        {
            var response = new ApiResponse<bool>();

            var resultado = await AlterarStatusPasseio(passeioId, StatusPasseio.Cancelado, usuarioLogadoId, tipoUsuario);

            response.Status = resultado.Status;
            response.Messagem = resultado.Messagem;
            response.Dados = resultado.Status;

            return response;
        }

        public async Task<ApiResponse<PasseioResponseDto>> CriarPasseio(PasseioCreateDto passeioCreate, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<PasseioResponseDto>();

            try
            {
                var tipo = await _context.TiposPasseios.FirstOrDefaultAsync(tp => tp.Id == passeioCreate.TipoPasseioId);

                if (tipo == null)
                {
                    response.Status = false;
                    response.Messagem = "Tipo de passeio não encontrado.";
                    return response;
                }

                var novoPasseio = new Passeio
                {
                    Id = Guid.NewGuid(),
                    PasseadorId = passeioCreate.PasseadorId,
                    DataHoraPasseio = passeioCreate.DataHoraPasseio,
                    DescricaoPasseio = passeioCreate.DescricaoPasseio,
                    PetId = passeioCreate.PetId,
                    TutorId = usuarioLogadoId,
                    TipoPasseioId = passeioCreate.TipoPasseioId,
                    ValorTotal = tipo.PrecoBase,
                    Status = StatusPasseio.Pendente
                };

                _context.Passeios.Add(novoPasseio);
                await _context.SaveChangesAsync();

                var passeioCompleto = await _context.Passeios
                                            .Include(p => p.Pet)
                                            .Include(p => p.Passeador)
                                            .Include(p => p.TipoPasseio)
                                            .FirstOrDefaultAsync(p => p.Id == novoPasseio.Id);

                response.Dados = MapToDto(passeioCompleto);
                response.Messagem = "Passeio agendado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<List<PasseioResponseDto>>> ListarPasseiosPorPasseador(Guid usuarioLogadoId)
        {
            var response = new ApiResponse<List<PasseioResponseDto>>();

            try
            {
                var passeios = await _context.Passeios
                                            .Include(p => p.Pet)
                                            .Include(p => p.Passeador)
                                            .Include(p => p.TipoPasseio)
                                            .Where(p => p.PasseadorId == usuarioLogadoId)
                                            .OrderByDescending(p => p.DataHoraPasseio)
                                            .ToListAsync();
                response.Dados = passeios.Select(p => MapToDto(p)).ToList();
                response.Messagem = "Histórico de passeios recuperado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<List<PasseioResponseDto>>> ListarPasseiosPorTutor(Guid usuarioLogadoId)
        {
            var response = new ApiResponse<List<PasseioResponseDto>>();

            try
            {
                var passeios = await _context.Passeios
                                            .Include(p => p.Pet)
                                            .Include(p => p.Passeador)
                                            .Include(p => p.TipoPasseio)
                                            .Where(p => p.TutorId == usuarioLogadoId)
                                            .OrderByDescending(p => p.DataHoraPasseio)
                                            .ToListAsync();
                response.Dados = passeios.Select(p => MapToDto(p)).ToList();
                response.Messagem = "Histórico de passeios recuperado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }
        public async Task<ApiResponse<PasseioResponseDto>> GetPasseioById(Guid passeioId, Guid usuarioLogadoId, TipoUsuario tipoUsuario)
        {
            var response = new ApiResponse<PasseioResponseDto>();

            try
            {
                var passeio = await _context.Passeios
                                            .Include(p => p.Pet)
                                            .Include(p => p.Passeador)
                                            .Include(p => p.TipoPasseio)
                                            .FirstOrDefaultAsync(p => p.Id == passeioId);

                if (passeio == null)
                {
                    response.Status = false;
                    response.Messagem = "Passeio não encontrado.";
                    return response;
                }

                if (passeio.TutorId != usuarioLogadoId &&
                    passeio.PasseadorId != usuarioLogadoId &&
                    tipoUsuario != TipoUsuario.Admin)
                {
                    response.Status = false;
                    response.Messagem = "Sem permissão.";
                    return response;
                }

                response.Dados = MapToDto(passeio);
                response.Messagem = "Passeio encontrado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        private static PasseioResponseDto MapToDto(Passeio passeio)
        {
            return new PasseioResponseDto
            {
                Id = passeio.Id,
                DataHoraPasseio = passeio.DataHoraPasseio,
                Status = passeio.Status.ToString(),
                ValorTotal = passeio.ValorTotal,
                DescricaoPasseio = passeio.DescricaoPasseio,
                NomePasseador = passeio.Passeador?.Nome ?? "N/A",
                NomePet = passeio.Pet?.Nome ?? "N/A",
                TutorId = passeio.TutorId,
                NomeTipoPasseio = passeio.TipoPasseio?.Nome ?? "N/A",
                FotoPasseadorUrl = passeio.Passeador?.FotoUrl,
                FotoPetUrl = passeio.Pet?.FotoUrl
            };
        }

    }
}