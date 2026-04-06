using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using petgo_api.Enums;


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

        protected TipoUsuario GetUsuarioLogadoTipo()
        {
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            return Enum.Parse<TipoUsuario>(userRole!);
        }
    }
}