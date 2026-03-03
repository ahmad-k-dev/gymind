using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GYMIND.API.Data.Configuration
{
    public class UserNotificationConfiguration : IEntityTypeConfiguration<Entities.UserNotification>
    {
        public void Configure(EntityTypeBuilder<Entities.UserNotification> entity)
        {
            entity.ToTable("usernotification");
            entity.HasKey(un => un.UserNotificationID);

            entity.Property(un => un.UserNotificationID).HasColumnName("usernotificationid");
            
entity.Property(un => un.NotificationID).HasColumnName("notificationid");
            entity.Property(un => un.ReadStatus).HasColumnName("readstatus").HasDefaultValue(false);
            entity.Property(un => un.ReadAt).HasColumnName("readat");

            // Unique constraint to prevent duplicate notifications for the same user
            entity.HasIndex(un => new { un.UserID, un.NotificationID }).IsUnique();

            entity.HasOne(un => un.User)
                .WithMany(u => u.UserNotifications) 
                .HasForeignKey(un => un.UserID)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(un => un.Notification)
                .WithMany(n => n.UserNotifications)
                .HasForeignKey(un => un.NotificationID);
        }
    }
}
