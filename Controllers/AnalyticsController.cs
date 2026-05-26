using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuroraGaleria.Controllers
{
    [Authorize]
    [Route("analytics")]
    public class AnalyticsController : Controller
    {
        [HttpGet("")]
        public IActionResult Index()
        {
            return View();
        }
    }
}
