using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GYMIND.API.Data.Configuration
{
    public class MembershipConfiguration : IEntityTypeConfiguration<Entities.Membership>
    {
        public void Configure(EntityTypeBuilder<Entities.Membership> entity)
        {
            entity.ToTable("membership");
            entity.HasKey(m => m.MembershipID);
                

                //Add Gym relationship + map columns
            entity.Property(m => m.MembershipID).HasColumnName("membershipid");
            entity.Property(m => m.UserID).HasColumnName("userid");
            entity.Property(m => m.GymID).HasColumnName("gymid");
            entity.Property(m => m.GymBranchID).HasColumnName("gymbranchid");
            entity.Property(m => m.IsMember).HasColumnName("ismember");
            entity.Property(m => m.JoinedAt).HasColumnName("joinedat");
            entity.Property(m => m.RemovedAt).HasColumnName("removedat");


            entity.HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserID);

            entity.HasOne(m => m.Gym)
                .WithMany(g => g.Memberships)
                .HasForeignKey(m => m.GymID);

            entity.HasOne(m => m.GymBranch)
                  .WithMany(gb => gb.Memberships)
                  .HasForeignKey(m => m.GymBranchID);

        }
    }
}
