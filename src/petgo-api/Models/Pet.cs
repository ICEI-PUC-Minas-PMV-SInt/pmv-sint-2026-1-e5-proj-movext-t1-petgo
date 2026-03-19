using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using petgo_api.Enums;

namespace petgo_api.Models
{
    public class Pet
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "O nome do pet é obrigatório")]
        [MaxLength(50)]
        public string Nome { get; set; }

        [Required]
        [Range(0, 30, ErrorMessage = "A idade deve estar entre 0 e 30 anos")]
        public int Idade { get; set; }

        [MaxLength(500)]
        public string Descricao { get; set; }

        [Required]
        public Porte Porte { get; set; }

        [Required]
        public Guid OngId { get; set; }
        public Ong Ong { get; set; } = null!;
    }
}