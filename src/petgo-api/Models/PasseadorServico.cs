using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace petgo_api.Models
{
    public class PasseadorServico
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid PasseadorId { get; set; }
        [ForeignKey("PasseadorId")]
        public virtual Usuario Passeador { get; set; } = null!;

        [Required]
        public Guid TipoPasseioId { get; set; }
        [ForeignKey("TipoPasseioId")]
        public virtual TipoPasseio TipoPasseio { get; set; } = null!;

        [Required]
        [Range(0.01, 10000.00)]
        public decimal PrecoCustomizado { get; set; }
    }
}
