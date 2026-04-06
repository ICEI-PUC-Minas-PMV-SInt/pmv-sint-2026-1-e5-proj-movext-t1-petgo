using petgo_api.Enums;

namespace petgo_api.DTOs.Usuario
{
    public class UsuarioResponseDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefone { get; set; }
        public TipoUsuario Tipo { get; set; }
        public string Documento { get; set; } = string.Empty;
        public string Endereco { get; set; }
        public DateTime DataCadastro { get; set; }
    }
}