using GYMIND.API.DTOs.Notifications;

namespace GYMIND.API.Interfaces
{
    public interface INotificationService
    {
        Task CreateForGymAsync(Guid gymId, CreateNotificationDto dto);

        Task CreateForBranchAsync(Guid branchId, CreateNotificationDto dto);

        Task<List<NotificationDto>> GetMyNotificationsAsync();

        Task MarkAsReadAsync(Guid notificationId);
    }
}
