using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using GYMIND.API.Entities;

namespace GYMIND.API.Data.Configuration
{
    public class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
    {
        public void Configure(EntityTypeBuilder<Announcement> entity)
        {
            entity.ToTable("announcement");
            entity.ToTable("announcements"); // تأكد من اسم الجدول الفعلي

            entity.HasKey(a => a.AnnouncementID);

            entity.Property(a => a.AnnouncementID)
                .HasColumnName("announcementid");

            entity.Property(a => a.GymBranchID)
                .HasColumnName("gymbranchid")
                .IsRequired();

            entity.Property(a => a.Title)
                .HasColumnName("title")
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(a => a.Content)
                .HasColumnName("content")
                .IsRequired();

            entity.Property(a => a.CreatedAt)
                .HasColumnName("createdat")
                .IsRequired();

            entity.Property(a => a.ExpiresAt)
                .HasColumnName("expiresat");

            entity.HasOne(a => a.GymBranch)
                .WithMany()
                .HasForeignKey(a => a.GymBranchID)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
