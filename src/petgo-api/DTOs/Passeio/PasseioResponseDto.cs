using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace petgo_api.DTOs.Passeio
{
    public class PasseioResponseDto
    {
        public Guid Id { get; set; }
        public DateTime DataHoraPasseio { get; set; }
        public decimal ValorTotal { get; set; }
        public string DescricaoPasseio { get; set; }
        public string Status { get; set; }
        public Guid TutorId { get; set; }
        public string NomePet { get; set; }
        public string NomePasseador { get; set; }
        public string NomeTipoPasseio { get; set; }
        public string FotoPetUrl { get; set; }
        public string FotoPasseadorUrl { get; set; }
    }
}