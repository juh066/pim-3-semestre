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
    [Route("cart")]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _db;

        public CartController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserId();
            var items = await _db.CartItems
                .Where(item => item.UserId == userId)
                .OrderBy(item => item.CreatedAt)
                .ToListAsync();

            return Ok(ToCartResponse(items));
        }

        [HttpPost("items")]
        public async Task<IActionResult> AddItem(AddCartItemRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Produto inválido para o carrinho." });
            }

            var userId = GetUserId();
            var item = await _db.CartItems
                .SingleOrDefaultAsync(cartItem => cartItem.UserId == userId && cartItem.ProductId == request.ProductId);

            if (item is null)
            {
                item = new CartItem
                {
                    UserId = userId,
                    ProductId = request.ProductId,
                    ProductName = request.ProductName.Trim(),
                    UnitPrice = request.UnitPrice,
                    Quantity = 1,
                    CreatedAt = DateTime.UtcNow
                };

                _db.CartItems.Add(item);
            }
            else
            {
                item.Quantity += 1;
                item.ProductName = request.ProductName.Trim();
                item.UnitPrice = request.UnitPrice;
            }

            await _db.SaveChangesAsync();

            var items = await _db.CartItems
                .Where(cartItem => cartItem.UserId == userId)
                .OrderBy(cartItem => cartItem.CreatedAt)
                .ToListAsync();

            return Ok(ToCartResponse(items));
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout()
        {
            var userId = GetUserId();
            var items = await _db.CartItems
                .Where(item => item.UserId == userId)
                .ToListAsync();

            if (items.Count == 0)
            {
                return BadRequest(new { message = "Seu carrinho está vazio." });
            }

            _db.CartItems.RemoveRange(items);
            await _db.SaveChangesAsync();

            return Ok(ToCartResponse(Array.Empty<CartItem>()));
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        }

        private static object ToCartResponse(IReadOnlyCollection<CartItem> items)
        {
            return new
            {
                items = items.Select(item => new
                {
                    id = item.Id,
                    productId = item.ProductId,
                    productName = item.ProductName,
                    unitPrice = item.UnitPrice,
                    quantity = item.Quantity,
                    subtotal = item.UnitPrice * item.Quantity
                }),
                count = items.Sum(item => item.Quantity),
                total = items.Sum(item => item.UnitPrice * item.Quantity)
            };
        }
    }
}
