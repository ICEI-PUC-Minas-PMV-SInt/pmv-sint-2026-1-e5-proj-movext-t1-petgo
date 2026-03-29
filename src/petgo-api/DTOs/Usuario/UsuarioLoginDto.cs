using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace petgo_api.DTOs.Usuario
{
    public class UsuarioLoginDto
    {
        public string Email { get; set; }
        public string Senha { get; set; }
    }
}