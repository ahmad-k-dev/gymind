namespace GYMIND.API.Entities
{
    public class SystemAdminAction
    {
        public Guid SystemAdminActionID { get; set; }
        public Guid UserID { get; set; }
        public string ActionType { get; set; } = null!;
        public string TargetEntity { get; set; } = null!;
        public Guid TargetID { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Outcome { get; set; } = null!;

        public User User { get; set; } = null!;
    }
}
