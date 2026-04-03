using petgo_api.Enums;

namespace petgo_api.DTOs.Pet
{
    public class PetResponseDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; }
        public string Especie { get; set; }
        public string Raca { get; set; }
        public int Idade { get; set; }
        public string Status { get; set; }
        public string Descricao { get; set; }
        public string FotoUrl { get; set; }

        public Guid UsuarioId { get; set; }
        public string NomeDono { get; set; }
        public string TipoDono { get; set; }

        public DateTime DataCadastro { get; set; }
    }
}