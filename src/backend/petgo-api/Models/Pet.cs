using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace petgo.api.Models
{
    public enum EspeciePet
    {
        CACHORRO = 0,
        GATO = 1,
        OUTRO = 2
    }

    public enum PortePet
    {
        PEQUENO = 0,
        MEDIO = 1,
        GRANDE = 2
    }

    public class Pet
    {
        [Key]
        public int Id { get; set; }

        // Foreign Key para Usuario (dono do pet)
        [ForeignKey("Usuario")]
        public int UsuarioId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        public EspeciePet Especie { get; set; }

        [Required]
        [MaxLength(50)]
        public string Raca { get; set; } = string.Empty;

        [Required]
        public int idadeMeses { get; set; }

        [Required]
        public PortePet Porte { get; set; }

        [Required]
        [MaxLength(100)]
        public string Cidade { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Estado { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Observacoes { get; set; }

        // Fotos em JSON (compatível com DbContext)
        [Column(TypeName = "jsonb")]
        public string FotosJson { get; set; } = "[]";

        [NotMapped]
        public List<string> Fotos
        {
            get => string.IsNullOrEmpty(FotosJson) 
                ? new List<string>() 
                : System.Text.Json.JsonSerializer.Deserialize<List<string>>(FotosJson) ?? new List<string>();
            set => FotosJson = System.Text.Json.JsonSerializer.Serialize(value);
        }

        // Navigation Properties
        public Usuario? Usuario { get; set; }
        public AnuncioDoacao? AnuncioDoacao { get; set; }
    }
}