using GYMIND.API.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GYMIND.API.Data.Configuration
{
    public class GymConfiguration : IEntityTypeConfiguration<Entities.Gym>
    {
        public void Configure(EntityTypeBuilder<Gym> entity)
        {
            entity.ToTable("gym");

            entity.HasKey(g => g.GymID);

            entity.Property(g => g.GymID)
                  .HasColumnName("gymid");

            entity.Property(g => g.Name)
                  .HasMaxLength(255)
                  .IsRequired()
                  .HasColumnName("name");

            entity.Property(g => g.Description)
                  .HasMaxLength(1000)
                  .HasColumnName("description")
                  .IsRequired(false); 

            entity.Property(g => g.IsApproved)
                  .HasColumnName("isapproved")
                  .HasDefaultValue(false);

            entity.Property(g => g.CreatedAt)
                  .HasColumnName("createdat")
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");

            
        }
    }

    public class GymBranchConfiguration : IEntityTypeConfiguration<Entities.GymBranch>
    {
        public void Configure(EntityTypeBuilder<Entities.GymBranch> entity)
        {
            entity.ToTable("gymbranch");
            entity.HasKey(gb => gb.GymBranchID);

            // Mapping JsonDocument for OperatingHours
            entity.Property(gb => gb.OpeningHours).HasColumnType("jsonb").HasColumnName("openinghours");
            entity.Property(gb => gb.GymBranchID).HasColumnName("gymbranchid");
            entity.Property(gb => gb.GymID).HasColumnName("gymid");
            entity.Property(gb => gb.LocationID).HasColumnName("locationid").IsRequired(false);
            entity.Property(gb => gb.Name).HasMaxLength(255).IsRequired().HasColumnName("name");
            entity.Property(gb => gb.ServiceDescription).HasMaxLength(1000).HasColumnName("servicedescription");
            entity.Property(gb => gb.CoverImageUrl).HasMaxLength(500).HasColumnName("coverimageurl");
            entity.Property(gb => gb.IsActive).HasColumnName("isactive").HasDefaultValue(true);

            entity.HasOne(gb => gb.Gym)
                .WithMany(g => g.GymBranches) 
                .HasForeignKey(gb => gb.GymID);

            entity.HasOne(gb => gb.Location)
                .WithMany()
                .HasForeignKey(gb => gb.LocationID);
        }
    }
}