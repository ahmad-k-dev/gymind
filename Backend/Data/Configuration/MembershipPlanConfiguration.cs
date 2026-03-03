using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GYMIND.API.Data.Configuration
{
    public class MembershipPlanConfiguration
    {
        public void Configure(EntityTypeBuilder<Entities.MembershipPlan> entity)
        {
            
                entity.HasKey(mp => mp.MembershipPlanID);
                entity.Property(mp => mp.PlanName).HasMaxLength(100);
                entity.Property(mp => mp.Price).HasColumnType("decimal(18,2)");
                entity.Property(mp => mp.Description).HasMaxLength(500);

                
            }
    }
}
