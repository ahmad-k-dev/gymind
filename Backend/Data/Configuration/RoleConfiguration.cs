using GYMIND.API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GYMIND.API.Data.Configuration
{
    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> entity)
        {
            // Map to the table
            entity.ToTable("roles"); 

            // Primary key
            entity.HasKey(r => r.RoleID);

            // Columns
            entity.Property(r => r.RoleID)
                  .HasColumnName("roleid"); 
            entity.Property(r => r.Name)
                  .HasColumnName("name")
                  .HasMaxLength(50)
                  .IsRequired();
            entity.Property(r => r.Description)
                  .HasColumnName("description");

            // Relationships
            entity.HasMany(r => r.UserRoles)        
                  .WithOne(ur => ur.Role)          // each UserRole has one Role
                  .HasForeignKey(ur => ur.RoleID)
                  .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
