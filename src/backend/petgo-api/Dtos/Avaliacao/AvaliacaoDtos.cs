using System.ComponentModel.DataAnnotations;
using petgo.api.Models;

namespace petgo.api.Dtos.Avaliacao
{
    public class AvaliacaoDto
    {
        public int Id { get; set; }
        public AlvoTipo AlvoTipo { get; set; }
        public int AlvoId { get; set; }
        public int Nota { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Comentario { get; set; } = string.Empty;
        public string? AutorNome { get; set; }
        public DateTime DataCriacao { get; set; }
    }

    public class AvaliacaoCreateDto
    {
        [Required(ErrorMessage = "O tipo de alvo é obrigatório")]
        public AlvoTipo AlvoTipo { get; set; }

        [Required(ErrorMessage = "O ID do alvo é obrigatório")]
        public int AlvoId { get; set; }

        [Required(ErrorMessage = "A nota é obrigatória")]
        [Range(1, 5, ErrorMessage = "A nota deve ser entre 1 e 5")]
        public int Nota { get; set; }

        [Required(ErrorMessage = "O título é obrigatório")]
        [StringLength(100, ErrorMessage = "O título deve ter no máximo 100 caracteres")]
        public string Titulo { get; set; } = string.Empty;

        [Required(ErrorMessage = "O comentário é obrigatório")]
        [StringLength(500, ErrorMessage = "O comentário deve ter no máximo 500 caracteres")]
        public string Comentario { get; set; } = string.Empty;

        public string? AutorNome { get; set; }
    }

    public class AvaliacaoUpdateDto
    {
        [Range(1, 5, ErrorMessage = "A nota deve ser entre 1 e 5")]
        public int? Nota { get; set; }

        [StringLength(100, ErrorMessage = "O título deve ter no máximo 100 caracteres")]
        public string? Titulo { get; set; }

        [StringLength(500, ErrorMessage = "O comentário deve ter no máximo 500 caracteres")]
        public string? Comentario { get; set; }
    }
}
