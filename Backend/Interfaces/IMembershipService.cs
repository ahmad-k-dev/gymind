using GYMIND.API.DTOs;

namespace GYMIND.API.Interfaces
{
    public interface IMembershipService
    {
        // User Actions
        Task<List<MembershipSummaryDto>> GetMyMembershipsAsync(Guid userId);
        Task<MembershipDisplayDto?> GetMembershipDetailsAsync(Guid membershipId, Guid userId);

        // Admin Actions
        Task<MembershipSummaryDto> IssueMembershipAsync(Guid userId, CreateMembershipDto dto);
        Task<MembershipSummaryDto?> UpdateMembershipAsync(Guid membershipId, MembershipUpdateDto dto);
        Task<bool> CancelMembershipAsync(Guid membershipId);
        Task<bool> VerifyMembershipStatusAsync(Guid membershipId);
        Task<List<AdminMembershipViewDto>> GetGymMembersAsync(Guid gymId);
    }
}