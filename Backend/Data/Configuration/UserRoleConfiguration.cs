using GYMIND.API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GYMIND.API.Data.Configuration
{
    public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
    {
        public void Configure(EntityTypeBuilder<UserRole> entity)
        {
            // Map to table
            entity.ToTable("userrole");

            // primary key
            entity.HasKey(ur => ur.UserRoleID);

            // columns
            entity.Property(ur => ur.UserRoleID).HasColumnName("userroleid");
            entity.Property(ur => ur.UserID).HasColumnName("userid");
            entity.Property(ur => ur.RoleID).HasColumnName("roleid");

            // ensure unique combination of UserID and RoleID
            entity.HasIndex(ur => new { ur.UserID, ur.RoleID }).IsUnique();


            // relationships
            entity.HasOne(ur => ur.User)
                  .WithMany(u => u.UserRole)
                  .HasForeignKey(ur => ur.UserID)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ur => ur.Role)
                  .WithMany(r => r.UserRoles)
                  .HasForeignKey(ur => ur.RoleID)
                  .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
