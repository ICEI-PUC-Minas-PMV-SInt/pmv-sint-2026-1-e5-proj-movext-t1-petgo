using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using petgo_api.Data;
using petgo_api.DTOs.Usuario;
using petgo_api.Models;

namespace petgo_api.Services.Usuarios
{
    public class UsuarioService : IUsuarioInterface
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public UsuarioService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        public async Task<ApiResponse<UsuarioResponseDto>> CriarUsuario(UsuarioCreateDto usuario)
        {
            var response = new ApiResponse<UsuarioResponseDto>();
            try
            {
                var usuarioExiste = await _context.Usuarios
                                            .AnyAsync(u => u.Email == usuario.Email);

                if (usuarioExiste)
                {
                    response.Status = false;
                    response.Messagem = "E-mail já existe";
                    return response;
                }

                var novoUsuario = new Usuario
                {
                    Id = Guid.NewGuid(),
                    Nome = usuario.Nome,
                    Telefone = usuario.Telefone,
                    Email = usuario.Email,
                    Documento = usuario.Documento,
                    Endereco = usuario.Endereco,
                    Tipo = usuario.Tipo,
                    DataCadastro = DateTime.Now,
                    FotoUrl = usuario.FotoUrl,
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword(usuario.Senha)
                };

                _context.Usuarios.Add(novoUsuario);
                await _context.SaveChangesAsync();

                response.Dados = MapToDto(novoUsuario);

                response.Messagem = "Usuário cadastrado com sucesso";
            }
            catch (Exception ex)
            {

                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }
        public async Task<ApiResponse<UsuarioResponseDto>> EditarUsuario(Guid idUsuario, UsuarioUpdateDto usuarioUpdate, Guid usuarioLogadoId)
        {
            var response = new ApiResponse<UsuarioResponseDto>();

            try
            {
                if (idUsuario != usuarioLogadoId)
                {
                    response.Status = false;
                    response.Messagem = "Você não tem permissão para editar outro usuário!";
                    return response;
                }

                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == idUsuario);

                if (usuario == null)
                {
                    response.Status = false;
                    response.Messagem = "Usuário não encontrado!";
                    return response;
                }

                usuario.Nome = usuarioUpdate.Nome;
                usuario.Email = usuarioUpdate.Email;
                usuario.Endereco = usuarioUpdate.Endereco;
                usuario.Telefone = usuarioUpdate.Telefone;
                usuario.FotoUrl = usuarioUpdate.FotoUrl;

                _context.Update(usuario);
                await _context.SaveChangesAsync();

                response.Dados = MapToDto(usuario);

                response.Messagem = "Usuário editado com sucesso!";
            }
            catch (Exception ex)
            {

                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<bool>> ExcluirUsuario(Guid idUsuario)
        {
            var response = new ApiResponse<bool>();

            try
            {
                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == idUsuario);

                if (usuario == null)
                {
                    response.Status = false;
                    response.Messagem = " Usuário não encontrado!";
                    return response;
                }

                _context.Usuarios.Remove(usuario);
                await _context.SaveChangesAsync();

                response.Status = true;
                response.Dados = true;
                response.Messagem = "Usuário removido com sucesso!";
            }

            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<UsuarioResponseDto>> GetUsuarioById(Guid idUsuario)
        {
            var response = new ApiResponse<UsuarioResponseDto>();
            try
            {
                var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == idUsuario);

                if (usuario == null)
                {
                    response.Status = false;
                    response.Messagem = "Usuário não encontrado";
                    return response;
                }

                response.Dados = MapToDto(usuario);

                response.Messagem = "Usuário encontrado com sucesso!";

            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public async Task<ApiResponse<UsuarioResponseDto>> GetUsuarioByPetId(Guid petId)
        {
            var response = new ApiResponse<UsuarioResponseDto>();

            try
            {
                var usuario = await _context.Usuarios
                                .Include(u => u.Pets)
                                .FirstOrDefaultAsync(u => u.Pets.Any(p => p.Id == petId));

                if (usuario == null)
                {
                    response.Status = false;
                    response.Messagem = "Usuário não encontrado para esse pet.";
                    return response;
                }

                response.Dados = MapToDto(usuario);

                response.Status = true;
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }
            return response;
        }

        public async Task<ApiResponse<List<UsuarioResponseDto>>> ListarUsuarios()
        {
            var response = new ApiResponse<List<UsuarioResponseDto>>();
            try
            {
                var usuarios = await _context.Usuarios.ToListAsync();

                var usuarioDto = usuarios.Select(u => MapToDto(u)).ToList();

                response.Dados = usuarioDto;
                response.Messagem = "Lista de usuários recuperada com sucesso!";


            }
            catch (Exception ex)
            {
                response.Messagem = ex.Message;
                response.Status = false;
            }
            return response;
        }

        public async Task<ApiResponse<LoginResponseDto>> Login(UsuarioLoginDto usuarioLogin)
        {
            var response = new ApiResponse<LoginResponseDto>();
            try
            {
                var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == usuarioLogin.Email);

                if (usuario == null)
                {
                    response.Status = false;
                    response.Messagem = "E-mail ou senha incorretos";
                    return response;
                }

                bool senhaCorreta = BCrypt.Net.BCrypt.Verify(usuarioLogin.Senha, usuario.SenhaHash);

                if (!senhaCorreta)
                {
                    response.Status = false;
                    response.Messagem = "E-mail ou senha incorretos";
                    return response;
                }
                ;

                string token = CriarToken(usuario);

                response.Dados = new LoginResponseDto
                {
                    Token = token,
                    UsuarioId = usuario.Id,
                    UsuarioTipo = usuario.Tipo.ToString()
                };
                response.Messagem = "Usuário logado com sucesso!";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        private string CriarToken(Usuario usuario)
        {
            List<Claim> claims = new List<Claim>
    {
        new Claim(ClaimTypes.Name, usuario.Nome),
        new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
        new Claim(ClaimTypes.Role, usuario.Tipo.ToString()),
        new Claim(ClaimTypes.Email, usuario.Email)
    };

            var chaveString = _configuration.GetSection("AppSettings:Token").Value;
            if (string.IsNullOrEmpty(chaveString)) throw new Exception("Chave JWT não configurada!");

            var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(chaveString));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        private static UsuarioResponseDto MapToDto(Usuario usuario)
        {
            return new UsuarioResponseDto
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Telefone = usuario.Telefone,
                Tipo = usuario.Tipo,
                Documento = usuario.Documento,
                Endereco = usuario.Endereco,
                DataCadastro = usuario.DataCadastro,
                FotoUrl = usuario.FotoUrl
            };
        }
    }
}