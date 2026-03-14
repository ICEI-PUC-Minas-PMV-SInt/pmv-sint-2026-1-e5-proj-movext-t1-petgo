using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace petgo.api.Dtos.Usuario
{
    public class UsuarioCreateDto
    {
        [Required(ErrorMessage = "O nome é obrigatório"), MaxLength(100)]
        public required string Nome { get; set; }

        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        [MaxLength(150)]
        public required string Email { get; set; } 

        [Required(ErrorMessage = "A senha é obrigatória")]
        [MinLength(6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres")]
        [MaxLength(50)]
        public required string Senha { get; set; } 

        [Required(ErrorMessage = "O telefone é obrigatório"), MaxLength(20)]
        public required string Telefone { get; set; }
        
        [Required(ErrorMessage = "O tipo de usuário é obrigatório")]
        public int TipoUsuario { get; set; }
        
        public string? FotoPerfil { get; set; }

        // Campos específicos para passeadores (obrigatórios se TipoUsuario == PASSEADOR)
        [StringLength(1500, MinimumLength = 20, ErrorMessage = "A descrição deve ter entre 20 e 1500 caracteres")]
        public string? DescricaoPasseador { get; set; }

        [Range(1.00, 10000.00, ErrorMessage = "O valor deve ser entre R$1,00 e R$10.000,00")]
        public decimal? ValorCobradoPasseador { get; set; }

        // Lista de tipos de serviço oferecidos pelo passeador (0-3: PASSEIO, CUIDADO_DIARIO, HOSPEDAGEM, OUTRO)
        public List<int>? TiposServico { get; set; }
    }
}