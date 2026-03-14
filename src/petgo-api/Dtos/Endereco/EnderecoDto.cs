using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace petgo.api.Dtos.Endereco
{
    public class EnderecoDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string Rua { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string Cep { get; set; } = string.Empty;
        public string Pais { get; set; } = string.Empty;
    }
}