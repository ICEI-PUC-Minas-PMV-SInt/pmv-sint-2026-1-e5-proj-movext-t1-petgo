using Microsoft.EntityFrameworkCore;
using petgo_api.Data;
using petgo_api.DTOs.Pet;
using petgo_api.Enums;
using petgo_api.Models;

namespace petgo_api.Services.Pets
{
    public class PetService : IPetInterface
    {
        private readonly AppDbContext _context;

        public PetService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<PetResponseDto>> AlterarStatusPet(Guid idPet, PetStatusUpdateDto petStatusUpdate, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<PetResponseDto>();

            try
            {
                var pet = await _context.Pets.Include(p => p.Usuario).FirstOrDefaultAsync(p => p.Id == idPet);
                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == usuarioLogadoId);

                if (pet == null || usuario == null)
                {
                    response.Status = false;
                    response.Messagem = "Dados inválidos.";
                    return response;
                }

                if (usuario.Tipo != TipoUsuario.Ong && usuario.Tipo != TipoUsuario.Admin && usuario.Tipo != TipoUsuario.Passeador)
                {
                    response.Status = false;
                    response.Messagem = "Acesso negado: Seu perfil não permite alterar o status de pets.";
                    return response;
                }

                pet.Status = petStatusUpdate.NovoStatus;
                await _context.SaveChangesAsync();

                response.Dados = MapToDto(pet);
                response.Messagem = "Status atualizado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<PetResponseDto>> CriarPet(PetCreateDto pet, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<PetResponseDto>();

            try
            {
                var usuarioExiste = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == pet.UsuarioId);

                if (usuarioExiste == null)
                {
                    response.Status = false;
                    response.Messagem = "Usuário não existe!";
                    return response;
                }

                var novoPet = new Pet
                {
                    Id = Guid.NewGuid(),
                    Nome = pet.Nome,
                    Especie = pet.Especie,
                    Raca = pet.Raca,
                    Idade = pet.Idade,
                    Status = pet.Status,
                    Descricao = pet.Descricao,
                    FotoUrl = pet.FotoUrl,
                    UsuarioId = usuarioLogadoId,
                    DataCadastro = DateTime.UtcNow
                };

                _context.Add(novoPet);
                await _context.SaveChangesAsync();

                novoPet.Usuario = usuarioExiste;
                response.Dados = MapToDto(novoPet);
                response.Messagem = "Pet cadastrado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<PetResponseDto>> EditarPet(Guid idPet, PetUpdateDto petUpdate, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<PetResponseDto>();

            try
            {
                var pet = await _context.Pets.Include(p => p.Usuario).FirstOrDefaultAsync(p => p.Id == idPet);

                if (pet == null)
                {
                    response.Status = false;
                    response.Messagem = "Pet não encontrado";
                    return response;
                }

                if (pet.UsuarioId != usuarioLogadoId)
                {
                    response.Messagem = "Você não tem permissão para editar este pet!";
                    response.Status = false;
                    return response;
                }

                pet.Nome = !string.IsNullOrWhiteSpace(petUpdate.Nome) ? petUpdate.Nome : pet.Nome;
                pet.Descricao = !string.IsNullOrWhiteSpace(petUpdate.Descricao) ? petUpdate.Descricao : pet.Descricao;
                pet.FotoUrl = !string.IsNullOrWhiteSpace(petUpdate.FotoUrl) ? petUpdate.FotoUrl : pet.FotoUrl;
                if (petUpdate.Idade > 0)
                {
                    pet.Idade = petUpdate.Idade;
                }

                _context.Update(pet);
                await _context.SaveChangesAsync();

                response.Dados = MapToDto(pet);
                response.Messagem = "Pet atualizado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;

        }

        public async Task<ApiResponse<bool>> ExcluirPet(Guid idPet, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var pet = await _context.Pets.Include(p => p.Usuario).FirstOrDefaultAsync(p => p.Id == idPet);

                if (pet == null)
                {
                    response.Status = false;
                    response.Messagem = "Pet não encontrado";
                    return response;
                }

                if (pet.UsuarioId != usuarioLogadoId)
                {
                    response.Status = false;
                    response.Messagem = "Você não tem permissão para deletar este pet!";
                    return response;
                }

                _context.Remove(pet);
                await _context.SaveChangesAsync();

                response.Dados = true;
                response.Status = true;
                response.Messagem = "Pet excluido com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<PetResponseDto>> GetPetById(Guid idPet)
        {
            var response = new ApiResponse<PetResponseDto>();

            try
            {
                var pet = await _context.Pets.Include(p => p.Usuario).FirstOrDefaultAsync(p => p.Id == idPet);

                if (pet == null)
                {
                    response.Status = false;
                    response.Messagem = "Pet não encontrado";
                    return response;
                }

                response.Dados = MapToDto(pet);
                response.Messagem = "Pet encontrado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }
            return response;
        }

        public async Task<ApiResponse<List<PetResponseDto>>> GetPetsByUsuarioId(Guid idUsuario)
        {
            var response = new ApiResponse<List<PetResponseDto>>();

            try
            {
                var pets = await _context.Pets
                                    .Include(p => p.Usuario)
                                    .Where(p => p.UsuarioId == idUsuario)
                                    .ToListAsync();
                response.Dados = pets.Select(p => MapToDto(p)).ToList();
                response.Messagem = pets.Any() ? "Seus pets foram carregados!" : "Você ainda não cadastrou nenhum pet.";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<List<PetResponseDto>>> ListarPets()
        {
            var response = new ApiResponse<List<PetResponseDto>>();

            try
            {
                var pets = await _context.Pets.Include(p => p.Usuario).ToListAsync();

                response.Dados = pets.Select(p => MapToDto(p)).ToList();
                response.Messagem = "Lista de pets recuperada com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        private static PetResponseDto MapToDto(Pet p)
        {
            return new PetResponseDto
            {
                Id = p.Id,
                Nome = p.Nome,
                Especie = p.Especie.ToString(),
                Raca = p.Raca,
                Idade = p.Idade,
                Status = p.Status.ToString(),
                Descricao = p.Descricao,
                FotoUrl = p.FotoUrl,
                UsuarioId = p.UsuarioId,
                NomeDono = p.Usuario?.Nome ?? "N/A",
                TipoDono = p.Usuario?.Tipo.ToString() ?? "N/A",
                DataCadastro = p.DataCadastro
            };
        }
    }
}