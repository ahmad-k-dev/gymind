using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GYMIND.API.Data.Configuration
{
    public class GymSessionConfiguration : IEntityTypeConfiguration<Entities.GymSession>
    {
        public void Configure(EntityTypeBuilder<Entities.GymSession> entity)
        {
            entity.ToTable("gymsession");
            entity.HasKey(gs => gs.GymSessionID);

            // High precision for coordinates
            entity.Property(gs => gs.CheckInLat).HasPrecision(18, 6);
            entity.Property(gs => gs.CheckInLong).HasPrecision(18, 6);

            entity.HasOne(gs => gs.User).WithMany().HasForeignKey(gs => gs.UserID);
            entity.HasOne(gs => gs.GymBranch).WithMany().HasForeignKey(gs => gs.GymBranchID);
        }
    }
}
