using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GYMIND.API.Data.Configuration
{
    public class LocationConfiguration : IEntityTypeConfiguration<Entities.Location>
    {
        public void Configure(EntityTypeBuilder<Entities.Location> entity)
        {
            entity.ToTable("locations");
            entity.HasKey(l => l.LocationID);
            entity.Property(l => l.Latitude).HasPrecision(18, 6);
            entity.Property(l => l.Longitude).HasPrecision(18, 6);
        }
    }
}
