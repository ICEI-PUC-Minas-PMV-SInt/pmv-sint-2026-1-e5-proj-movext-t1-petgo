using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace petgo.api.Models
{
    public enum TipoServico
    {
        PASSEIO,
        CUIDADO_DIARIO,
        HOSPEDAGEM,
        OUTRO
    }

    public class ServicoPasseador
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("Passeador")]
        public int PasseadorId { get; set; }
        
        [Required]
        public required string Titulo { get; set; }
        
        [Required]
        public required string Descricao { get; set; }
        
        [Required]
        public TipoServico TipoServico { get; set; }
        
        [Required]
        public bool Ativo { get; set; }
        
        // Navigation property
        public Passeador? Passeador { get; set; }
    }
}