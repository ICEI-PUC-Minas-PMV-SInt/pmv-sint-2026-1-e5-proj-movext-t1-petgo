using System.ComponentModel.DataAnnotations;
using petgo_api.Enums;

namespace petgo_api.Models
{
    public class Usuario
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório.")]
        [MaxLength(100, ErrorMessage = "O nome não pode exceder 100 caracteres.")]
        public string Nome { get; set; }

        [Required(ErrorMessage = "O telefone é obrigatório.")]
        [DataType(DataType.PhoneNumber)]
        public string Telefone { get; set; }

        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [EmailAddress(ErrorMessage = "E-mail em formato inválido.")]
        [MaxLength(150)]
        public string Email { get; set; }

        [Required(ErrorMessage = "A senha é obrigatória.")]
        [MinLength(8, ErrorMessage = "A senha deve ter no mínimo 8 caracteres.")]
        public string SenhaHash { get; set; }

        [Required]
        public TipoUsuario Tipo { get; set; }

        [Required]
        [MaxLength(20)]
        public string Documento { get; set; }

        [MaxLength(250)]
        public string Endereco { get; set; }
        public DateTime DataCadastro { get; set; }

        public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    }
}