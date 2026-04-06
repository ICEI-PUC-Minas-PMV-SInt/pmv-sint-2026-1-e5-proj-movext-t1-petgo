using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace petgo_api.DTOs.Usuario
{
    public class UsuarioUpdateDto
    {
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Endereco { get; set; }
        public string Telefone { get; set; }
    }
}