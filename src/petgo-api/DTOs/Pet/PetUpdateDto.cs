namespace petgo_api.DTOs.Pet
{
    public class PetUpdateDto
    {
        public string Nome { get; set; }
        public int Idade { get; set; }
        public string Descricao { get; set; }
        public string FotoUrl { get; set; }
    }
}