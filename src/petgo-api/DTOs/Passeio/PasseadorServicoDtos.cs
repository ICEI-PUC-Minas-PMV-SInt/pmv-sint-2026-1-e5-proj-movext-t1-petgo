using System;

namespace petgo_api.DTOs.Passeio
{
    public class PasseadorServicoResponseDto
    {
        public Guid Id { get; set; }
        public Guid PasseadorId { get; set; }
        public Guid TipoPasseioId { get; set; }
        public string NomeTipoPasseio { get; set; }
        public int DuracaoMinutos { get; set; }
        public decimal PrecoCustomizado { get; set; }
    }

    public class PasseadorServicoCreateDto
    {
        public Guid TipoPasseioId { get; set; }
        public decimal PrecoCustomizado { get; set; }
    }
}
