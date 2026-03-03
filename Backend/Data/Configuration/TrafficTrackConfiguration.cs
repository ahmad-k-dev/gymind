using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GYMIND.API.Data.Configuration
{
    public class TrafficTrackConfiguration : IEntityTypeConfiguration<Entities.TrafficTrack>
    {
        public void Configure(EntityTypeBuilder<Entities.TrafficTrack> entity)
        {
            entity.ToTable("traffictrack");
            entity.HasKey(tt => tt.TrafficTrackID);
            entity.Property(tt => tt.CapacityPercentage).HasPrecision(5, 2); // e.g., 99.99

            entity.HasOne(tt => tt.GymBranch).WithMany().HasForeignKey(tt => tt.GymBranchID);
        }
    }
}
