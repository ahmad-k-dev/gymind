using GYMIND.API.DTOs;
using System.ComponentModel.DataAnnotations;


namespace GYMIND.API.Entities
{
    public class UserRole
    {
        public int UserRoleID { get; set; }
        public Guid UserID { get; set; }

        [MinLength(1)]
        public int RoleID { get; set; }

        public User User { get; set; } = null!;
        public Role Role { get; set; } = null!;

        
    }
}
