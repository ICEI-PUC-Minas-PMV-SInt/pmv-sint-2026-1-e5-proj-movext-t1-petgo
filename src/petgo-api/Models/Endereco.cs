using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace petgo.api.Models
{
    public class Endereco
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("Usuario")]
        public int UsuarioId { get; set; }
        
        [Required]
        public required string Rua { get; set; }
        
        [Required]
        public required string Estado { get; set; }
        
        [Required]
        public required string Cep { get; set; }
        
        [Required]
        public required string Pais { get; set; }

        // Navigation property - nullable pois é carregada via EF
        public Usuario? Usuario { get; set; }
    }
}