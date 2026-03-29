using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using petgo_api.Enums;

namespace petgo_api.Models
{
    public class Passeio
    {
        [Key]
        public Guid Id { get; set; }

        public DateTime DataHoraPasseio { get; set; }
        public decimal ValorTotal { get; set; }
        public string DescricaoPasseio { get; set; }
        public StatusPasseio Status { get; set; }

        [Required]
        public Guid TutorId { get; set; }
        [ForeignKey("TutorId")]
        public virtual Usuario Tutor { get; set; } = null!;

        [Required]
        public Guid PasseadorId { get; set; }

        [ForeignKey("PasseadorId")]
        public virtual Usuario Passeador { get; set; } = null!;

        [Required]
        public Guid PetId { get; set; }

        [ForeignKey("PetId")]
        public virtual Pet Pet { get; set; } = null!;

        [Required]
        public Guid TipoPasseioId { get; set; }

        [ForeignKey("TipoPasseioId")]
        public virtual TipoPasseio TipoPasseio { get; set; } = null!;
    }
}