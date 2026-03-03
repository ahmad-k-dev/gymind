namespace GYMIND.API.Entities
{
    public class GymAdminAction
    {
        public Guid GymAdminActionID { get; set; }
        public Guid UserID { get; set; }
        public Guid GymBranchID { get; set; }
        public string ActionType { get; set; } = null!;
        public string TargetEntity { get; set; } = null!;
        public Guid TargetID { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Outcome { get; set; } = null!;

        public User User { get; set; } = null!;
        public GymBranch GymBranch { get; set; } = null!;
    }
}
