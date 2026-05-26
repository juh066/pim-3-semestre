using System.Security.Claims;
using AuroraGaleria.Data;
using AuroraGaleria.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuroraGaleria.Controllers
{
    [ApiController]
    [Authorize]
    [Route("user-actions")]
    public class UserActionsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UserActionsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("tickets")]
        public async Task<IActionResult> MeusIngressos()
        {
            var userId = UsuarioId();
            var today = DateTime.Today;
            var tickets = await _db.UserTickets
                .Where(ticket => ticket.UserId == userId)
                .OrderByDescending(ticket => ticket.EventDate)
                .ToListAsync();

            return Ok(tickets.Select(ticket => new
            {
                ticket.Id,
                ticket.EventName,
                Date = ticket.EventDate.ToString("yyyy-MM-dd"),
                ticket.Quantity,
                Status = ticket.EventDate.Date < today ? "past" : "available"
            }));
        }

        [HttpPost("tickets")]
        public async Task<IActionResult> ComprarIngresso(BuyTicketRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Preencha a data e a quantidade do ingresso corretamente." });
            }

            if (!ExposicaoValida(request.EventName, request.VisitDate))
            {
                return BadRequest(new { message = "Escolha uma exposição e uma data dentro do período disponível." });
            }

            var userId = UsuarioId();
            var ticket = new UserTicket
            {
                UserId = userId,
                EventName = request.EventName.Trim(),
                EventDate = request.VisitDate.Date,
                Quantity = request.Quantity,
                Status = request.VisitDate.Date < DateTime.Today ? "past" : "available",
                CreatedAt = DateTime.UtcNow
            };

            _db.UserTickets.Add(ticket);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Ingresso comprado com sucesso!" });
        }

        [HttpGet("appointments")]
        public async Task<IActionResult> MeusAgendamentos()
        {
            var userId = UsuarioId();
            var appointments = await _db.UserAppointments
                .Where(appointment => appointment.UserId == userId)
                .OrderByDescending(appointment => appointment.AppointmentDate)
                .ToListAsync();

            return Ok(appointments.Select(appointment => new
            {
                appointment.Id,
                appointment.EventName,
                Date = appointment.AppointmentDate.ToString("yyyy-MM-dd"),
                appointment.Quantity,
                appointment.Status
            }));
        }

        [HttpPost("appointments")]
        public async Task<IActionResult> AgendarVisita(ScheduleAppointmentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Preencha os dados do agendamento corretamente." });
            }

            if (!ExposicaoValida(request.EventName, request.VisitDate))
            {
                return BadRequest(new { message = "Escolha uma exposição e uma data dentro do período disponível." });
            }

            var userId = UsuarioId();
            var appointment = new UserAppointment
            {
                UserId = userId,
                EventName = request.EventName.Trim(),
                AppointmentDate = request.VisitDate.Date,
                Quantity = 1,
                Status = "Confirmado",
                CreatedAt = DateTime.UtcNow
            };

            _db.UserAppointments.Add(appointment);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Visita agendada com sucesso!" });
        }

        [HttpDelete("appointments/{id:int}")]
        public async Task<IActionResult> CancelarAgendamento(int id)
        {
            var userId = UsuarioId();
            var appointment = await _db.UserAppointments
                .SingleOrDefaultAsync(item => item.Id == id);

            if (appointment == null || appointment.UserId != userId)
            {
                return Unauthorized();
            }

            if (!string.Equals(appointment.Status, "Confirmado", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Este agendamento não pode ser cancelado.");
            }

            appointment.Status = "Cancelado";
            await _db.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("purchases")]
        public async Task<IActionResult> MinhasCompras()
        {
            var userId = UsuarioId();
            var purchases = await _db.UserPurchases
                .Where(purchase => purchase.UserId == userId)
                .OrderByDescending(purchase => purchase.CreatedAt)
                .ToListAsync();

            return Ok(purchases.Select(purchase => new
            {
                purchase.Id,
                purchase.ProductName,
                purchase.Quantity,
                purchase.TotalPrice,
                purchase.Status,
                Situation = "Confirmado • Contatando a transportadora",
                CreatedAt = purchase.CreatedAt.ToString("yyyy-MM-dd")
            }));
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> Analytics()
        {
            var vendasPorProduto = await _db.UserPurchases
                .GroupBy(purchase => purchase.ProductName)
                .Select(group => new
                {
                    Produto = group.Key,
                    Quantidade = group.Sum(purchase => purchase.Quantity),
                    Receita = group.Sum(purchase => purchase.TotalPrice)
                })
                .OrderByDescending(item => item.Quantidade)
                .ToListAsync();

            var exposicoesValidas = ExposicoesCatalogo.Todas
                .Select(exposicao => exposicao.Titulo)
                .ToList();

            var ingressosPorExposicao = await _db.UserTickets
                .Where(ticket => exposicoesValidas.Contains(ticket.EventName))
                .GroupBy(ticket => ticket.EventName)
                .Select(group => new
                {
                    Exposicao = group.Key,
                    Quantidade = group.Sum(ticket => ticket.Quantity)
                })
                .OrderByDescending(item => item.Quantidade)
                .ToListAsync();

            return Ok(new
            {
                VendasPorProduto = vendasPorProduto.Select(item => new
                {
                    item.Produto,
                    item.Quantidade,
                    item.Receita
                }),
                IngressosPorExposicao = ingressosPorExposicao.Select(item => new
                {
                    item.Exposicao,
                    item.Quantidade
                })
            });
        }

        private static bool ExposicaoValida(string eventName, DateTime visitDate)
        {
            if (string.IsNullOrWhiteSpace(eventName))
            {
                return false;
            }

            return ExposicoesCatalogo.DataValida(eventName, visitDate);
        }

        private int UsuarioId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        }
    }
}
