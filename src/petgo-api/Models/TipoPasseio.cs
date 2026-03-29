using System.ComponentModel.DataAnnotations;

namespace petgo_api.Models
{
    public class TipoPasseio
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório.")]
        [MaxLength(100, ErrorMessage = "O nome não pode exceder 100 caracteres.")]
        public string Nome { get; set; }

        public int DuracaoMinutos { get; set; }

        [Required(ErrorMessage = "O preço é obrigatório.")]
        [Range(0.01, 10000.00, ErrorMessage = "O preço deve estar entre 0.01 e 10.000,00.")]
        public decimal PrecoBase { get; set; }
    }
}