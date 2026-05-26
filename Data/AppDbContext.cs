using Microsoft.EntityFrameworkCore;
using AuroraGaleria.Models;

namespace AuroraGaleria.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Exposicao> Exposicoes { get; set; }
        public DbSet<Produto> Produtos { get; set; }
        public DbSet<Ingresso> Ingressos { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<UserTicket> UserTickets { get; set; }
        public DbSet<UserAppointment> UserAppointments { get; set; }
        public DbSet<UserPurchase> UserPurchases { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasIndex(user => user.Email).IsUnique();
                entity.HasIndex(user => user.Cpf).IsUnique();
                entity.Property(user => user.Name).HasMaxLength(100).IsRequired();
                entity.Property(user => user.Cpf).HasMaxLength(11).IsRequired();
                entity.Property(user => user.Email).HasMaxLength(256).IsRequired();
                entity.Property(user => user.PasswordHash).HasMaxLength(200).IsRequired();
            });

            modelBuilder.Entity<CartItem>(entity =>
            {
                entity.ToTable("cart_items");
                entity.HasIndex(item => new { item.UserId, item.ProductId }).IsUnique();
                entity.Property(item => item.ProductName).HasMaxLength(120).IsRequired();
                entity.Property(item => item.UnitPrice).HasConversion<double>();
                entity.Property(item => item.Quantity).IsRequired();
                entity.Property(item => item.CreatedAt).IsRequired();
                entity.HasOne(item => item.User)
                    .WithMany()
                    .HasForeignKey(item => item.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserTicket>(entity =>
            {
                entity.ToTable("user_tickets");
                entity.Property(ticket => ticket.EventName).HasMaxLength(140).IsRequired();
                entity.Property(ticket => ticket.Status).HasMaxLength(20).IsRequired();
                entity.HasOne(ticket => ticket.User)
                    .WithMany()
                    .HasForeignKey(ticket => ticket.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserAppointment>(entity =>
            {
                entity.ToTable("user_appointments");
                entity.Property(appointment => appointment.EventName).HasMaxLength(140).IsRequired();
                entity.Property(appointment => appointment.Status).HasMaxLength(20).IsRequired();
                entity.HasOne(appointment => appointment.User)
                    .WithMany()
                    .HasForeignKey(appointment => appointment.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<UserPurchase>(entity =>
            {
                entity.ToTable("user_purchases");
                entity.Property(purchase => purchase.ProductName).HasMaxLength(120).IsRequired();
                entity.Property(purchase => purchase.TotalPrice).HasConversion<double>();
                entity.Property(purchase => purchase.Status).HasMaxLength(40).IsRequired();
                entity.HasOne(purchase => purchase.User)
                    .WithMany()
                    .HasForeignKey(purchase => purchase.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
