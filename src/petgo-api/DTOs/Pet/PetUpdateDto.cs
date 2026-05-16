using petgo_api.Enums;

namespace petgo_api.DTOs.Pet
{
    public class PetUpdateDto
    {
        public string Nome { get; set; }
        public int Idade { get; set; }
        public string Descricao { get; set; }
        public string FotoUrl { get; set; }
        public Sexo Sexo { get; set; }
        public Porte Porte { get; set; }
        public string Saude { get; set; }
        public string Status { get; set; }
    }
}