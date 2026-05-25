using Microsoft.EntityFrameworkCore;

namespace AuroraGaleria.Data
{
    public static class DatabaseInitializer
    {
        public static bool EnsureDatabase(WebApplication app)
        {
            try
            {
                using var scope = app.Services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                db.Database.EnsureCreated();
                db.Database.ExecuteSqlRaw(
                    """
                    CREATE TABLE IF NOT EXISTS cart_items (
                        Id INTEGER NOT NULL CONSTRAINT PK_cart_items PRIMARY KEY AUTOINCREMENT,
                        UserId INTEGER NOT NULL,
                        ProductId INTEGER NOT NULL,
                        ProductName TEXT NOT NULL,
                        UnitPrice REAL NOT NULL,
                        Quantity INTEGER NOT NULL,
                        CreatedAt TEXT NOT NULL,
                        CONSTRAINT FK_cart_items_Users_UserId FOREIGN KEY (UserId) REFERENCES Users (Id) ON DELETE CASCADE
                    );
                    """);
                db.Database.ExecuteSqlRaw(
                    """
                    CREATE UNIQUE INDEX IF NOT EXISTS IX_cart_items_UserId_ProductId
                    ON cart_items (UserId, ProductId);
                    """);

                return true;
            }
            catch (Exception ex)
            {
                app.Logger.LogError(ex, "Não foi possível inicializar o banco de dados.");
                return false;
            }
        }
    }
}
