using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace Domain.Data;

public class WfDbContextFactory : IDesignTimeDbContextFactory<WfDbContext>
{
    public WfDbContext CreateDbContext(string[] args)
    {
        // Get the base path (Application project directory)
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "Application");
        if (!Directory.Exists(basePath))
        {
            basePath = Directory.GetCurrentDirectory();
        }

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<WfDbContext>();
        var connectionString = configuration.GetConnectionString("DbConnection");

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Connection string 'DbConnection' not found.");
        }

        optionsBuilder.UseSqlServer(connectionString);

        return new WfDbContext(optionsBuilder.Options);
    }
}
