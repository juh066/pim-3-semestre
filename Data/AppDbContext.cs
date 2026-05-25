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
    }
}