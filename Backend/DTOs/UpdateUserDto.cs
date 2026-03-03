using System.ComponentModel.DataAnnotations;

namespace GYMIND.API.DTOs
{
    // For admins to assign roles to users
    public record UpdateUserDto // edit later for stricter validation
    {
        public string? FullName { get; set; }
        
        public string? Phone { get; set; }


        // Takes different role IDs to add/remove from user. no duplicates allowed. if roleID is already assigned to user, it will be removed. 
        public HashSet<int> RoleIDs { get; set; } = new HashSet<int>();
    }
}
