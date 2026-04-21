using System.ComponentModel.DataAnnotations;

namespace petgo_api.DTOs.Passeio
{
    public class TipoPasseioCreateDto
    {
        [Required(ErrorMessage = "O nome do tipo de passeio é obrigatório.")]
        [StringLength(100)]
        public string Nome { get; set; }

        [Range(1, 480, ErrorMessage = "A duração deve ser entre 1 e 480 minutos.")]
        public int DuracaoMinutos { get; set; }

        [Required]
        [Range(0.01, 10000)]
        public decimal PrecoBase { get; set; }
    }
}