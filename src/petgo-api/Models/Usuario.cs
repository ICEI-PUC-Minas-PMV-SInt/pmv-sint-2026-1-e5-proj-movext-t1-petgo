using System.ComponentModel.DataAnnotations;

namespace petgo.api.Models
{
    public enum TipoUsuario
    {
        CLIENTE,
        PASSEADOR,
        ADMIN
    }

    public class Usuario
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public required string Nome { get; set; }
        
        [Required, EmailAddress]
        public required string Email { get; set; }
        
        [Required]
        public required string Senha { get; set; }
        
        [Required]
        public required string Telefone { get; set; }
        
        [Required]
        public TipoUsuario Tipo { get; set; }
        
        public string? FotoPerfil { get; set; }
        
        [Required]
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
        
        public ICollection<Endereco> Enderecos { get; set; } = new List<Endereco>();
        public Passeador? Passeador { get; set; }
        public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    }
}