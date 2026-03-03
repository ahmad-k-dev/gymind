namespace GYMIND.API.DTOs.Notifications
{
    public class CreateNotificationDto
    {
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
    }

    public class NotificationDto
    {
        public Guid NotificationID { get; set; }
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime SentAt { get; set; }
        public Guid? GymId { get; set; }
        public Guid? GymBranchID { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
    }
}
