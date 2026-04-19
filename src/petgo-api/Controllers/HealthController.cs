using Microsoft.AspNetCore.Mvc;

namespace petgo_api.Controllers
{
    [ApiController]
<<<<<<< HEAD
    [Route("health")]
=======
    [Route("api/[controller]")]
>>>>>>> cd9ba4d (PasseiosSimplesConroller adição)
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok("API funcionando");
        }
    }
}