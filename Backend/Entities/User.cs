namespace GYMIND.API.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;

public class User
{
    //Properties      
    public Guid UserID { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = null!;
    
    public string? Location { get; set; }
    public DateTime? DateOfBirth { get; set; }
    
    public string? Gender { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }

    // new properties for profile
    public string? Biography { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool HasChangedName { get; set; } = false;
    public string? MedicalConditions { get; set; }
    public string? EmergencyContact { get; set; }
    public decimal? Height { get; set; } // in centimeters
    public decimal? Weight { get; set; } // in kilograms

    // tokens
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
 
    [NotMapped]
    public object? Membership { get; set; }

    [NotMapped]
    public object? MembershipID { get; set; }



    // Navigation properties
    public ICollection<UserRole> UserRole { get; set; } = new List<UserRole>();
    public ICollection<UserNotification> UserNotifications { get; set; } 
}



