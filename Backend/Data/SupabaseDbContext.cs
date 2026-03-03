
using Microsoft.EntityFrameworkCore;
using GYMIND.API.Entities;
using System.Text.Json;

namespace GYMIND.API.Data
{

    public class SupabaseDbContext : DbContext
    {
        public SupabaseDbContext(DbContextOptions<SupabaseDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; } = null!;

        public DbSet<UserRole> UserRole { get; set; } = null!;
        public DbSet<UserNotification> UserNotifications { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<Announcement> Announcements { get; set; } = null!;
        public DbSet<Gym> Gym { get; set; } = null!;
        public DbSet<GymBranch> GymBranches { get; set; } = null!;
        public DbSet<Membership> Memberships { get; set; } = null!;
        public DbSet<Location> Locations { get; set; } = null!;
        public DbSet<TrafficTrack> TrafficTracks { get; set; } = null!;
        public DbSet<SystemAdminAction> SystemAdminActions { get; set; } = null!;
        public DbSet<GymAdminAction> GymAdminActions { get; set; } = null!;
        public DbSet<GymSession> GymSessions { get; set; } = null!;
        public DbSet<MembershipPlan> MembershipPlans { get; set; } = null!;


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.HasPostgresExtension("uuid-ossp");

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(SupabaseDbContext).Assembly);

        }
    }
}
