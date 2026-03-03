namespace GYMIND.API.Entities
{
    public class GymSession
    {
        public Guid GymSessionID { get; set; }
        public Guid UserID { get; set; }
        public Guid GymBranchID { get; set; }
        public DateTime CheckInTime { get; set; }
        public DateTime CheckOutTime { get; set; }
        public int? SessionDuration { get; set; } // Duration in minutes
        public decimal CheckInLat { get; set; }
        public decimal CheckInLong { get; set; }
        public bool IsVerifiedLocation { get; set; }

        public User User { get; set; } = null!;
        public GymBranch GymBranch { get; set; } = null!;
    }
}
