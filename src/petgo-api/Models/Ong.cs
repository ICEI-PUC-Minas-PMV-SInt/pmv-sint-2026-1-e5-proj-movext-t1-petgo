using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace petgo_api.Models
{
    public class Ong
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "O nome da ONG é obrigatório")]
        [MaxLength(100)]
        public string NomeOng { get; set; }

        [Required(ErrorMessage = "O nome ddo responsável é obrigatório")]
        [MaxLength(100)]
        public string Responsavel { get; set; }

        [Required]
        [MaxLength(20)]
        public string Contato { get; set; }

        [Required]
        [MaxLength(50)]
        public string Cidade { get; set; }

        [Required]
        [StringLength(2, MinimumLength = 2)]
        public string Estado { get; set; }

        [Required]
        [MaxLength(20)]
        public string DocumentoResponsavel { get; set; }

        public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    }
}