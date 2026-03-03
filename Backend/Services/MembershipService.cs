using GYMIND.API.Data;
using GYMIND.API.Entities;
using GYMIND.API.Interfaces;
using GYMIND.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace GYMIND.API.Services
{
    public class MembershipService : IMembershipService
    {
        private readonly SupabaseDbContext _context;

        public MembershipService(SupabaseDbContext context)
        {
            _context = context;
        }

        // Issue a New Membership
        public async Task<MembershipSummaryDto> IssueMembershipAsync(Guid userId, CreateMembershipDto dto)
        {
            var membership = new Membership
            {
                MembershipID = Guid.NewGuid(),
                UserID = userId,
                GymID = dto.GymID,
                GymBranchID = dto.GymBranchID ?? Guid.Empty, // Default to empty if brand-wide
                IsMember = true,
                JoinedAt = DateTime.UtcNow,
                ExpiryDate = dto.ExpiryDate,
                Description = dto.Description
            };

            _context.Memberships.Add(membership);
            await _context.SaveChangesAsync();

            var gym = await _context.Gym.FindAsync(dto.GymID);

            return new MembershipSummaryDto
            {
                MembershipID = membership.MembershipID,
                GymName = gym?.Name ?? "Unknown Gym",
                IsActive = membership.IsMember,
                ExpiryDate = membership.ExpiryDate
            };
        }

        // Update Membership (Admin)
        public async Task<MembershipSummaryDto?> UpdateMembershipAsync(Guid membershipId, MembershipUpdateDto dto)
        {
            var membership = await _context.Memberships
                .Include(m => m.Gym)
                .FirstOrDefaultAsync(m => m.MembershipID == membershipId);

            if (membership == null) return null;

            membership.IsMember = dto.IsMember;
            membership.ExpiryDate = dto.ExpiryDate;
            membership.Description = dto.Description ?? membership.Description;

            // Handle logical reactivation/deactivation
            if (dto.IsMember) membership.RemovedAt = null;
            else if (membership.RemovedAt == null) membership.RemovedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new MembershipSummaryDto
            {
                MembershipID = membership.MembershipID,
                GymName = membership.Gym.Name,
                IsActive = membership.IsMember,
                ExpiryDate = membership.ExpiryDate
            };
        }

        // Cancel Membership (Logical Delete)
        public async Task<bool> CancelMembershipAsync(Guid membershipId)
        {
            var membership = await _context.Memberships.FindAsync(membershipId);
            if (membership == null) return false;

            membership.IsMember = false;
            membership.RemovedAt = DateTime.UtcNow;

            return await _context.SaveChangesAsync() > 0;
        }

        // 4️⃣ Verify Status (For Front-Desk Scanning)
        public async Task<bool> VerifyMembershipStatusAsync(Guid membershipId)
        {
            return await _context.Memberships
                .AnyAsync(m => m.MembershipID == membershipId
                            && m.IsMember
                            && m.RemovedAt == null
                            && (m.ExpiryDate == null || m.ExpiryDate > DateTime.UtcNow));
        }

        // 5️⃣ Get User's Active Digital Passes
        public async Task<List<MembershipSummaryDto>> GetMyMembershipsAsync(Guid userId)
        {
            return await _context.Memberships
                .Where(m => m.UserID == userId && m.RemovedAt == null)
                .Select(m => new MembershipSummaryDto
                {
                    MembershipID = m.MembershipID,
                    GymName = m.Gym.Name,
                    IsActive = m.IsMember,
                    ExpiryDate = m.ExpiryDate
                })
                .ToListAsync();
        }

        public async Task<List<AdminMembershipViewDto>> GetGymMembersAsync(Guid gymId)
        {
            return await _context.Memberships
                .Where(m => m.GymID == gymId)
                .Include(m => m.User)
                .Select(m => new AdminMembershipViewDto
                {
                    MembershipID = m.MembershipID,
                    UserID = m.UserID,
                    UserFullName = m.User.FullName,
                    IsMember = m.IsMember,
                    JoinedAt = m.JoinedAt,
                    ExpiryDate = m.ExpiryDate
                })
                .ToListAsync();
        }

        public async Task<MembershipDisplayDto?> GetMembershipDetailsAsync(Guid membershipId, Guid userId)
        {
            return await _context.Memberships
                .Where(m => m.MembershipID == membershipId && m.UserID == userId)
                .Select(m => new MembershipDisplayDto
                {
                    MembershipID = m.MembershipID,
                    GymName = m.Gym.Name,
                    IsActive = m.IsMember,
                    ExpiryDate = m.ExpiryDate,
                    Description = m.Description
                })
                .FirstOrDefaultAsync();
        }
    }
}