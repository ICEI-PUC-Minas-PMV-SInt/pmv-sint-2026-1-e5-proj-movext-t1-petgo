using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using petgo_api.Enums;

namespace petgo_api.DTOs.Usuario
{
    public class UsuarioCreateDto
    {
        [Required(ErrorMessage = "O nome é obrigatório!")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O e-mail é obrigatório!")]
        [EmailAddress(ErrorMessage = "E-mail inválido!")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "O telefone é obrigatório.")]
        [DataType(DataType.PhoneNumber)]
        public string Telefone { get; set; }

        [Required(ErrorMessage = "A senha é obrigatória!")]
        [MinLength(8, ErrorMessage = "A senha deve ter no mínimo 8 caracteres!")]
        public string Senha { get; set; } = string.Empty;

        [Required(ErrorMessage = "O documento é obrigatório!")]
        public string Documento { get; set; } = string.Empty;

        public string Endereco { get; set; }

        [Required(ErrorMessage = "O tipo de usuário é obrigatório!")]
        public TipoUsuario Tipo { get; set; }

        public string FotoUrl { get; set; }
    }
}