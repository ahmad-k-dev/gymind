namespace GYMIND.API.Entities
{
    public class Role
    {
        public int RoleID { get; set; }
        public string Name { get; set; } = null!;

        public string Description { get; set; }

        
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}
