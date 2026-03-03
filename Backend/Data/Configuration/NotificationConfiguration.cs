using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GYMIND.API.Data.Configuration
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Entities.Notification>
    {
        public void Configure(EntityTypeBuilder<Entities.Notification> entity)
        {
            entity.ToTable("notification");
            entity.HasKey(n => n.NotificationID);
            entity.Property(n => n.NotificationID).HasColumnName("notificationid");
            entity.Property(n => n.UserID).HasColumnName("userid");
            entity.Property(n => n.GymID).HasColumnName("gymid");
            entity.Property(n => n.GymBranchID).HasColumnName("gymbranchid");
            entity.Property(n => n.SentAt).HasColumnName("sentat");
            entity.Property(n => n.Title).HasColumnName("title").IsRequired().HasMaxLength(200);
            entity.Property(n => n.Message).HasColumnName("message").IsRequired().HasMaxLength(500);



            // relationships (Guid?)
            entity.HasOne(n => n.User).WithMany().HasForeignKey(n => n.UserID).IsRequired(false);
            entity.HasOne(n => n.GymBranch).WithMany().HasForeignKey(n => n.GymBranchID).IsRequired(false);
        }
    }
}

