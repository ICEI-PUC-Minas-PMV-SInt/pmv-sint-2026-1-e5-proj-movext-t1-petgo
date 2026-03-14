using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace petgo.api.Dtos.Passeador
{
    public class PasseadorDto
    {
        // Dados do Passeador
        public int UsuarioId { get; set; }
        public  string Descricao { get; set; } = string.Empty;
        public decimal ValorCobrado { get; set; }
        public double AvaliacaoMedia { get; set; }
        public int QuantidadeAvaliacoes { get; set; }

        // Dados do Usuário 
        public string Nome { get; set; } = string.Empty;
        public string FotoPerfil { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;


        public List<ServicoPasseadorDto> Servicos { get; set; } = new List<ServicoPasseadorDto>();
    }
}