using System.ComponentModel.DataAnnotations;

namespace AuroraGaleria.Models
{
    public class AddCartItemRequest
    {
        [Range(1, int.MaxValue)]
        public int ProductId { get; set; }

        [Required]
        [MaxLength(120)]
        public string ProductName { get; set; } = string.Empty;

        [Range(0.01, 999999)]
        public decimal UnitPrice { get; set; }
    }
}
