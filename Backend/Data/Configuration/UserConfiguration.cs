using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


    namespace GYMIND.API.Data.Configuration
{

    public class UserConfiguration : IEntityTypeConfiguration<Entities.User>
    {
        public void Configure(EntityTypeBuilder<Entities.User> entity)
        {

            entity.ToTable("users"); // map to table
            entity.HasKey(u => u.UserID); // primary key

            // Columns
            entity.Property(u => u.UserID).HasColumnName("userid");
            entity.Property(u => u.FullName).HasColumnName("fullname");
            entity.Property(u => u.Email).HasColumnName("email");
            entity.Property(u => u.Phone).HasColumnName("phone");
            entity.Property(u => u.PasswordHash).HasColumnName("passwordhash");
            entity.Property(u => u.Biography)
                .HasColumnName("biography")
                .HasMaxLength(500); // new column
            entity.Property(u => u.ProfilePictureUrl).HasColumnName("profilepictureurl");// new column
            entity.Property(u => u.HasChangedName).HasDefaultValue(false).HasColumnName("haschangedname");// new column
            entity.Property(u => u.MedicalConditions).HasColumnName("medicalconditions");// new column
            entity.Property(u => u.EmergencyContact).HasColumnName("emergencycontact");// new column
            entity.Property(u => u.RefreshToken).HasColumnName("refreshtoken");// new column
            entity.Property(u => u.RefreshTokenExpiry).HasColumnName("refreshtokenexpiry");// new column

            entity.Property(u => u.Location).HasColumnName("location");
            entity.Property(u => u.DateOfBirth).HasColumnName("dateofbirth");
            // entity.Property(u => u.MembershipID).HasColumnName("membershipid");
            entity.Property(u => u.Gender).HasColumnName("gender");
            entity.Property(u => u.CreatedAt).HasColumnName("createdat");
            entity.Property(u => u.IsActive).HasColumnName("isactive").HasDefaultValue(true);

            // Relationships
            entity.HasMany(u => u.UserRole)
                .WithOne(ur => ur.User)
                .HasForeignKey(ur => ur.UserID)
                .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
