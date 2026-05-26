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
                db.Database.ExecuteSqlRaw(
                    """
                    CREATE TABLE IF NOT EXISTS user_tickets (
                        Id INTEGER NOT NULL CONSTRAINT PK_user_tickets PRIMARY KEY AUTOINCREMENT,
                        UserId INTEGER NOT NULL,
                        EventName TEXT NOT NULL,
                        EventDate TEXT NOT NULL,
                        Quantity INTEGER NOT NULL,
                        Status TEXT NOT NULL,
                        CreatedAt TEXT NOT NULL,
                        CONSTRAINT FK_user_tickets_Users_UserId FOREIGN KEY (UserId) REFERENCES Users (Id) ON DELETE CASCADE
                    );
                    """);
                db.Database.ExecuteSqlRaw(
                    """
                    CREATE INDEX IF NOT EXISTS IX_user_tickets_UserId
                    ON user_tickets (UserId);
                    """);
                db.Database.ExecuteSqlRaw(
                    """
                    CREATE TABLE IF NOT EXISTS user_appointments (
                        Id INTEGER NOT NULL CONSTRAINT PK_user_appointments PRIMARY KEY AUTOINCREMENT,
                        UserId INTEGER NOT NULL,
                        EventName TEXT NOT NULL,
                        AppointmentDate TEXT NOT NULL,
                        Quantity INTEGER NOT NULL,
                        Status TEXT NOT NULL,
                        CreatedAt TEXT NOT NULL,
                        CONSTRAINT FK_user_appointments_Users_UserId FOREIGN KEY (UserId) REFERENCES Users (Id) ON DELETE CASCADE
                    );
                    """);
                db.Database.ExecuteSqlRaw(
                    """
                    CREATE INDEX IF NOT EXISTS IX_user_appointments_UserId
                    ON user_appointments (UserId);
                    """);
                db.Database.ExecuteSqlRaw(
                    """
                    CREATE TABLE IF NOT EXISTS user_purchases (
                        Id INTEGER NOT NULL CONSTRAINT PK_user_purchases PRIMARY KEY AUTOINCREMENT,
                        UserId INTEGER NOT NULL,
                        ProductName TEXT NOT NULL,
                        Quantity INTEGER NOT NULL,
                        TotalPrice REAL NOT NULL,
                        Status TEXT NOT NULL,
                        CreatedAt TEXT NOT NULL,
                        CONSTRAINT FK_user_purchases_Users_UserId FOREIGN KEY (UserId) REFERENCES Users (Id) ON DELETE CASCADE
                    );
                    """);
                db.Database.ExecuteSqlRaw(
                    """
                    CREATE INDEX IF NOT EXISTS IX_user_purchases_UserId
                    ON user_purchases (UserId);
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
