namespace petgo_api.DTOs.Adocao
{
    public class AdocaoResponseDto
    {
        public Guid Id { get; set; }
        public DateTime DataSolicitacao { get; set; }
        public string Status { get; set; }
        public Guid PetId { get; set; }
        public string NomePet { get; set; }
        public string FotoPetUrl { get; set; }
        public Guid AdotanteId { get; set; }
        public string NomeAdotante { get; set; }
        public string EmailAdotante { get; set; }
    }
}