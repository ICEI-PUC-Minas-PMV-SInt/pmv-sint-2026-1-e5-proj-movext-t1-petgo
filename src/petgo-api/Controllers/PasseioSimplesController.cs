using Microsoft.AspNetCore.Mvc;

namespace petgo_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PasseioSimplesController : ControllerBase
    {
        public class PasseioDto
        {
            public string Nome { get; set; }
            public decimal Preco { get; set; }
            public int DuracaoMinutos { get; set; }
        }

        private static List<PasseioDto> passeios = new List<PasseioDto>();

        [HttpPost]
        public IActionResult CriarPasseio([FromBody] PasseioDto passeio)
        {
            passeios.Add(passeio);
            return Ok(passeio);
        }

        [HttpGet]
        public IActionResult ListarPasseios()
        {
            return Ok(passeios);
        }
    }
}