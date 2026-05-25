using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuroraGaleria.Controllers
{
    [ApiController]
    [Authorize]
    [Route("user-actions")]
    public class UserActionsController : ControllerBase
    {
        [HttpPost("tickets")]
        public IActionResult BuyTicket()
        {
            return Ok(new { message = "Ingresso comprado com sucesso!" });
        }

        [HttpPost("appointments")]
        public IActionResult ScheduleVisit()
        {
            return Ok(new { message = "Visita agendada com sucesso!" });
        }

        [HttpPost("cart")]
        public IActionResult AddToCart([FromBody] AddToCartRequest request)
        {
            return Ok(new { message = $"{request.ProductName} adicionado ao carrinho!" });
        }
    }

    public class AddToCartRequest
    {
        public string ProductName { get; set; } = "Produto";
    }
}
