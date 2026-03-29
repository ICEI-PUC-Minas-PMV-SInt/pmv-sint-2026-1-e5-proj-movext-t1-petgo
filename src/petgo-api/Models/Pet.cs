using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using petgo_api.Enums;

namespace petgo_api.Models
{
    public class Pet
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required(ErrorMessage = "O nome do pet é obrigatório.")]
        [MaxLength(50, ErrorMessage = "O nome não pode exceder 50 caracteres.")]
        public string Nome { get; set; } = string.Empty;

        [Required]
        public Especie Especie { get; set; }

        [MaxLength(50)]
        public string Raca { get; set; } = "Vira-lata";

        public int Idade { get; set; }

        [Required]
        public StatusPet Status { get; set; }

        [MaxLength(500)]
        public string Descricao { get; set; } = string.Empty;

        public string FotoUrl { get; set; } = string.Empty;

        [Required]
        public Guid UsuarioId { get; set; }

        [ForeignKey("UsuarioId")]
        public virtual Usuario Usuario { get; set; }

        public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
    }
}