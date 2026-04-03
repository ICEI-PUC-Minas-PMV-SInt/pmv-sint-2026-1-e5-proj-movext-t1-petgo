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
                    Email = usuario.Email,
                    Documento = usuario.Documento,
                    Endereco = usuario.Endereco,
                    Tipo = usuario.Tipo,
                    DataCadastro = DateTime.Now,
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword(usuario.Senha)
                };

                _context.Usuarios.Add(novoUsuario);
                await _context.SaveChangesAsync();

                response.Dados = new UsuarioResponseDto
                {
                    Id = novoUsuario.Id,
                    Nome = novoUsuario.Nome,
                    Email = novoUsuario.Email,
                    Tipo = novoUsuario.Tipo,
                    DataCadastro = novoUsuario.DataCadastro
                };

                response.Messagem = "Usuário cadastrado com sucesso";
            }
            catch (Exception ex)
            {

                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }
        public async Task<ApiResponse<UsuarioResponseDto>> EditarUsuario(Guid idUsuario, UsuarioUpdateDto usuarioUpdate)
        {
            var response = new ApiResponse<UsuarioResponseDto>();

            try
            {
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

                _context.Update(usuario);
                await _context.SaveChangesAsync();

                response.Dados = new UsuarioResponseDto
                {
                    Id = usuario.Id,
                    Nome = usuario.Nome,
                    Email = usuario.Email,
                    Tipo = usuario.Tipo,
                    Documento = usuario.Documento,
                    Endereco = usuario.Endereco,
                    DataCadastro = usuario.DataCadastro
                };

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

                response.Dados = new UsuarioResponseDto
                {
                    Id = usuario.Id,
                    Nome = usuario.Nome,
                    Email = usuario.Email,
                    Tipo = usuario.Tipo,
                    DataCadastro = usuario.DataCadastro,
                    Documento = usuario.Documento,
                    Endereco = usuario.Endereco
                };

                response.Messagem = "Usuário encontrado com sucesso!";

            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Messagem = ex.Message;
            }

            return response;
        }

        public Task<ApiResponse<Usuario>> GetUsuarioByPetId(Guid PetId)
        {
            throw new NotImplementedException();
        }

        public async Task<ApiResponse<List<UsuarioResponseDto>>> ListarUsuarios()
        {
            var response = new ApiResponse<List<UsuarioResponseDto>>();
            try
            {
                var usuarios = await _context.Usuarios.ToListAsync();

                var usuarioDto = usuarios.Select(u => new UsuarioResponseDto
                {
                    Id = u.Id,
                    Nome = u.Nome,
                    Email = u.Email,
                    Tipo = u.Tipo,
                    Documento = u.Documento,
                    Endereco = u.Endereco,
                    DataCadastro = u.DataCadastro
                }).ToList();

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

        public async Task<ApiResponse<string>> Login(UsuarioLoginDto usuarioLogin)
        {
            var response = new ApiResponse<string>();
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

                response.Dados = token;
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
    }
}