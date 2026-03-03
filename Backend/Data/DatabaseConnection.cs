using Npgsql;

namespace GYMIND.API.Data
{
    public sealed class DatabaseConnection
    {
        private readonly string _connectionString;

        public DatabaseConnection(IConfiguration configuration)
        {
            _connectionString =
                configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Database connection string not found.");
        }

        public NpgsqlConnection Create()
        {
            return new NpgsqlConnection(_connectionString);
        }
    }


}
