using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;


namespace petgo_api.Controllers
{
    [Route("[controller]")]
    public class BaseController : ControllerBase
    {
        protected Guid GetUsuarioLogadoId()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.Parse(userId!);
        }
    }
}