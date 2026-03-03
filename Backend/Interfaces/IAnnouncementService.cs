using GYMIND.API.DTOs;

namespace GYMIND.API.Interfaces
{
    public interface IAnnouncementService
    {
        // Create announcement for specific branch
        Task CreateForBranchAsync(Guid branchId, CreateAnnouncementDto dto);

        // Create announcement for all branches of a gym
        Task CreateForGymAsync(Guid gymId, CreateAnnouncementDto dto);

        // Get announcements for current user (based on membership)
        Task<List<AnnouncementDto>> GetMyAnnouncementsAsync();

        // Get announcements for specific branch
        Task<List<AnnouncementDto>> GetByBranchAsync(Guid branchId);

        // Delete announcement
        Task DeleteAsync(Guid announcementId);
    }
}
