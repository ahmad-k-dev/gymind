namespace GYMIND.API.Entities
{
    public class Membership
    {
        public Guid MembershipID { get; set; }
        public Guid UserID { get; set; }
        public Guid GymID { get; set; }
        public Guid? GymBranchID { get; set; }
        // public Guid MembershipPlanID { get; set; }
        public bool IsMember { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public DateTime JoinedAt { get; set; }
        public DateTime? RemovedAt { get; set; }
        public string? Description { get; set; }

        public User User { get; set; } = null!;
        public Gym Gym { get; set; } = null!;

        public GymBranch? GymBranch { get; set; } = null!;
    }
}
