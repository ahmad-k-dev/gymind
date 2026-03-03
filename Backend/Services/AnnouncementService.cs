using GYMIND.API.Data;
using GYMIND.API.DTOs;
using GYMIND.API.Entities;
using GYMIND.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GYMIND.API.Services
{
    public class AnnouncementService : IAnnouncementService
    {
        private readonly SupabaseDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AnnouncementService(
            SupabaseDbContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentUserId()
        {
            var userId = _httpContextAccessor.HttpContext?
                .User?
                .FindFirst(ClaimTypes.NameIdentifier)?
                .Value;

            return Guid.Parse(userId!);
        }

        // =========================================
        // 1️⃣ Create For Specific Branch
        // =========================================
        public async Task CreateForBranchAsync(Guid branchId, CreateAnnouncementDto dto)
        {
            var branchExists = await _context.GymBranches
                .AnyAsync(b => b.GymBranchID == branchId);

            if (!branchExists)
                throw new Exception("Branch not found");

            var announcement = new Announcement
            {
                AnnouncementID = Guid.NewGuid(),
                GymBranchID = branchId,
                Title = dto.Title,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = dto.ExpiresAt
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();
        }

        // =========================================
        // 2️⃣ Create For Gym (All Branches)
        // =========================================
        public async Task CreateForGymAsync(Guid gymId, CreateAnnouncementDto dto)
        {
            var branches = await _context.GymBranches
                .Where(b => b.GymID == gymId)
                .Select(b => b.GymBranchID)
                .ToListAsync();

            if (!branches.Any())
                throw new Exception("No branches found for this gym");

            var announcements = branches.Select(branchId => new Announcement
            {
                AnnouncementID = Guid.NewGuid(),
                GymBranchID = branchId,
                Title = dto.Title,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = dto.ExpiresAt
            }).ToList();

            _context.Announcements.AddRange(announcements);
            await _context.SaveChangesAsync();
        }

        // =========================================
        // 3️⃣ Get My Announcements
        // =========================================
        public async Task<List<AnnouncementDto>> GetMyAnnouncementsAsync()
        {
            var userId = GetCurrentUserId();

            // Get active membership
            var membership = await _context.Memberships
                .Where(m => m.UserID == userId &&
                            m.IsMember &&
                            m.RemovedAt == null)
                .FirstOrDefaultAsync();

            if (membership == null)
                return new List<AnnouncementDto>();

            var now = DateTime.UtcNow;

            var announcements = await _context.Announcements
                .Where(a =>
                    _context.GymBranches
                        .Where(b => b.GymID == membership.GymID)
                        .Select(b => b.GymBranchID)
                        .Contains(a.GymBranchID)
                    &&
                    (a.ExpiresAt == null || a.ExpiresAt > now))
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new AnnouncementDto
                {
                    AnnouncementID = a.AnnouncementID,
                    GymBranchID = a.GymBranchID,
                    Title = a.Title,
                    Content = a.Content,
                    CreatedAt = a.CreatedAt,
                    ExpiresAt = a.ExpiresAt
                })
                .ToListAsync();

            return announcements;
        }

        // =========================================
        // 4️⃣ Get By Branch
        // =========================================
        public async Task<List<AnnouncementDto>> GetByBranchAsync(Guid branchId)
        {
            var now = DateTime.UtcNow;

            return await _context.Announcements
                .Where(a =>
                    a.GymBranchID == branchId &&
                    (a.ExpiresAt == null || a.ExpiresAt > now))
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new AnnouncementDto
                {
                    AnnouncementID = a.AnnouncementID,
                    GymBranchID = a.GymBranchID,
                    Title = a.Title,
                    Content = a.Content,
                    CreatedAt = a.CreatedAt,
                    ExpiresAt = a.ExpiresAt
                })
                .ToListAsync();
        }

        // =========================================
        // 5️⃣ Delete Announcement
        // =========================================
        public async Task DeleteAsync(Guid announcementId)
        {
            var announcement = await _context.Announcements
                .FirstOrDefaultAsync(a => a.AnnouncementID == announcementId);

            if (announcement == null)
                throw new Exception("Announcement not found");

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();
        }
    }
}
