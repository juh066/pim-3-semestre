using System.ComponentModel.DataAnnotations;

namespace AuroraGaleria.Models
{
    public class BuyTicketRequest
    {
        [Required]
        public DateTime VisitDate { get; set; }

        [Range(1, 20)]
        public int Quantity { get; set; }

        [Required]
        [MaxLength(140)]
        public string EventName { get; set; } = string.Empty;
    }

    public class ScheduleAppointmentRequest
    {
        [Required]
        public DateTime VisitDate { get; set; }

        [Required]
        [MaxLength(140)]
        public string EventName { get; set; } = string.Empty;
    }
}
