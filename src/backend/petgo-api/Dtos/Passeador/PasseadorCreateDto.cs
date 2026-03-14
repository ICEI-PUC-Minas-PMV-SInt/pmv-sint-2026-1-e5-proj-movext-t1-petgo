using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace petgo.api.Dtos.Passeador
{
    public class PasseadorCreateDto
    {
        [Required(ErrorMessage = "O ID do usuário é obrigatório")]
        public int UsuarioId { get; set; }

        [Required(ErrorMessage = "A descrição é obrigatória")]
        [StringLength(1500, MinimumLength = 20, ErrorMessage = "A descrição deve ter entre 20 e 1500 caracteres")]
        public required string Descricao { get; set; }

        [Required(ErrorMessage = "O valor cobrado é obrigatório")]
        [Range(1.00, 10000.00, ErrorMessage = "O valor deve ser entre R$1,00 e R$10.000,00")]
        public decimal ValorCobrado { get; set; }
    }
}