using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using petgo_api.Enums;

namespace petgo_api.Models
{
    public class Adocao
    {
        [Key]
        public Guid Id { get; set; }

        public DateTime DataSolicitacao { get; set; }

        public StatusAdocao Status { get; set; }

        [Required]
        public Guid PetId { get; set; }

        [ForeignKey("PetId")]
        public virtual Pet Pet { get; set; } = null!;

        [Required]
        public Guid AdotanteId { get; set; }

        [ForeignKey("AdotanteId")]
        public virtual Usuario Adotante { get; set; } = null!;
    }
}