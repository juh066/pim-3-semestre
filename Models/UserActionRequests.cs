using System.ComponentModel.DataAnnotations;

namespace AuroraGaleria.Models
{
    public class BuyTicketRequest
    {
        [Required]
        [MaxLength(100)]
        public string VisitorName { get; set; } = string.Empty;

        [Required]
        public DateTime VisitDate { get; set; }

        [Range(1, 20)]
        public int Quantity { get; set; }

        [MaxLength(140)]
        public string? EventName { get; set; }
    }

    public class ScheduleAppointmentRequest
    {
        [Required]
        [MaxLength(100)]
        public string VisitorName { get; set; } = string.Empty;

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public DateTime VisitDate { get; set; }

        [MaxLength(140)]
        public string? EventName { get; set; }
    }
}
