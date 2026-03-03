using GYMIND.API.DTOs;

namespace GYMIND.API.Interfaces
{
    public interface IGymSessionService
    {
        Task<bool> StartGymSessionAsync(Guid userId, CheckInDto dto);
        Task<bool> EndGymSessionAsync(Guid userId);
         Task<IEnumerable<GymSessionHistoryDto>> GetUserHistoryAsync(Guid userId);
        Task<IEnumerable<ActiveSessionDto>> GetActiveSessionForBranchAsync(Guid gymBranchId);
    }
}
