namespace GYMIND.API.Entities
{
    public class Notification
    {
        public Guid NotificationID { get; set; }
        public Guid? UserID { get; set; }
        public Guid? GymID { get; set; }
        public Guid? GymBranchID { get; set; }
        // public Guid? GymId { get; set; }
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime SentAt { get; set; }
      //  public bool IsRead { get; set; }
        public User? User { get; set; }
        public GymBranch? GymBranch { get; set; }
        public ICollection<UserNotification> UserNotifications { get; set; }
        = new List<UserNotification>();

        public Gym? Gym { get; set; }
    }
}
