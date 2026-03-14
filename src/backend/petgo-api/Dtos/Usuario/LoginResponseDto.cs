using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace petgo.api.Dtos.Usuario
{
    public class LoginResponseDto
    {
        public required string Token { get; set; }
        public required UsuarioDto Usuario { get; set; }
    }
}