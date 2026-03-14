using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace petgo.api.Dtos.Passeador
{
    public class ServicoPasseadorDto
    {
        public int Id { get; set; }
        public required string Titulo { get; set; }
        public required string Descricao { get; set; }
        public int TipoServico { get; set; }
    }
}