using System.ComponentModel.DataAnnotations;

namespace petgo.api.DTOs
{
    public class PetCreateDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(100, ErrorMessage = "Nome não pode exceder 100 caracteres.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "A descrição é obrigatória.")]
        [StringLength(500, ErrorMessage = "Descrição não pode exceder 500 caracteres.")]
        public string Descricao { get; set; } = string.Empty;

        [Range(0.00, 999999.99, ErrorMessage = "Preço deve ser maior ou igual a zero.")]
        public decimal Preco { get; set; } // Deve ser 0.00 para Adoção

        [Required(ErrorMessage = "O estoque é obrigatório.")]
        [Range(1, int.MaxValue, ErrorMessage = "O estoque deve ser no mínimo 1.")]
        public int Estoque { get; set; } = 1; // Para um pet, o estoque é 1

        [Required(ErrorMessage = "A Categoria é obrigatória.")]
        public int CategoriaId { get; set; }

        // Campos do Pet
        public string? Especie { get; set; } 
        public string? Raca { get; set; } 
        public DateTime? DataNascimento { get; set; }
        public bool Castrado { get; set; } = false;
        public bool Vacinado { get; set; } = false;
        public string? Porte { get; set; }
        public string? Saude { get; set; }
        
        // Imagens 
        public List<string>? Imagens { get; set; }
    }
}