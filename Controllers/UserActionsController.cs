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
        public async Task<IActionResult> GetTickets()
        {
            var userId = GetUserId();
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
        public async Task<IActionResult> BuyTicket(BuyTicketRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Preencha a data e a quantidade do ingresso corretamente." });
            }

            var userId = GetUserId();
            var ticket = new UserTicket
            {
                UserId = userId,
                EventName = string.IsNullOrWhiteSpace(request.EventName) ? "Galeria Aurora" : request.EventName.Trim(),
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
        public async Task<IActionResult> GetAppointments()
        {
            var userId = GetUserId();
            var today = DateTime.Today;
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
                Status = appointment.AppointmentDate.Date < today ? "past" : "available"
            }));
        }

        [HttpPost("appointments")]
        public async Task<IActionResult> ScheduleVisit(ScheduleAppointmentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Preencha os dados do agendamento corretamente." });
            }

            var userId = GetUserId();
            var appointment = new UserAppointment
            {
                UserId = userId,
                EventName = string.IsNullOrWhiteSpace(request.EventName) ? "Visita à Galeria Aurora" : request.EventName.Trim(),
                AppointmentDate = request.VisitDate.Date,
                Quantity = 1,
                Status = request.VisitDate.Date < DateTime.Today ? "past" : "available",
                CreatedAt = DateTime.UtcNow
            };

            _db.UserAppointments.Add(appointment);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Visita agendada com sucesso!" });
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        }
    }
}
