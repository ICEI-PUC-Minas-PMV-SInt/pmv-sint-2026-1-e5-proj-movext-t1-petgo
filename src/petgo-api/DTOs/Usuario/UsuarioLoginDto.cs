using System;

namespace petgo_api.DTOs.Usuario
{
    public class UsuarioLoginDto
    {
        public string Email { get; set; }
        public string Senha { get; set; }
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public Guid UsuarioId { get; set; }
        public string UsuarioTipo { get; set; } = string.Empty;
    }
}