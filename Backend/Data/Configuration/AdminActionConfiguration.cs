using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GYMIND.API.Data.Configuration
{
    public class GymAdminActionConfiguration : IEntityTypeConfiguration<Entities.GymAdminAction>
    {
        public void Configure(EntityTypeBuilder<Entities.GymAdminAction> entity)
        {
            entity.ToTable("gymadminaction");
            entity.HasKey(gaa => gaa.GymAdminActionID);
            entity.Property(gaa => gaa.GymAdminActionID).HasColumnName("gymadminactionid");

            entity.Property(gaa => gaa.ActionType).HasMaxLength(100).IsRequired();
            entity.Property(gaa => gaa.TargetEntity).HasMaxLength(100).IsRequired();
            entity.Property(gaa => gaa.Outcome).HasMaxLength(255);

            entity.HasOne(gaa => gaa.User)
                .WithMany()
                .HasForeignKey(gaa => gaa.UserID);

            entity.HasOne(gaa => gaa.GymBranch)
                .WithMany()
                .HasForeignKey(gaa => gaa.GymBranchID);
        }
    }

    public class SystemAdminActionConfiguration : IEntityTypeConfiguration<Entities.SystemAdminAction>
    {
        public void Configure(EntityTypeBuilder<Entities.SystemAdminAction> entity)
        {
            entity.ToTable("systemadminactions");
            entity.HasKey(saa => saa.SystemAdminActionID);
            entity.Property(saa => saa.SystemAdminActionID).HasColumnName("systemadminactionid");

            entity.Property(saa => saa.ActionType).HasMaxLength(100).IsRequired();
            entity.Property(saa => saa.TargetEntity).HasMaxLength(100).IsRequired();

            entity.HasOne(saa => saa.User)
                .WithMany()
                .HasForeignKey(saa => saa.UserID);
        }
    }
}
