namespace GYMIND.API.Entities
{
    public class Gym
    {
        public Guid GymID { get; set; }
        public string Name { get; set; } = null!;
        
        public string? Description { get; set; } = null!;
        public bool IsApproved { get; set; }
        public DateTime CreatedAt { get; set; }

        public ICollection<GymBranch> GymBranches { get; set; } = new List<GymBranch>();

        public ICollection<Membership> Memberships { get; set; } = new List<Membership>();
    }
}

