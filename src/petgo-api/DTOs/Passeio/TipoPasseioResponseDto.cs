using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace petgo_api.DTOs.Passeio
{
    public class TipoPasseioResponseDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; }
        public int DuracaoMinutos { get; set; }
        public decimal PrecoBase { get; set; }
    }
}