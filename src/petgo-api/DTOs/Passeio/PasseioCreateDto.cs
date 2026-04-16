using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace petgo_api.DTOs.Passeio
{
    public class PasseioCreateDto
    {
        [Required(ErrorMessage = "A data e hora do passeio são obrigatórias.")]
        public DateTime DataHoraPasseio { get; set; }

        public string DescricaoPasseio { get; set; }

        [Required(ErrorMessage = "O pet deve ser selecionado.")]
        public Guid PetId { get; set; }

        [Required(ErrorMessage = "O passeador deve ser selecionado.")]
        public Guid PasseadorId { get; set; }

        [Required(ErrorMessage = "O tipo de passeio deve ser selecionado.")]
        public Guid TipoPasseioId { get; set; }
    }
}