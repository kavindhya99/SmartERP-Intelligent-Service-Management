using Microsoft.EntityFrameworkCore;
using SmartERP.API.Models;

namespace SmartERP.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(
        DbContextOptions<AppDbContext> options
    ) : base(options)
    {
    }

    public DbSet<Technician> Technicians { get; set; }
    public DbSet<WorkOrder> WorkOrders { get; set; }
}