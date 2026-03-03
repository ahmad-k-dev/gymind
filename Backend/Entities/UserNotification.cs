using System.ComponentModel.DataAnnotations.Schema;

namespace GYMIND.API.Entities
{
    public class UserNotification
    {
        public Guid UserNotificationID { get; set; }
        public Guid UserID { get; set; }
        public Guid NotificationID { get; set; }
        public bool ReadStatus { get; set; }
        public DateTime? ReadAt { get; set; }

        
        public User User { get; set; } = null!;
        public Notification Notification { get; set; } = null!;
    }
}
